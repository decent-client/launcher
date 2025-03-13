use tauri_build::InlinedPlugin;

fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new().plugin(
            "player-skin",
            InlinedPlugin::new()
                .commands(&["get_skin_texture", "get_face_texture"])
                .default_permission(tauri_build::DefaultPermissionRule::AllowAllCommands),
        ),
    )
    .expect("failed to run tauri-build");
}
