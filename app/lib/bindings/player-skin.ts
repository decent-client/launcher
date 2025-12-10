import { invoke } from "@tauri-apps/api/core";

export async function getPlayerSkin(uuid: string, scale: number = 1) {
  return await invoke<string>("player_skin", { uuid, scale });
}

export async function getPlayerFace(uuid: string, scale: number = 1) {
  return await invoke<string>("player_face", { uuid, scale });
}
