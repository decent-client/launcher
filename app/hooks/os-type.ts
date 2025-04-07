import { type } from "@tauri-apps/plugin-os";

export function getOsType() {
  return Promise.resolve(type());
}
