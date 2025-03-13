use log::error;
use tauri::Manager;
use tokio::time::{sleep, Duration};

mod core;
mod utils;

#[tauri::command]
fn restart_app(app: tauri::AppHandle) {
    app.restart();
}

pub fn run() {
    let mut builder = tauri::Builder::default();

    builder = builder
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("launcher") {
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_system_info::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            let splash = utils::window::create_splash_screen_window(&app_handle)?;

            tauri::async_runtime::spawn(async move {
                sleep(Duration::from_secs(5)).await;

                if let Err(e) = utils::window::create_launcher_window(&app_handle) {
                    log::error!("error while creating launcher window: {}", e);
                }

                splash.destroy()
            });

            Ok(())
        })
        .plugin(core::msa_auth::init())
        .plugin(core::player_skin::init())
        .invoke_handler(tauri::generate_handler![restart_app]);

    let app = builder.build(tauri::generate_context!());

    match app {
        Ok(app) => {
            app.run(|_app_handle, event| match event {
                tauri::RunEvent::ExitRequested { api, .. } => {
                    api.prevent_exit();
                }
                _ => {}
            });
        }
        Err(e) => {
            error!("error while running tauri application: {}", e)
        }
    }
}
