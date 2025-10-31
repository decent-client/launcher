use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use anyhow::{anyhow, Context, Result};
use log::debug;
use oauth2::{
    basic::{BasicClient, BasicErrorResponseType},
    AuthType, AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken, EndpointNotSet,
    EndpointSet, PkceCodeChallenge, PkceCodeVerifier, RedirectUrl, RequestTokenError, Scope,
    TokenResponse, TokenUrl,
};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{AppHandle, Manager, Runtime, Url};

pub const MSA_CLIENT_ID: &str = "f7770de8-077a-46ea-9604-908154eee29b";
pub const AUTHORIZE_URL: &str = "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize";
pub const TOKEN_URL: &str = "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
pub const REDIRECT_URL: &str = "https://login.live.com/oauth20_desktop.srf";

const XBOX_USER_AUTH_URL: &str = "https://user.auth.xboxlive.com/user/authenticate";
const XBOX_XSTS_URL: &str = "https://xsts.auth.xboxlive.com/xsts/authorize";
const MINECRAFT_LOGIN_URL: &str =
    "https://api.minecraftservices.com/authentication/login_with_xbox";
const MINECRAFT_ENTITLEMENTS_URL: &str = "https://api.minecraftservices.com/entitlements/mcstore";
const MINECRAFT_PROFILE_URL: &str = "https://api.minecraftservices.com/minecraft/profile";

type ConfiguredClient =
    BasicClient<EndpointSet, EndpointNotSet, EndpointNotSet, EndpointNotSet, EndpointSet>;

#[derive(Debug)]
pub struct AuthFlow {
    client: ConfiguredClient,
    pkce_verifier: PkceCodeVerifier,
    csrf_state: CsrfToken,
    authorize_url: Url,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MicrosoftTokens {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct XboxTokens {
    pub user_token: String,
    pub xsts_token: String,
    pub uhs: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MinecraftTokens {
    pub access_token: String,
    pub expires_at: Option<u64>,
    pub username: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AccountRecord {
    pub uuid: String,
    pub username: String,
    pub obtained_at: u64,
    pub microsoft: MicrosoftTokens,
    pub xbox: XboxTokens,
    pub minecraft: MinecraftTokens,
    #[serde(default)]
    pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct AccountStore {
    accounts: Vec<AccountRecord>,
}

#[derive(Debug, Deserialize)]
struct XboxAuthResponse {
    #[serde(rename = "Token")]
    token: String,
    #[serde(rename = "DisplayClaims")]
    display_claims: XboxDisplayClaims,
}

#[derive(Debug, Deserialize)]
struct XboxDisplayClaims {
    #[serde(rename = "xui")]
    users: Vec<XboxUser>,
}

#[derive(Debug, Deserialize)]
struct XboxUser {
    #[serde(rename = "uhs")]
    uhs: String,
}

#[derive(Debug, Deserialize)]
struct XboxXstsResponse {
    #[serde(rename = "Token")]
    token: String,
    #[serde(rename = "DisplayClaims")]
    display_claims: XboxDisplayClaims,
}

#[derive(Debug, Deserialize)]
struct MinecraftLoginResponse {
    username: String,
    access_token: String,
    expires_in: Option<u64>,
}

#[derive(Debug, Deserialize)]
struct EntitlementsResponse {
    #[serde(default)]
    items: Vec<Value>,
}

#[derive(Debug, Deserialize)]
struct MinecraftProfileResponse {
    id: String,
    name: String,
}

impl AuthFlow {
    pub fn authorize_url(&self) -> Url {
        self.authorize_url.clone()
    }

    pub fn csrf_secret(&self) -> &str {
        self.csrf_state.secret()
    }

    pub async fn exchange(self, code: &str) -> Result<AccountRecord> {
        let http_client = Client::new();

        let token_response = self
            .client
            .exchange_code(AuthorizationCode::new(code.to_owned()))
            .set_pkce_verifier(self.pkce_verifier)
            .request_async(&http_client)
            .await
            .map_err(|err| {
                if let RequestTokenError::ServerResponse(response) = &err {
                    if response.error() == &BasicErrorResponseType::InvalidClient {
                        return anyhow!(
                            "authorization server rejected the client credentials (invalid_client). \
Please ensure the Azure/Microsoft application is configured as a public client or provide a client secret via the MSA_CLIENT_SECRET environment variable."
                        );
                    }
                }

                anyhow!(err)
            })
            .context("failed to exchange authorization code")?;

        let microsoft_access_token = token_response.access_token().secret().to_string();
        let microsoft_refresh_token = token_response
            .refresh_token()
            .ok_or_else(|| anyhow!("missing microsoft refresh token"))?
            .secret()
            .to_string();
        let microsoft_expires_at = token_response
            .expires_in()
            .map(|duration| timestamp_after(duration));

        let xbox_auth = xbox_live_authenticate(&http_client, &microsoft_access_token).await?;
        let xbox_uhs = xbox_auth
            .display_claims
            .users
            .get(0)
            .map(|user| user.uhs.clone())
            .ok_or_else(|| anyhow!("missing Xbox user hash"))?;

        let xsts = xbox_xsts_authorize(&http_client, &xbox_auth.token).await?;
        let xsts_token = xsts.token.clone();
        let xsts_uhs = xsts
            .display_claims
            .users
            .get(0)
            .map(|user| user.uhs.clone())
            .unwrap_or_else(|| xbox_uhs.clone());

        let minecraft_login =
            minecraft_login_with_xbox(&http_client, &xsts_uhs, &xsts_token).await?;
        let minecraft_access_token = minecraft_login.access_token.clone();
        let minecraft_expires_at = minecraft_login
            .expires_in
            .map(Duration::from_secs)
            .map(timestamp_after);

        let entitlements = minecraft_entitlements(&http_client, &minecraft_access_token).await?;
        if entitlements.items.is_empty() {
            return Err(anyhow!("no Minecraft entitlements found for account"));
        }

        let profile = minecraft_profile(&http_client, &minecraft_access_token).await?;

        let obtained_at = current_timestamp();

        let account = AccountRecord {
            uuid: profile.id,
            username: profile.name.clone(),
            obtained_at,
            microsoft: MicrosoftTokens {
                access_token: microsoft_access_token,
                refresh_token: microsoft_refresh_token,
                expires_at: microsoft_expires_at,
            },
            xbox: XboxTokens {
                user_token: xbox_auth.token,
                xsts_token,
                uhs: xsts_uhs,
            },
            minecraft: MinecraftTokens {
                access_token: minecraft_access_token,
                expires_at: minecraft_expires_at,
                username: minecraft_login.username,
            },
            is_active: false,
        };

        Ok(account)
    }
}

pub fn init() -> Result<AuthFlow> {
    let mut client = BasicClient::new(ClientId::new(MSA_CLIENT_ID.to_string()))
        .set_auth_uri(AuthUrl::new(AUTHORIZE_URL.to_string()).expect("valid authorize url"))
        .set_auth_type(AuthType::RequestBody)
        .set_token_uri(TokenUrl::new(TOKEN_URL.to_string()).expect("valid token url"))
        .set_redirect_uri(RedirectUrl::new(REDIRECT_URL.to_string()).expect("valid redirect url"));

    if let Some(secret) = env::var("MSA_CLIENT_SECRET")
        .or_else(|_| env::var("DECENT_MSA_CLIENT_SECRET"))
        .ok()
        .and_then(|value| {
            let trimmed = value.trim().to_owned();
            if trimmed.is_empty() {
                None
            } else {
                Some(trimmed)
            }
        })
    {
        client = client.set_client_secret(ClientSecret::new(secret));
    }

    let (pkce_code_challenge, pkce_code_verifier) = PkceCodeChallenge::new_random_sha256();

    let (authorize_url, csrf_state) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("XboxLive.signin".to_string()))
        .add_scope(Scope::new("offline_access".to_string()))
        .set_pkce_challenge(pkce_code_challenge)
        .add_extra_param("prompt", "select_account")
        .add_extra_param("cobrandid", "8058f65d-ce06-4c30-9559-473c9275a65d")
        .url();

    debug!("auth url: {:?}", &authorize_url);

    let authorize_url = Url::parse(authorize_url.as_str()).context("valid tauri url")?;

    Ok(AuthFlow {
        client,
        pkce_verifier: pkce_code_verifier,
        csrf_state,
        authorize_url,
    })
}

pub fn save_account<R: Runtime>(app: &AppHandle<R>, account: &AccountRecord) -> Result<()> {
    let mut accounts = read_accounts(app)?;

    if let Some(existing) = accounts.iter_mut().find(|a| a.uuid == account.uuid) {
        let was_active = existing.is_active;
        *existing = account.clone();
        existing.is_active = was_active;
    } else {
        let mut new_account = account.clone();
        if !accounts.iter().any(|a| a.is_active) {
            new_account.is_active = true;
        }
        accounts.push(new_account);
    }

    write_accounts(app, &accounts)
}

pub fn read_accounts<R: Runtime>(app: &AppHandle<R>) -> Result<Vec<AccountRecord>> {
    let mut store = load_account_store(app)?;
    if normalize_active_flags(&mut store.accounts) {
        persist_account_store(app, &store)?;
    }
    Ok(store.accounts)
}

pub fn write_accounts<R: Runtime>(app: &AppHandle<R>, accounts: &[AccountRecord]) -> Result<()> {
    let mut store = AccountStore {
        accounts: accounts.to_vec(),
    };
    normalize_active_flags(&mut store.accounts);
    persist_account_store(app, &store)
}

fn load_account_store<R: Runtime>(app: &AppHandle<R>) -> Result<AccountStore> {
    let path = account_store_path(app)?;

    if !path.exists() {
        return Ok(AccountStore::default());
    }

    let contents = fs::read_to_string(&path).context("failed to read existing accounts.json")?;
    if contents.trim().is_empty() {
        return Ok(AccountStore::default());
    }

    serde_json::from_str::<AccountStore>(&contents)
        .context("failed to parse existing accounts.json")
}

fn persist_account_store<R: Runtime>(app: &AppHandle<R>, store: &AccountStore) -> Result<()> {
    let path = account_store_path(app)?;
    let serialized = serde_json::to_string_pretty(store).context("failed to serialize accounts")?;
    fs::write(path, serialized).context("failed to write accounts.json")
}

fn account_store_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf> {
    let mut data_dir = app
        .path()
        .app_data_dir()
        .context("failed to resolve app data directory")?;

    fs::create_dir_all(&data_dir).context("failed to create app data directory")?;
    data_dir.push("accounts.json");
    Ok(data_dir)
}

fn normalize_active_flags(accounts: &mut [AccountRecord]) -> bool {
    let mut seen_active = false;
    let mut changed = false;
    for account in accounts.iter_mut() {
        if account.is_active {
            if seen_active {
                changed = true;
                account.is_active = false;
            } else {
                seen_active = true;
            }
        }
    }

    if !seen_active {
        if let Some(first) = accounts.first_mut() {
            changed = true;
            first.is_active = true;
        }
    }

    changed
}

async fn xbox_live_authenticate(client: &Client, access_token: &str) -> Result<XboxAuthResponse> {
    let response = client
        .post(XBOX_USER_AUTH_URL)
        .json(&json!({
            "Properties": {
                "AuthMethod": "RPS",
                "SiteName": "user.auth.xboxlive.com",
                "RpsTicket": format!("d={}", access_token),
            },
            "RelyingParty": "http://auth.xboxlive.com",
            "TokenType": "JWT"
        }))
        .send()
        .await
        .context("failed to request Xbox Live authentication")?
        .error_for_status()
        .context("Xbox Live authentication returned non-success status")?;

    let parsed = response
        .json::<XboxAuthResponse>()
        .await
        .context("failed to parse Xbox Live authentication response")?;

    Ok(parsed)
}

async fn xbox_xsts_authorize(client: &Client, user_token: &str) -> Result<XboxXstsResponse> {
    let response = client
        .post(XBOX_XSTS_URL)
        .json(&json!({
            "Properties": {
                "SandboxId": "RETAIL",
                "UserTokens": [user_token]
            },
            "RelyingParty": "rp://api.minecraftservices.com/",
            "TokenType": "JWT"
        }))
        .send()
        .await
        .context("failed to request Xbox XSTS token")?
        .error_for_status()
        .context("Xbox XSTS token request returned non-success status")?;

    let parsed = response
        .json::<XboxXstsResponse>()
        .await
        .context("failed to parse Xbox XSTS response")?;

    Ok(parsed)
}

async fn minecraft_login_with_xbox(
    client: &Client,
    uhs: &str,
    xsts_token: &str,
) -> Result<MinecraftLoginResponse> {
    let identity_token = format!("XBL3.0 x={};{}", uhs, xsts_token);

    let response = client
        .post(MINECRAFT_LOGIN_URL)
        .json(&json!({
            "identityToken": identity_token,
            "ensureLegacyEnabled": true
        }))
        .send()
        .await
        .context("failed to login to Minecraft services")?
        .error_for_status()
        .context("Minecraft login returned non-success status")?;

    let parsed = response
        .json::<MinecraftLoginResponse>()
        .await
        .context("failed to parse Minecraft login response")?;

    Ok(parsed)
}

async fn minecraft_entitlements(
    client: &Client,
    access_token: &str,
) -> Result<EntitlementsResponse> {
    let response = client
        .get(MINECRAFT_ENTITLEMENTS_URL)
        .bearer_auth(access_token)
        .send()
        .await
        .context("failed to fetch Minecraft entitlements")?
        .error_for_status()
        .context("Minecraft entitlements request returned non-success status")?;

    let parsed = response
        .json::<EntitlementsResponse>()
        .await
        .context("failed to parse Minecraft entitlements response")?;

    Ok(parsed)
}

async fn minecraft_profile(
    client: &Client,
    access_token: &str,
) -> Result<MinecraftProfileResponse> {
    let response = client
        .get(MINECRAFT_PROFILE_URL)
        .bearer_auth(access_token)
        .send()
        .await
        .context("failed to fetch Minecraft profile")?
        .error_for_status()
        .context("Minecraft profile request returned non-success status")?;

    let parsed = response
        .json::<MinecraftProfileResponse>()
        .await
        .context("failed to parse Minecraft profile response")?;

    Ok(parsed)
}

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_else(|_| Duration::from_secs(0))
        .as_secs()
}

fn timestamp_after(duration: Duration) -> u64 {
    current_timestamp().saturating_add(duration.as_secs())
}
