use tauri::{AppHandle, Error, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

pub struct WindowOptions {
    pub title: String,
    pub identifier: String,
    pub url: WebviewUrl,
    pub width: f64,
    pub height: f64,
    pub min_width: Option<f64>,
    pub min_height: Option<f64>,
    pub max_width: Option<f64>,
    pub max_height: Option<f64>,
    pub centered: Option<bool>,
    pub resizable: Option<bool>,
    pub maximizable: Option<bool>,
    pub decorations: Option<bool>,
    pub transparent: Option<bool>,
}

impl Default for WindowOptions {
    fn default() -> Self {
        Self {
            title: Default::default(),
            identifier: Default::default(),
            url: WebviewUrl::App("/".into()),
            width: 600.0,
            height: 400.0,
            min_width: None,
            min_height: None,
            max_width: None,
            max_height: None,
            centered: Some(true),
            resizable: Some(true),
            maximizable: Some(true),
            decorations: Some(false),
            transparent: Some(false),
        }
    }
}

pub fn create_window(app: &AppHandle, options: WindowOptions) -> Result<WebviewWindow, Error> {
    let mut window_builder = WebviewWindowBuilder::new(app, options.identifier, options.url)
        .title(options.title)
        .inner_size(options.width, options.height)
        .resizable(options.resizable.unwrap())
        .maximizable(options.maximizable.unwrap());

    if let Some(transparent) = options.transparent {
        window_builder = window_builder.transparent(transparent);
    }

    #[allow(unused_mut)]
    if let Some(mut decorations) = options.decorations {
        #[cfg(target_os = "macos")]
        {
            decorations = true;
        }

        window_builder = window_builder.decorations(decorations);
    }

    if let (Some(min_width), Some(min_height)) = (options.min_width, options.min_height) {
        window_builder = window_builder.min_inner_size(min_width, min_height);
    }

    if let (Some(max_width), Some(max_height)) = (options.max_width, options.max_height) {
        window_builder = window_builder.max_inner_size(max_width, max_height);
    }

    if options.centered.unwrap() {
        window_builder = window_builder.center();
    }

    #[cfg(target_os = "macos")]
    {
        window_builder = window_builder
            .title_bar_style(TitleBarStyle::Overlay)
            .hidden_title(true);
    }

    let window = window_builder.build()?;

    Ok(window)
}

pub fn create_launcher_window(app: &AppHandle) -> tauri::Result<tauri::WebviewWindow> {
    create_window(
        app,
        WindowOptions {
            title: "Decent Client - Launcher".to_string(),
            identifier: "launcher".to_string(),
            url: WebviewUrl::App("/".into()),
            width: 1086.0,
            height: 548.0,
            min_width: Some(792.0),
            min_height: Some(540.0),
            ..WindowOptions::default()
        },
    )
}

pub fn create_splash_screen_window(app: &AppHandle) -> tauri::Result<tauri::WebviewWindow> {
    create_window(
        app,
        WindowOptions {
            title: "Decent Client".to_string(),
            identifier: "splash-screen".to_string(),
            url: WebviewUrl::App("/splash-screen".into()),
            width: 400.0,
            height: 200.0,
            resizable: Some(false),
            ..WindowOptions::default()
        },
    )
}
