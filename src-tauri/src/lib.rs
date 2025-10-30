use log::*;
use tauri::{generate_context, Builder};

pub fn run() {
    let mut builder = Builder::default();

    builder = builder;

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
