use base64::Engine;
use log::{error, info};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{
    generate_handler,
    plugin::{self, TauriPlugin},
    Manager, Runtime,
};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    plugin::Builder::<R>::new("instance")
        .setup(|app, _api| {
            let app_data_dir = app.path().app_data_dir().unwrap();
            let instances_dir = app_data_dir.join("instances");

            if !instances_dir.exists() {
                fs::create_dir_all(&instances_dir)?;
            }

            Ok(())
        })
        .invoke_handler(generate_handler![
            create_instance,
            get_instance,
            remove_instance,
            get_instances,
            rename_instance,
            update_instance_icon,
        ])
        .build()
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Instance {
    pub name: String,
    pub identifier: String,
    pub loader: String,
    pub version: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct CreateInstanceOption {
    name: String,
    loader: String,
    version: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    icon: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct UpdateInstanceIconOption {
    identifier: String,
    #[serde(rename = "icon_data")]
    icon_data: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct RenameInstanceOption {
    identifier: String,
    new_name: String,
}

fn get_instances_dir<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    Ok(app_data_dir.join("instances"))
}

fn get_instance_dir<R: Runtime>(
    app: &tauri::AppHandle<R>,
    identifier: &str,
) -> Result<PathBuf, String> {
    let path = get_instances_dir(app)?.join(identifier);
    info!("Instance dir for '{}': {:?}", identifier, path);
    Ok(path)
}

fn get_instance_metadata_path<R: Runtime>(
    app: &tauri::AppHandle<R>,
    identifier: &str,
) -> Result<PathBuf, String> {
    Ok(get_instance_dir(app, identifier)?.join("instance.json"))
}

fn get_instance_image_path<R: Runtime>(
    app: &tauri::AppHandle<R>,
    identifier: &str,
) -> Result<PathBuf, String> {
    let path = get_instance_dir(app, identifier)?.join("icon.png");
    info!("Icon path computed as: {:?}", path);
    Ok(path)
}

fn generate_identifier(name: &str) -> String {
    name.to_lowercase()
        .chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '-'
            }
        })
        .collect::<String>()
        .replace("--", "-")
        .trim_matches('-')
        .to_string()
}

fn check_name_exists<R: Runtime>(
    app: &tauri::AppHandle<R>,
    name: &str,
    exclude_identifier: Option<&str>,
) -> Result<bool, String> {
    let instances = get_instances_internal(app)?;

    for instance in instances {
        if let Some(exclude_id) = exclude_identifier {
            if instance.identifier == exclude_id {
                continue;
            }
        }

        if instance.name.eq_ignore_ascii_case(name) {
            return Ok(true);
        }
    }

    Ok(false)
}

fn get_instances_internal<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<Vec<Instance>, String> {
    let instances_dir = get_instances_dir(app)?;

    if !instances_dir.exists() {
        return Ok(vec![]);
    }

    let mut instances = Vec::new();

    let entries = fs::read_dir(&instances_dir)
        .map_err(|e| format!("Failed to read instances directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();

        if path.is_dir() {
            if let Some(identifier) = path.file_name().and_then(|n| n.to_str()) {
                match load_instance(app, identifier) {
                    Ok(instance) => instances.push(instance),
                    Err(e) => {
                        error!("Failed to load instance {}: {}", identifier, e);
                    }
                }
            }
        }
    }

    Ok(instances)
}

fn create_instance_folders(instance_dir: &Path) -> Result<(), String> {
    let folders = vec![
        "mods",
        "config",
        "saves",
        "logs",
        "resourcepacks",
        "shaderpacks",
        "screenshots",
    ];

    for folder in folders {
        let folder_path = instance_dir.join(folder);
        fs::create_dir_all(&folder_path)
            .map_err(|e| format!("Failed to create folder {}: {}", folder, e))?;
    }

    Ok(())
}

fn load_instance<R: Runtime>(
    app: &tauri::AppHandle<R>,
    identifier: &str,
) -> Result<Instance, String> {
    let metadata_path = get_instance_metadata_path(app, identifier)?;

    if !metadata_path.exists() {
        return Err(format!("Instance {} not found", identifier));
    }

    let content = fs::read_to_string(&metadata_path)
        .map_err(|e| format!("Failed to read instance metadata: {}", e))?;

    let mut instance: Instance = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse instance metadata: {}", e))?;

    // Load icon data if it exists
    if let Some(icon_ref) = &instance.icon {
        if icon_ref == "icon.png" {
            let icon_file = get_instance_image_path(app, identifier)?;
            if icon_file.exists() {
                let icon_bytes =
                    fs::read(&icon_file).map_err(|e| format!("Failed to read icon: {}", e))?;
                let base64 = base64::engine::general_purpose::STANDARD.encode(&icon_bytes);
                instance.icon = Some(format!("data:image/png;base64,{}", base64));
            } else {
                info!("Icon file does not exist at {:?}", icon_file);
                instance.icon = None;
            }
        }
    }

    Ok(instance)
}

fn save_instance<R: Runtime>(app: &tauri::AppHandle<R>, instance: &Instance) -> Result<(), String> {
    let instance_dir = get_instance_dir(app, &instance.identifier)?;
    let metadata_path = get_instance_metadata_path(app, &instance.identifier)?;

    fs::create_dir_all(&instance_dir)
        .map_err(|e| format!("Failed to create instance directory: {}", e))?;

    let json = serde_json::to_string_pretty(instance)
        .map_err(|e| format!("Failed to serialize instance: {}", e))?;

    fs::write(&metadata_path, json)
        .map_err(|e| format!("Failed to write instance metadata: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn create_instance<R: Runtime>(
    app: tauri::AppHandle<R>,
    options: CreateInstanceOption,
) -> Result<Instance, String> {
    info!(
        "create instance: {} {} {}",
        options.name, options.loader, options.version
    );

    if !["vanilla", "fabric", "forge"].contains(&options.loader.as_str()) {
        return Err("Invalid loader. Must be vanilla, fabric, or forge".to_string());
    }

    if !["1.8.9", "1.21.10"].contains(&options.version.as_str()) {
        return Err("Invalid version. Must be 1.8.9 or 1.21.10".to_string());
    }

    if check_name_exists(&app, &options.name, None)? {
        return Err(format!(
            "An instance with the name '{}' already exists",
            options.name
        ));
    }

    let identifier = generate_identifier(&options.name);

    if identifier.is_empty() {
        return Err("Instance name must contain at least one alphanumeric character".to_string());
    }

    let instance_dir = get_instance_dir(&app, &identifier)?;

    fs::create_dir_all(&instance_dir)
        .map_err(|e| format!("Failed to create instance directory: {}", e))?;

    create_instance_folders(&instance_dir)?;

    // Handle icon if provided
    let icon_path = if let Some(icon_data) = options.icon {
        info!(
            "Creating instance with icon, data length: {}",
            icon_data.len()
        );

        let base64_str = if let Some(idx) = icon_data.find(",") {
            &icon_data[idx + 1..]
        } else {
            return Err("Invalid icon data format: missing comma separator".to_string());
        };

        let icon_bytes = base64::engine::general_purpose::STANDARD
            .decode(base64_str)
            .map_err(|e| format!("Failed to decode icon: {}", e))?;

        info!("Decoded icon bytes: {} bytes", icon_bytes.len());

        let icon_file = get_instance_image_path(&app, &identifier)?;
        info!("Writing icon to: {:?}", icon_file);

        fs::write(&icon_file, &icon_bytes)
            .map_err(|e| format!("Failed to save icon to {:?}: {}", icon_file, e))?;

        if icon_file.exists() {
            let file_size = fs::metadata(&icon_file).map(|m| m.len()).unwrap_or(0);
            info!("Icon file created with size: {} bytes", file_size);
        }

        Some("icon.png".to_string())
    } else {
        None
    };

    let instance = Instance {
        name: options.name,
        identifier: identifier.clone(),
        loader: options.loader,
        version: options.version,
        icon: icon_path,
    };

    save_instance(&app, &instance)?;

    info!(
        "Created instance: {} ({})",
        instance.name, instance.identifier
    );

    // Reload instance to convert icon filename to base64 data URL for consistency
    load_instance(&app, &identifier)
}

#[tauri::command]
async fn get_instance<R: Runtime>(
    app: tauri::AppHandle<R>,
    identifier: String,
) -> Result<Instance, String> {
    load_instance(&app, &identifier)
}

#[tauri::command]
async fn get_instances<R: Runtime>(app: tauri::AppHandle<R>) -> Result<Vec<Instance>, String> {
    get_instances_internal(&app)
}

#[tauri::command]
async fn remove_instance<R: Runtime>(
    app: tauri::AppHandle<R>,
    identifier: String,
) -> Result<(), String> {
    let instance_dir = get_instance_dir(&app, &identifier)?;

    if !instance_dir.exists() {
        return Err(format!("Instance {} not found", identifier));
    }

    fs::remove_dir_all(&instance_dir)
        .map_err(|e| format!("Failed to remove instance directory: {}", e))?;

    info!("Removed instance: {}", identifier);

    Ok(())
}

#[tauri::command]
async fn rename_instance<R: Runtime>(
    app: tauri::AppHandle<R>,
    options: RenameInstanceOption,
) -> Result<Instance, String> {
    let mut instance = load_instance(&app, &options.identifier)?;

    if instance.name.eq_ignore_ascii_case(&options.new_name) {
        return Err("New name must be different from the current name".to_string());
    }

    if check_name_exists(&app, &options.new_name, Some(&options.identifier))? {
        return Err(format!(
            "An instance with the name '{}' already exists",
            options.new_name
        ));
    }

    let new_identifier = generate_identifier(&options.new_name);

    if new_identifier.is_empty() {
        return Err("Instance name must contain at least one alphanumeric character".to_string());
    }

    let old_name = instance.name.clone();

    instance.name = options.new_name;

    save_instance(&app, &instance)?;

    info!(
        "Renamed instance {} to {} ({})",
        old_name, instance.name, instance.identifier
    );

    Ok(instance)
}

#[tauri::command]
async fn update_instance_icon<R: Runtime>(
    app: tauri::AppHandle<R>,
    options: UpdateInstanceIconOption,
) -> Result<Instance, String> {
    let identifier = &options.identifier;
    let icon_data = &options.icon_data;

    info!("update_instance_icon called for: {}", identifier);
    info!(
        "Icon data is: {:?}",
        if icon_data.is_some() { "Some" } else { "None" }
    );

    // Load the current instance
    let mut instance = load_instance(&app, identifier)?;

    if let Some(icon_data) = icon_data {
        info!("Icon data received, length: {}", icon_data.len());

        // Extract base64 data from data URL - same as create_instance
        let base64_str = if let Some(idx) = icon_data.find(",") {
            &icon_data[idx + 1..]
        } else {
            return Err("Invalid icon data format: missing comma separator".to_string());
        };

        info!("Base64 string length: {}", base64_str.len());

        let icon_bytes = base64::engine::general_purpose::STANDARD
            .decode(base64_str)
            .map_err(|e| format!("Failed to decode icon: {}", e))?;

        info!("Decoded icon bytes: {} bytes", icon_bytes.len());

        let instance_dir = get_instance_dir(&app, identifier)?;
        info!("Instance directory: {:?}", instance_dir);

        fs::create_dir_all(&instance_dir)
            .map_err(|e| format!("Failed to create instance directory: {}", e))?;

        let icon_file = get_instance_image_path(&app, identifier)?;
        info!("Writing icon to: {:?}", icon_file);

        // Make sure parent directory exists
        if let Some(parent) = icon_file.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create parent directory: {}", e))?;
            info!("Parent directory ready: {:?}", parent);
        }

        fs::write(&icon_file, &icon_bytes)
            .map_err(|e| format!("Failed to save icon to {:?}: {}", icon_file, e))?;

        info!("Successfully saved icon to {:?}", icon_file);

        // Verify file was written
        std::thread::sleep(std::time::Duration::from_millis(100));

        if icon_file.exists() {
            let file_size = fs::metadata(&icon_file).map(|m| m.len()).unwrap_or(0);
            info!("Icon file verified - exists with size: {} bytes", file_size);
        } else {
            error!("Icon file was not created at {:?}", icon_file);
            return Err(format!("Icon file was not created at {:?}", icon_file));
        }

        // Store just the filename in the JSON
        instance.icon = Some("icon.png".to_string());
    } else {
        // Remove icon
        let icon_file = get_instance_image_path(&app, identifier)?;
        if icon_file.exists() {
            fs::remove_file(&icon_file).map_err(|e| format!("Failed to remove icon: {}", e))?;
        }
        instance.icon = None;
    }

    save_instance(&app, &instance)?;
    info!("Saved instance metadata");

    // Reload instance to convert filename to base64 data URL
    info!("Reloading instance to get base64 icon");
    let result = load_instance(&app, identifier)?;

    info!("Returning updated instance with icon");
    Ok(result)
}
