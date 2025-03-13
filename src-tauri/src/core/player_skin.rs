use base64::{engine::general_purpose, Engine};
use image::{imageops::FilterType, GenericImageView, ImageFormat};
use reqwest;
use std::io::Cursor;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Config, Runtime,
};

pub fn init<R: Runtime>() -> TauriPlugin<R, Config> {
    Builder::<R, Config>::new("player-skin")
        .invoke_handler(tauri::generate_handler![get_skin_texture, get_face_texture])
        .build()
}

#[tauri::command]
async fn get_skin_texture(uuid: String) -> Result<String, String> {
    let profile_url = format!(
        "https://sessionserver.mojang.com/session/minecraft/profile/{}",
        uuid
    );
    let profile_response = reqwest::get(&profile_url)
        .await
        .map_err(|e| e.to_string())?;
    let profile_json: serde_json::Value =
        profile_response.json().await.map_err(|e| e.to_string())?;
    let texture_property = profile_json["properties"]
        .as_array()
        .and_then(|props| props.iter().find(|p| p["name"] == "textures"))
        .ok_or("Texture property not found")?;
    let texture_base64 = texture_property["value"]
        .as_str()
        .ok_or("Texture value not found")?;
    let texture_json: serde_json::Value = serde_json::from_slice(
        &general_purpose::STANDARD
            .decode(texture_base64)
            .map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;

    let skin_url = texture_json["textures"]["SKIN"]["url"]
        .as_str()
        .ok_or("Skin URL not found")?;

    let skin_bytes = reqwest::get(skin_url)
        .await
        .map_err(|e| e.to_string())?
        .bytes()
        .await
        .map_err(|e| e.to_string())?;

    let base64_image = general_purpose::STANDARD.encode(&skin_bytes);

    Ok(format!("data:image/png;base64,{}", base64_image))
}

#[tauri::command]
async fn get_face_texture(uuid: String) -> Result<String, String> {
    let skin_base64 = get_skin_texture(uuid).await?;

    let raw_base64 = skin_base64.replace("data:image/png;base64,", "");
    let skin_bytes = general_purpose::STANDARD
        .decode(raw_base64)
        .map_err(|e| e.to_string())?;

    let skin_image = image::load_from_memory(&skin_bytes).map_err(|e| e.to_string())?;

    let face = skin_image.crop_imm(8, 8, 8, 8);
    let face_overlay = skin_image.crop_imm(40, 8, 8, 8);

    let scaled_face = face.resize(64, 64, FilterType::Nearest);
    let scaled_overlay = face_overlay.resize(64, 64, FilterType::Nearest);

    let mut combined_face = scaled_face.to_rgba8();
    for (x, y, pixel) in scaled_overlay.pixels() {
        if pixel[3] != 0 {
            combined_face.put_pixel(x, y, pixel);
        }
    }

    let mut buffer = Vec::new();
    combined_face
        .write_to(&mut Cursor::new(&mut buffer), ImageFormat::Png)
        .map_err(|e| e.to_string())?;
    let base64_image = general_purpose::STANDARD.encode(&buffer);

    Ok(format!("data:image/png;base64,{}", base64_image))
}
