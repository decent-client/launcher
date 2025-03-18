import { app } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/core";

export async function createMinecraftAuth(): Promise<string> {
  return await invoke("create_minecraft_auth", { app });
}
