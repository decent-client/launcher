import { invoke } from "@tauri-apps/api/core";

type AccountRecord = {
  uuid: string;
  username: string;
};

export async function authenticateAccount(): Promise<AccountRecord> {
  return await invoke("plugin:account|authenticate");
}
