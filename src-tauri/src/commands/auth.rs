use minecraft_msa_auth::MinecraftAuthenticationResponse;
use tauri::AppHandle;

use crate::core::msa_auth::{create_minecraft_auth, MinecraftAuthError};

#[tauri::command]
pub async fn microsoft_auth(
    app: AppHandle,
) -> Result<MinecraftAuthenticationResponse, MinecraftAuthError> {
    let auth_response = create_minecraft_auth(app).await?;
    Ok(auth_response)
}
