use anyhow::Context;
use reqwest::Client;
use serde::Deserialize;
use std::io::Cursor;

use base64::Engine;
use image::{ImageBuffer, RgbaImage};

#[tauri::command]
pub async fn player_skin(uuid: String, scale: u32) -> Result<String, String> {
    fetch_skin_inner(&uuid, false, scale).await
}

#[tauri::command]
pub async fn player_face(uuid: String, scale: u32) -> Result<String, String> {
    fetch_skin_inner(&uuid, true, scale).await
}

async fn fetch_skin_inner(uuid: &str, face_only: bool, scale: u32) -> Result<String, String> {
    let client = Client::new();

    // let uuid = if is_uuid(uuid_or_name) {
    //     uuid_or_name.to_string()
    // } else {
    //     match username_to_uuid(&client, uuid_or_name).await {
    //         Ok(u) => u,
    //         Err(e) => return Err(format!("failed to resolve username: {}", e)),
    //     }
    // };

    let texture_url = match get_skin_url_from_session(&client, &uuid).await {
        Ok(Some(url)) => url,
        Ok(None) => return Err("no skin URL found for player".to_string()),
        Err(e) => return Err(format!("failed to fetch texture info: {}", e)),
    };

    let bytes = client
        .get(&texture_url)
        .send()
        .await
        .context("failed to GET skin url")
        .map_err(|e| e.to_string())?
        .bytes()
        .await
        .map_err(|e| e.to_string())?;

    // Load and process the image
    let img =
        image::load_from_memory(&bytes).map_err(|e| format!("failed to load image: {}", e))?;

    if face_only {
        // Crop and scale face
        let face_png = crop_face(&img, scale)?;
        let b64 = base64::engine::general_purpose::STANDARD.encode(&face_png);
        Ok(format!("data:image/png;base64,{}", b64))
    } else {
        // Scale full skin if needed
        let final_img = if scale > 1 {
            img.resize(64 * scale, 64 * scale, image::imageops::FilterType::Nearest)
        } else {
            img
        };

        // Convert to PNG bytes
        let mut buf = Vec::new();
        final_img
            .write_to(&mut Cursor::new(&mut buf), image::ImageOutputFormat::Png)
            .map_err(|e| format!("failed to encode PNG: {}", e))?;

        let b64 = base64::engine::general_purpose::STANDARD.encode(&buf);
        Ok(format!("data:image/png;base64,{}", b64))
    }
}

async fn get_skin_url_from_session(client: &Client, uuid: &str) -> anyhow::Result<Option<String>> {
    // session server profile which contains base64 textures property
    let url = format!(
        "https://sessionserver.mojang.com/session/minecraft/profile/{}?unsigned=false",
        uuid
    );
    let resp = client.get(url).send().await?;
    if !resp.status().is_success() {
        anyhow::bail!("session server returned non-success status")
    }

    #[derive(Deserialize)]
    struct ProfileProperty {
        name: String,
        value: String,
    }

    #[derive(Deserialize)]
    struct ProfileResp {
        id: String,
        name: String,
        properties: Vec<ProfileProperty>,
    }

    let parsed: ProfileResp = resp.json().await?;

    // find textures property and decode base64
    if let Some(prop) = parsed.properties.into_iter().find(|p| p.name == "textures") {
        let decoded = base64::engine::general_purpose::STANDARD
            .decode(prop.value)
            .context("failed to decode textures property")?;
        let v: serde_json::Value = serde_json::from_slice(&decoded)?;
        if let Some(skin_url) = v
            .get("textures")
            .and_then(|t| t.get("SKIN"))
            .and_then(|s| s.get("url"))
            .and_then(|u| u.as_str())
        {
            return Ok(Some(skin_url.to_string()));
        }
    }

    Ok(None)
}

fn crop_face(img: &image::DynamicImage, scale: u32) -> Result<Vec<u8>, String> {
    let rgba = img.to_rgba8();

    // base face coords in modern 64x64 skins: (8,8) size 8x8
    let face_x = 8u32;
    let face_y = 8u32;
    let overlay_x = 40u32;
    let overlay_y = 8u32;

    // helper to safely copy a subimage (returns 8x8 image or transparent if out of bounds)
    let sub = |src: &RgbaImage, x: u32, y: u32| -> ImageBuffer<image::Rgba<u8>, Vec<u8>> {
        let mut out = ImageBuffer::from_pixel(8, 8, image::Rgba([0, 0, 0, 0]));
        for yy in 0..8u32 {
            for xx in 0..8u32 {
                let sx = x + xx;
                let sy = y + yy;
                if sx < src.width() && sy < src.height() {
                    let p = src.get_pixel(sx, sy);
                    out.put_pixel(xx, yy, *p);
                }
            }
        }
        out
    };

    let base = sub(&rgba, face_x, face_y);
    let overlay = sub(&rgba, overlay_x, overlay_y);

    // composite overlay over base
    let mut final_img = ImageBuffer::from_pixel(8, 8, image::Rgba([0, 0, 0, 0]));

    for y in 0..8u32 {
        for x in 0..8u32 {
            let b = base.get_pixel(x, y);
            let o = overlay.get_pixel(x, y);
            // If overlay pixel has non-zero alpha, use overlay, else base
            let out_px = if o[3] > 0 { *o } else { *b };
            final_img.put_pixel(x, y, out_px);
        }
    }

    // Scale if needed
    let final_img = if scale > 1 {
        image::DynamicImage::ImageRgba8(final_img).resize(
            8 * scale,
            8 * scale,
            image::imageops::FilterType::Nearest,
        )
    } else {
        image::DynamicImage::ImageRgba8(final_img)
    };

    // encode as PNG
    let mut buf = Vec::new();
    final_img
        .write_to(&mut Cursor::new(&mut buf), image::ImageOutputFormat::Png)
        .map_err(|e| format!("failed to write PNG: {}", e))?;

    Ok(buf)
}
