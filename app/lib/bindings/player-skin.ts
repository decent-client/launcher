import { invoke } from "@tauri-apps/api/core";

export async function getPlayerFaceTexture(uuid: string): Promise<string> {
  return await invoke("plugin:player-skin|get_face_texture", { uuid });
}

export async function getPlayerTexture(uuid: string): Promise<string> {
  return await invoke("plugin:player-skin|get_skin_texture", { uuid });
}
