use crate::utils::{
    constants::{AUTHORIZE_URL, MSA_CLIENT_ID, REDIRECT_URL, TOKEN_URL},
    window::{create_window, WindowOptions},
};
use chrono::Utc;
use log::debug;
use oauth2::{
    basic::{BasicClient, BasicTokenType},
    reqwest::async_http_client,
    url, AuthType, AuthUrl, AuthorizationCode, ClientId, CsrfToken, EmptyExtraTokenFields,
    PkceCodeChallenge, RedirectUrl, Scope, StandardTokenResponse, TokenResponse, TokenUrl,
};
use reqwest::Url;
use serde::{Deserialize, Serialize};
use std::{
    borrow::Cow,
    collections::HashMap,
    sync::{Arc, Mutex},
};
use tauri::{AppHandle, WebviewUrl, WindowEvent};
use thiserror::Error;

#[tauri::command]
pub async fn create_minecraft_auth(app: AppHandle) -> Result<MSAuthToken, MSAuthError> {
    let client = BasicClient::new(
        ClientId::new(MSA_CLIENT_ID.to_string()),
        None,
        AuthUrl::new(AUTHORIZE_URL.to_string())?,
        Some(TokenUrl::new(TOKEN_URL.to_string())?),
    )
    .set_auth_type(AuthType::RequestBody)
    .set_redirect_uri(RedirectUrl::new(REDIRECT_URL.to_string())?);

    let (pkce_code_challenge, pkce_code_verifier) = PkceCodeChallenge::new_random_sha256();

    let (auth_link, csrf_state) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("XboxLive.signin offline_access".to_string()))
        .set_pkce_challenge(pkce_code_challenge)
        .add_extra_param("prompt", "select_account")
        .add_extra_param("cobrandid", "8058f65d-ce06-4c30-9559-473c9275a65d") // Adds the Minecraft branding to the login page
        .url();

    debug!("Auth link: {}", auth_link);

    let window = create_window(
        &app,
        WindowOptions {
            title: "Decent Client - Microsoft Authentication".to_string(),
            identifier: "auth".to_string(),
            url: WebviewUrl::External(auth_link),
            width: 465.0,
            height: 600.0,

            ..Default::default()
        },
    )
    .unwrap();

    let is_window_closed = Arc::new(Mutex::new(false));
    {
        let is_window_closed = Arc::clone(&is_window_closed);
        window.on_window_event(move |event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                *is_window_closed.lock().unwrap() = true;
                api.prevent_close();
            }
        });
    }

    let (code, state) = (loop {
        if is_window_closed.lock().is_ok_and(|closed| *closed) {
            let _ = window.close();
            break Err(MSAuthError::LoginCancelled);
        }

        let url = window.url()?;
        if !url.as_str().to_string().starts_with(REDIRECT_URL) {
            continue;
        }
        let params: HashMap<Cow<str>, Cow<str>> = url.query_pairs().into_iter().collect();
        if let (Some(code), Some(state)) = (params.get("code"), params.get("state")) {
            let code = AuthorizationCode::new(code.to_string());
            let state = CsrfToken::new(state.to_string());
            break Ok((code, state));
        } else {
            let _ = window.close();
            break Err(MSAuthError::UnexpectedError(format!(
                "Couldn't extract authentication code: {}",
                url
            )));
        }
    })?;

    let _ = window.close();

    debug!("Got code: {}, state: {}", code.secret(), state.secret());

    // Check CSRF challenge

    if state.secret() != csrf_state.secret() {
        return Err(MSAuthError::CsrfMismatch(
            state.secret().clone(),
            csrf_state.secret().clone(),
        ))?;
    }

    debug!("Exchanging code for token...");

    let tokens = client
        .exchange_code(code)
        .set_pkce_verifier(pkce_code_verifier)
        .request_async(async_http_client)
        .await
        .map_err(|e| MSAuthError::UnexpectedError(e.to_string()))?;

    debug!("Got token: {:?}", tokens);

    Ok(MSATokenResponse::from(tokens).into())
}

#[derive(Debug, Error)]
pub enum MSAuthError {
    #[error("Login process was cancelled by the user")]
    LoginCancelled,
    #[error("CSRF state mismatch ({0} != {1})")]
    CsrfMismatch(String, String),
    #[error("Unexpected error: {0}")]
    UnexpectedError(String),
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    OAuth2(
        #[from]
        oauth2::RequestTokenError<
            oauth2::reqwest::Error<reqwest::Error>,
            oauth2::StandardErrorResponse<oauth2::basic::BasicErrorResponseType>,
        >,
    ),
    #[error(transparent)]
    Url(#[from] url::ParseError),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
}

impl Serialize for MSAuthError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MSAuthToken {
    pub access_token: String,
    pub refresh_token: String,
    pub expiration_date: i64,
}

impl MSAuthToken {
    pub fn validate(&self) -> bool {
        Utc::now().timestamp_millis() < self.expiration_date
    }

    pub async fn refresh(&mut self, force: bool) -> Result<(), Box<dyn std::error::Error>> {
        if self.validate() && !force {
            return Ok(());
        }
        let url = Url::parse_with_params(
            TOKEN_URL,
            &[
                ("client_id", MSA_CLIENT_ID),
                ("refresh_token", &self.refresh_token),
                ("grant_type", "refresh_token"),
            ],
        )
        .unwrap();

        let MSAuthToken {
            access_token,
            refresh_token,
            expiration_date,
        } = reqwest::Client::new()
            .post(url.as_str())
            .body(url.query().unwrap().to_string())
            .header("Content-Type", "application/x-www-form-urlencoded")
            .send()
            .await?
            .error_for_status()?
            .json::<MSATokenResponse>()
            .await?
            .into();

        self.access_token = access_token;
        self.refresh_token = refresh_token;
        self.expiration_date = expiration_date;
        Ok(())
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct MSATokenResponse {
    access_token: String,
    refresh_token: String,
    #[serde(rename = "expires_in")]
    expires_in_seconds: u64, // seconds
}

impl From<StandardTokenResponse<EmptyExtraTokenFields, BasicTokenType>> for MSATokenResponse {
    fn from(tokens: StandardTokenResponse<EmptyExtraTokenFields, BasicTokenType>) -> Self {
        MSATokenResponse {
            access_token: tokens.access_token().secret().to_string(),
            refresh_token: tokens.refresh_token().unwrap().secret().to_string(),
            expires_in_seconds: tokens.expires_in().unwrap().as_secs(),
        }
    }
}

impl From<MSATokenResponse> for MSAuthToken {
    fn from(val: MSATokenResponse) -> Self {
        MSAuthToken {
            access_token: val.access_token,
            refresh_token: val.refresh_token,
            expiration_date: Utc::now().timestamp() + ((val.expires_in_seconds * 1000u64) as i64),
        }
    }
}
