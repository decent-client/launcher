use log::error;
use tauri::{generate_context, generate_handler, Builder, Manager};
use tauri_plugin_window_state::StateFlags;

mod commands;
mod plugins;
mod utils;

pub fn run() {
    let mut builder = Builder::default();

    builder = builder
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("launcher") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_filename("window-state.json")
                .with_state_flags(StateFlags::POSITION | StateFlags::SIZE | StateFlags::MAXIMIZED)
                .build(),
        );

    builder = builder
        .plugin(plugins::account::init())
        .plugin(plugins::instance::init())
        .invoke_handler(generate_handler![
            utils::restart_app,
            utils::show_launcher_window,
            commands::skin::player_skin,
            commands::skin::player_face,
        ]);

    let app = builder.build(generate_context!());

    match app {
        Ok(app) => {
            app.run(|_app_handle, _event| {
                // handle events here
            });
        }
        Err(e) => {
            error!("error while running tauri application: {}", e)
        }
    }
}
