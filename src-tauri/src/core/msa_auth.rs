use tauri::{
    plugin::{Builder, TauriPlugin},
    Config, Runtime,
};

pub fn init<R: Runtime>() -> TauriPlugin<R, Config> {
    Builder::<R, Config>::new("msa_auth")
        .invoke_handler(tauri::generate_handler![])
        .build()
}
