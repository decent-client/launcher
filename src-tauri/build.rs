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
                    .commands(&["get_all"])
                    .default_permission(DefaultPermissionRule::AllowAllCommands),
            ),
    )
    .expect("failed to build tauri application")
}
