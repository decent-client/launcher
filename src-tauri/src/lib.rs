mod utils;

use std::time::Duration;

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let app_handle = app.handle().clone();
            let splash = utils::window::create_splash_screen_window(&app_handle)?;

            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(Duration::from_secs(5)).await;

                if let Err(e) = utils::window::create_launcher_window(&app_handle) {
                    log::error!("error while creating launcher window: {}", e);
                }

                splash.close()
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
