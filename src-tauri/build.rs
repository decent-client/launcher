use tauri_build::{DefaultPermissionRule, InlinedPlugin};

fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .plugin(
                "account",
                InlinedPlugin::new()
                    .commands(&[
                        "authenticate",
                        "get_all",
                        "get_active",
                        "set_active",
                        "remove",
                    ])
                    .default_permission(DefaultPermissionRule::AllowAllCommands),
            )
            .plugin(
                "instance",
                InlinedPlugin::new()
                    .commands(&[
                        "create_instance",
                        "get_instance",
                        "remove_instance",
                        "get_instances",
                        "rename_instance",
                        "update_instance_icon",
                    ])
                    .default_permission(DefaultPermissionRule::AllowAllCommands),
            ),
    )
    .expect("failed to build tauri application")
}
