// use crate::utils::constants::{AUTHORIZE_URL, MSA_CLIENT_ID, REDIRECT_URL, TOKEN_URL};
// use crate::utils::window::{create_window, WindowOptions};
// use log::debug;
// use minecraft_msa_auth::{
//     MinecraftAuthenticationResponse, MinecraftAuthorizationError, MinecraftAuthorizationFlow,
// };
// use oauth2::basic::{BasicClient, BasicErrorResponseType};
// use oauth2::reqwest::async_http_client;
// use oauth2::{
//     AuthType, AuthUrl, AuthorizationCode, ClientId, CsrfToken, PkceCodeChallenge, RedirectUrl,
//     RequestTokenError, Scope, StandardErrorResponse, TokenResponse, TokenUrl,
// };
// use reqwest::{Client, Url};
// use serde::{Serialize, Serializer};
// use std::io;
// use tauri::{AppHandle, WebviewUrl};
// use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
// use tokio::net::TcpListener;
// use url::ParseError;

// #[tauri::command]
// pub async fn create_minecraft_auth(
//     app: AppHandle,
// ) -> Result<MinecraftAuthenticationResponse, MinecraftAuthError> {
//     let client = BasicClient::new(
//         ClientId::new(MSA_CLIENT_ID.to_string()),
//         None,
//         AuthUrl::new(AUTHORIZE_URL.to_string())?,
//         Some(TokenUrl::new(TOKEN_URL.to_string())?),
//     )
//     .set_auth_type(AuthType::RequestBody)
//     .set_redirect_uri(RedirectUrl::new(REDIRECT_URL.to_string())?);

//     let (pkce_code_challenge, pkce_code_verifier) = PkceCodeChallenge::new_random_sha256();

//     let (authorize_url, csrf_state) = client
//         .authorize_url(CsrfToken::new_random)
//         .add_scope(Scope::new("XboxLive.signin offline_access".to_string()))
//         .set_pkce_challenge(pkce_code_challenge)
//         .url();

//     debug!("auth url: {:?}", &authorize_url.to_string());

//     let auth_window = create_window(
//         &app,
//         WindowOptions {
//             title: "Decent Client - Microsoft Authentication".to_string(),
//             identifier: "microsoft-auth".to_string(),
//             url: WebviewUrl::External(authorize_url),
//             width: 475.0,
//             height: 600.0,
//             resizable: Some(false),
//             decorations: Some(true),
//             ..WindowOptions::default()
//         },
//     )?;

//     let listener = TcpListener::bind("127.0.0.1:8114").await?;
//     let (code, state) = (loop {
//         let (stream, _) = listener.accept().await?;
//         stream.readable().await?;
//         let mut stream = BufReader::new(stream);

//         let mut request_line = String::new();
//         stream.read_line(&mut request_line).await?;

//         let redirect_url = request_line.split_whitespace().nth(1).unwrap();
//         let url = Url::parse(&("http://localhost".to_string() + redirect_url))?;

//         let code = url
//             .query_pairs()
//             .find(|(key, _)| key == "code")
//             .map(|(_, value)| AuthorizationCode::new(value.into_owned()))
//             .ok_or_else(|| {
//                 MinecraftAuthError::UnexpectedError("No code found in URL".to_string())
//             })?;

//         let state = url
//             .query_pairs()
//             .find(|(key, _)| key == "state")
//             .map(|(_, value)| CsrfToken::new(value.into_owned()))
//             .ok_or_else(|| {
//                 MinecraftAuthError::UnexpectedError("No state found in URL".to_string())
//             })?;

//         let message = "Go back to your terminal :)";
//         let response = format!(
//             "HTTP/1.1 200 OK\r\ncontent-length: {}\r\n\r\n{}",
//             message.len(),
//             message
//         );
//         stream.write_all(response.as_bytes()).await?;

//         break Ok::<(AuthorizationCode, CsrfToken), MinecraftAuthError>((code, state));
//     })?;

//     auth_window.close()?;

//     debug!("MS returned the following code:\n{}\n", code.secret());
//     debug!(
//         "MS returned the following state:\n{} (expected `{}`)\n",
//         state.secret(),
//         csrf_state.secret()
//     );

//     if state.secret() != csrf_state.secret() {
//         return Err(MinecraftAuthError::CsrfMismatch(
//             state.secret().to_string(),
//             csrf_state.secret().to_string(),
//         ));
//     }

//     let token = client
//         .exchange_code(code)
//         .set_pkce_verifier(pkce_code_verifier)
//         .request_async(async_http_client)
//         .await
//         .map_err(|e| MinecraftAuthError::OAuth2Error(e.to_string()))?;
//     debug!("microsoft token:\n{:?}\n", token);

//     let mc_flow = MinecraftAuthorizationFlow::new(Client::new());
//     let mc_token = mc_flow
//         .exchange_microsoft_token(token.access_token().secret())
//         .await?;

//     debug!("minecraft token: {:?}", &mc_token);

//     Ok(mc_token)
// }

// #[derive(Debug, thiserror::Error)]
// pub enum MinecraftAuthError {
//     // #[error("Login process was cancelled by the user")]
//     // LoginCancelled,
//     #[error("CSRF state mismatch ({0} != {1})")]
//     CsrfMismatch(String, String),
//     #[error("URL parse error: {0}")]
//     UrlParseError(#[from] ParseError),
//     #[error("IO error: {0}")]
//     IoError(#[from] io::Error),
//     #[error("OAuth2 error: {0}")]
//     OAuth2Error(String),
//     #[error("Minecraft auth error: {0}")]
//     MinecraftAuthError(String),
//     #[error("Unexpected error: {0}")]
//     UnexpectedError(String),
//     #[error("Window error: {0}")]
//     WindowError(#[from] tauri::Error),
// }

// impl
//     From<
//         RequestTokenError<
//             oauth2::reqwest::Error<reqwest::Error>,
//             StandardErrorResponse<BasicErrorResponseType>,
//         >,
//     > for MinecraftAuthError
// {
//     fn from(
//         err: RequestTokenError<
//             oauth2::reqwest::Error<reqwest::Error>,
//             StandardErrorResponse<BasicErrorResponseType>,
//         >,
//     ) -> Self {
//         MinecraftAuthError::OAuth2Error(err.to_string())
//     }
// }

// impl From<MinecraftAuthorizationError> for MinecraftAuthError {
//     fn from(err: MinecraftAuthorizationError) -> Self {
//         MinecraftAuthError::MinecraftAuthError(err.to_string())
//     }
// }

// impl Serialize for MinecraftAuthError {
//     fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
//     where
//         S: Serializer,
//     {
//         serializer.serialize_str(self.to_string().as_ref())
//     }
// }
