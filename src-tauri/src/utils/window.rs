use tauri::{AppHandle, WebviewUrl, WebviewWindowBuilder};

#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

pub struct WindowOptions {
    pub title: String,
    pub width: f64,
    pub height: f64,
    pub min_width: Option<f64>,
    pub min_height: Option<f64>,
    pub centered: Option<bool>,
    pub decorations: Option<bool>,
    pub transparent: Option<bool>,
    pub resizeable: Option<bool>,
    pub identifier: String,
    pub url: String,
}

impl Default for WindowOptions {
    fn default() -> Self {
        Self {
            title: "Decent Client".to_string(),
            width: 800.0,
            height: 600.0,
            min_width: Some(400.0),
            min_height: Some(200.0),
            centered: Some(true),
            decorations: Some(false),
            transparent: Some(true),
            resizeable: Some(true),
            identifier: "unknown".to_string(),
            url: "/".to_string(),
        }
    }
}

pub fn create_window(
    app: &AppHandle,
    options: WindowOptions,
) -> tauri::Result<tauri::WebviewWindow> {
    let mut window_builder =
        WebviewWindowBuilder::new(app, options.identifier, WebviewUrl::App(options.url.into()))
            .title(options.title)
            .inner_size(options.width, options.height)
            .decorations(options.decorations.unwrap_or(false))
            .transparent(options.transparent.unwrap_or(true))
            .resizable(options.resizeable.unwrap_or(true))
            .theme(Some(tauri::Theme::Dark));

    if let (Some(min_width), Some(min_height)) = (options.min_width, options.min_height) {
        window_builder = window_builder.min_inner_size(min_width, min_height);
    }

    if options.centered.unwrap() {
        window_builder = window_builder.center();
    }

    #[cfg(target_os = "macos")]
    let window_builder = window_builder.title_bar_style(TitleBarStyle::Transparent);

    #[cfg(target_os = "windows")]
    let window_builder = window_builder.effects(
        tauri::window::EffectsBuilder::new()
            .effect(tauri::window::Effect::Mica)
            .build(),
    );

    let window = window_builder.build()?;

    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::{NSColor, NSWindow};
        use cocoa::base::{id, nil};

        let ns_window = window.ns_window().unwrap() as id;
        unsafe {
            let bg_color = NSColor::colorWithRed_green_blue_alpha_(
                nil,
                50.0 / 255.0,
                158.0 / 255.0,
                163.5 / 255.0,
                1.0,
            );
            ns_window.setBackgroundColor_(bg_color);
        }
    }

    Ok(window)
}

pub fn create_launcher_window(app: &AppHandle) -> tauri::Result<tauri::WebviewWindow> {
    create_window(
        app,
        WindowOptions {
            title: "Decent Client - Launcher".to_string(),
            width: 1086.0,
            height: 548.0,
            min_width: Some(792.0),
            min_height: Some(540.0),
            identifier: "launcher".to_string(),
            url: "/".to_string(),
            ..WindowOptions::default()
        },
    )
}

pub fn create_splash_screen_window(app: &AppHandle) -> tauri::Result<tauri::WebviewWindow> {
    create_window(
        app,
        WindowOptions {
            title: "Decent Client".to_string(),
            width: 400.0,
            height: 200.0,
            resizeable: Some(false),
            identifier: "splash-screen".to_string(),
            url: "/splash-screen".to_string(),
            ..WindowOptions::default()
        },
    )
}
