use crate::utils::constants::{AUTHORIZE_URL, MSA_CLIENT_ID, REDIRECT_URL, TOKEN_URL};
use crate::utils::window::{create_window, WindowOptions};
use log::debug;
use minecraft_msa_auth::{
    MinecraftAuthenticationResponse, MinecraftAuthorizationError, MinecraftAuthorizationFlow,
};
use oauth2::basic::{BasicClient, BasicErrorResponseType};
use oauth2::{
    AsyncHttpClient, AuthType, AuthUrl, AuthorizationCode, ClientId, CsrfToken, PkceCodeChallenge,
    RedirectUrl, RequestTokenError, Scope, StandardErrorResponse, TokenResponse, TokenUrl,
};
use reqwest::{Client, ClientBuilder, Url};
use serde::{Serialize, Serializer};
use std::borrow::Cow;
use std::collections::HashMap;
use std::io;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, WebviewUrl, WindowEvent};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::TcpListener;
use url::ParseError;

pub async fn create_minecraft_auth(
    app: AppHandle,
) -> Result<MinecraftAuthenticationResponse, MinecraftAuthError> {
    let client = BasicClient::new(ClientId::new(MSA_CLIENT_ID.to_string()))
        .set_auth_uri(AuthUrl::new(AUTHORIZE_URL.to_string())?)
        .set_auth_type(AuthType::RequestBody)
        .set_token_uri(TokenUrl::new(TOKEN_URL.to_string())?)
        .set_redirect_uri(RedirectUrl::new(REDIRECT_URL.to_string())?);

    let (pkce_code_challenge, pkce_code_verifier) = PkceCodeChallenge::new_random_sha256();

    let (authorize_url, csrf_state) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("XboxLive.signin offline_access".to_string()))
        .set_pkce_challenge(pkce_code_challenge)
        .add_extra_param("prompt", "select_account")
        .add_extra_param("cobrandid", "8058f65d-ce06-4c30-9559-473c9275a65d")
        .url();

    debug!("auth url: {:?}", &authorize_url.to_string());

    let auth_window = create_window(
        &app,
        WindowOptions {
            title: "Decent Client - Microsoft Authentication".to_string(),
            identifier: "microsoft-auth".to_string(),
            url: WebviewUrl::External(authorize_url),
            width: 475.0,
            height: 600.0,
            resizable: Some(false),
            decorations: Some(true),
            maximizable: Some(false),
            ..WindowOptions::default()
        },
    )?;

    let is_window_closed = Arc::new(Mutex::new(false));
    {
        let is_window_closed = Arc::clone(&is_window_closed);
        auth_window.on_window_event(move |event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                *is_window_closed.lock().unwrap() = true;
                api.prevent_close();
            }
        });
    }

    let (code, state) = (loop {
        if is_window_closed.lock().is_ok_and(|closed| *closed) {
            let _ = auth_window.close();
            break Err(MinecraftAuthError::LoginCancelled);
        }

        let url = auth_window.url()?;
        if !url.as_str().to_string().starts_with(REDIRECT_URL) {
            continue;
        };
        let params: HashMap<Cow<str>, Cow<str>> = url.query_pairs().into_iter().collect();
        if let (Some(code), Some(state)) = (params.get("code"), params.get("state")) {
            let code = AuthorizationCode::new(code.to_string());
            let state = CsrfToken::new(state.to_string());
            break Ok((code, state));
        } else {
            let _ = auth_window.close();
            break Err(MinecraftAuthError::UnexpectedError(format!(
                "Couldn't extract authentication code: {}",
                &url
            )));
        }
    })?;

    auth_window.close()?;

    debug!("MS returned the following code:\n{}\n", code.secret());
    debug!(
        "MS returned the following state:\n{} (expected `{}`)\n",
        state.secret(),
        csrf_state.secret()
    );

    if state.secret() != csrf_state.secret() {
        return Err(MinecraftAuthError::CsrfMismatch(
            state.secret().to_string(),
            csrf_state.secret().to_string(),
        ));
    }

    let async_http_client = ClientBuilder::new()
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .expect("create client");

    let token = client
        .exchange_code(code)
        .set_pkce_verifier(pkce_code_verifier)
        .request_async(&async_http_client)
        .await
        .map_err(|e| MinecraftAuthError::OAuth2Error(e.to_string()))?;
    debug!("microsoft token:\n{:?}\n", token);

    let mc_flow = MinecraftAuthorizationFlow::new(Client::new());
    let mc_token = mc_flow
        .exchange_microsoft_token(token.access_token().secret())
        .await?;

    debug!("minecraft token: {:?}", &mc_token);

    Ok(mc_token)
}

#[derive(Debug, thiserror::Error)]
pub enum MinecraftAuthError {
    #[error("Login process was cancelled by the user")]
    LoginCancelled,
    #[error("CSRF state mismatch ({0} != {1})")]
    CsrfMismatch(String, String),
    #[error("URL parse error: {0}")]
    UrlParseError(#[from] ParseError),
    #[error("IO error: {0}")]
    IoError(#[from] io::Error),
    #[error("OAuth2 error: {0}")]
    OAuth2Error(String),
    #[error("Minecraft auth error: {0}")]
    MinecraftAuthError(String),
    #[error("Unexpected error: {0}")]
    UnexpectedError(String),
    #[error("Window error: {0}")]
    WindowError(#[from] tauri::Error),
}

impl From<RequestTokenError<oauth2::reqwest::Error, StandardErrorResponse<BasicErrorResponseType>>>
    for MinecraftAuthError
{
    fn from(
        err: RequestTokenError<
            oauth2::reqwest::Error,
            StandardErrorResponse<BasicErrorResponseType>,
        >,
    ) -> Self {
        MinecraftAuthError::OAuth2Error(err.to_string())
    }
}

impl From<MinecraftAuthorizationError> for MinecraftAuthError {
    fn from(err: MinecraftAuthorizationError) -> Self {
        MinecraftAuthError::MinecraftAuthError(err.to_string())
    }
}

impl Serialize for MinecraftAuthError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
