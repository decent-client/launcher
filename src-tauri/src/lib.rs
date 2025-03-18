use log::error;
use tauri::{AppHandle, Manager, RunEvent, WindowEvent};
use tauri_plugin_window_state::{AppHandleExt, StateFlags, WindowExt};
use tokio::time::{sleep, Duration};

mod core;
mod utils;

#[tauri::command]
fn restart_app(app: AppHandle) {
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
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_filename("window-state.json")
                .build(),
        )
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_system_info::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            let _ = core::msa_auth::create_minecraft_auth(app.handle().clone());

            let splash = utils::window::create_splash_screen_window(&app_handle)?;

            tauri::async_runtime::spawn(async move {
                sleep(Duration::from_secs(5)).await;

                if let Ok(launcher) = utils::window::create_launcher_window(&app_handle) {
                    let _ = WindowExt::restore_state(&launcher, StateFlags::all());
                };

                splash.destroy()
            });

            Ok(())
        })
        .on_window_event(|window, event| match event {
            WindowEvent::CloseRequested { .. } | WindowEvent::Destroyed => {
                let _ = AppHandleExt::save_window_state(window.app_handle(), StateFlags::all());
            }
            _ => {}
        })
        // .plugin(core::msa_auth::init())
        .plugin(core::player_skin::init())
        .invoke_handler(tauri::generate_handler![
            restart_app,
            core::msa_auth::create_minecraft_auth
        ]);

    let app = builder.build(tauri::generate_context!());

    match app {
        Ok(app) => {
            app.run(|_app_handle, event| match event {
                RunEvent::ExitRequested { api, .. } => {
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
