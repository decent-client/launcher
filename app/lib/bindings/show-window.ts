import { invoke } from "@tauri-apps/api/core";

export async function showLauncherWindow(delay?: number) {
  await invoke("show_launcher_window", { delay });
}
