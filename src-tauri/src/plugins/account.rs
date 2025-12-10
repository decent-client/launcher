use std::sync::{Arc, Mutex};

use crate::utils::minecraft_auth::{self, AccountRecord};
use anyhow::{anyhow, Context};
use serde::Serialize;
use tauri::{
    generate_handler,
    plugin::{self, TauriPlugin},
    AppHandle, Runtime, WebviewUrl, WebviewWindowBuilder,
};

use tokio::sync::oneshot;
use url::form_urlencoded;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    plugin::Builder::<R>::new("account")
        .invoke_handler(generate_handler![
            authenticate,
            get_all,
            get_active,
            set_active,
            remove
        ])
        .build()
}

#[tauri::command]
async fn authenticate<R: Runtime>(app: AppHandle<R>) -> Result<AccountRecord, String> {
    match authenticate_impl(&app).await {
        Ok(account) => Ok(account),
        Err(err) => {
            log::error!("minecraft authentication failed: {:#}", err);
            Err(format!("{:#}", err))
        }
    }
}

async fn authenticate_impl<R: Runtime>(app: &AppHandle<R>) -> anyhow::Result<AccountRecord> {
    let flow = minecraft_auth::init().context("failed to initialise Minecraft auth flow")?;
    let auth_url = flow.authorize_url();
    let expected_state = flow.csrf_secret().to_string();

    let (tx, rx) = oneshot::channel::<Result<String, String>>();
    let sender = Arc::new(Mutex::new(Some(tx)));

    let auth_window =
        WebviewWindowBuilder::new(app, "authentication", WebviewUrl::External(auth_url))
            .title("Decent Client - Authenticate")
            .inner_size(475.0, 600.0)
            .resizable(false)
            .maximizable(false)
            .always_on_top(true)
            .center()
            .on_navigation({
                let sender = Arc::clone(&sender);
                let expected_state = expected_state.clone();
                move |url| {
                    if url.as_str().starts_with(minecraft_auth::REDIRECT_URL) {
                        log::debug!("authentication redirect navigation: {}", url);

                        let mut code: Option<String> = None;
                        let mut state: Option<String> = None;

                        for (key, value) in url.query_pairs() {
                            match key.as_ref() {
                                "code" => code = Some(value.into_owned()),
                                "state" => state = Some(value.into_owned()),
                                _ => {}
                            }
                        }

                        if (code.is_none() || state.is_none()) && url.fragment().is_some() {
                            if let Some(fragment) = url.fragment() {
                                for (key, value) in form_urlencoded::parse(fragment.as_bytes()) {
                                    match key.as_ref() {
                                        "code" if code.is_none() => {
                                            code = Some(value.into_owned());
                                        }
                                        "state" if state.is_none() => {
                                            state = Some(value.into_owned());
                                        }
                                        _ => {}
                                    }
                                }
                            }
                        }

                        if let Ok(mut guard) = sender.lock() {
                            if let Some(tx) = guard.take() {
                                if let Some(code) = code {
                                    if state.as_deref() == Some(expected_state.as_str()) {
                                        let _ = tx.send(Ok(code));
                                    } else {
                                        let _ = tx.send(Err("state mismatch".to_string())).map_err(
                                            |_| {
                                                log::warn!(
                                                    "failed to send state mismatch to receiver"
                                                )
                                            },
                                        );
                                    }
                                } else {
                                    let _ = tx
                                        .send(Err("missing authorization code".to_string()))
                                        .map_err(|_| {
                                            log::warn!("failed to send missing code to receiver")
                                        });
                                }
                            }
                        }

                        false
                    } else {
                        true
                    }
                }
            })
            .build()
            .map_err(|err| anyhow!(err))?;

    let auth_code = match rx.await {
        Ok(Ok(code)) => code,
        Ok(Err(reason)) => {
            let _ = auth_window.close();
            return Err(anyhow!(reason));
        }
        Err(_) => {
            let _ = auth_window.close();
            return Err(anyhow!("authentication window closed before completion"));
        }
    };

    let _ = auth_window.close();

    let account = flow
        .exchange(&auth_code)
        .await
        .context("failed to complete Microsoft authentication flow")?;

    minecraft_auth::save_account(app, &account)
        .context("failed to persist authenticated account")?;

    Ok(account)
}

#[tauri::command]
async fn get_all<R: Runtime>(app: AppHandle<R>) -> Result<Vec<AccountSummary>, String> {
    minecraft_auth::read_accounts(&app)
        .map(|accounts| accounts.into_iter().map(AccountSummary::from).collect())
        .map_err(|err| {
            log::error!("failed to read accounts: {:#}", err);
            err.to_string()
        })
}

#[tauri::command]
async fn get_active<R: Runtime>(app: AppHandle<R>) -> Result<Option<AccountSummary>, String> {
    let accounts = minecraft_auth::read_accounts(&app).map_err(|err| {
        log::error!("failed to read accounts: {:#}", err);
        err.to_string()
    })?;

    Ok(accounts
        .into_iter()
        .find(|account| account.is_active)
        .map(AccountSummary::from))
}

#[tauri::command]
async fn set_active<R: Runtime>(app: AppHandle<R>, uuid: String) -> Result<(), String> {
    let mut accounts = minecraft_auth::read_accounts(&app).map_err(|err| {
        log::error!("failed to read accounts: {:#}", err);
        err.to_string()
    })?;

    let mut found = false;

    for account in accounts.iter_mut() {
        if account.uuid == uuid {
            account.is_active = true;
            found = true;
        } else if account.is_active {
            account.is_active = false;
        }
    }

    if !found {
        return Err(format!("account {} not found", uuid));
    }

    minecraft_auth::write_accounts(&app, &accounts).map_err(|err| {
        log::error!("failed to update accounts: {:#}", err);
        err.to_string()
    })
}

#[tauri::command]
async fn remove<R: Runtime>(app: AppHandle<R>, uuid: String) -> Result<(), String> {
    let mut accounts = minecraft_auth::read_accounts(&app).map_err(|err| {
        log::error!("failed to read accounts: {:#}", err);
        err.to_string()
    })?;

    let original_len = accounts.len();
    accounts.retain(|account| account.uuid != uuid);

    if accounts.len() == original_len {
        return Err(format!("account {} not found", uuid));
    }

    minecraft_auth::write_accounts(&app, &accounts).map_err(|err| {
        log::error!("failed to update accounts: {:#}", err);
        err.to_string()
    })
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct AccountSummary {
    uuid: String,
    username: String,
    obtained_at: u64,
    is_active: bool,
}

impl From<AccountRecord> for AccountSummary {
    fn from(record: AccountRecord) -> Self {
        let AccountRecord {
            uuid,
            username,
            obtained_at,
            is_active,
            ..
        } = record;

        Self {
            uuid,
            username,
            obtained_at,
            is_active,
        }
    }
}
