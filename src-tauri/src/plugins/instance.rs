use tauri::{
    generate_handler,
    plugin::{self, TauriPlugin},
    AppHandle, Runtime,
};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    plugin::Builder::<R>::new("instance")
        .invoke_handler(generate_handler![get_all])
        .build()
}

#[tauri::command]
async fn get_all<R: Runtime>(app: AppHandle<R>) {}
