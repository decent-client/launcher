import { app } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/core";
import { storeAccounts } from "~/lib/account";
import type { MinecraftAccount } from "~/lib/types/account";

export async function createMinecraftAuth(): Promise<unknown> {
  const respone = await invoke("create_minecraft_auth", { app });

  await storeAccounts("test.json", [respone as MinecraftAccount]);

  return respone;
}
