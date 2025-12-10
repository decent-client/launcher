use log::error;
use std::{thread, time};
use tauri::{AppHandle, Manager, Runtime};

pub mod minecraft_auth;

#[tauri::command]
pub fn restart_app(app: AppHandle) {
    app.restart();
}

#[tauri::command]
pub async fn show_launcher_window<R: Runtime>(app: AppHandle<R>, delay: Option<u64>) {
    let launcher = app.get_webview_window("launcher");
    let splash = app.get_webview_window("splash-screen");

    let effective_delay = if cfg!(debug_assertions) {
        None
    } else {
        Some(time::Duration::from_millis(delay.unwrap_or(3000)))
    };

    if let Some(delay) = effective_delay {
        thread::sleep(delay);
    }

    match (launcher, splash) {
        (Some(launcher), Some(splash)) => {
            launcher.show().unwrap();
            launcher.set_focus().unwrap();
            splash.close().unwrap();
        }
        _ => {
            error!("failed to show launcher window");
        }
    }
}
