import { BaseDirectory, create, exists, mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import type { MinecraftAccount } from "~/lib/types/account";

type FileName = `${string}.json`;

export const directory = { baseDir: BaseDirectory.AppData };

export async function storeAccounts(fileName: FileName, accounts: MinecraftAccount[]) {
  await mkdir("", { ...directory, recursive: true });
  await writeTextFile(fileName, JSON.stringify(accounts, null, 2), { ...directory, createNew: true });
}

export async function getAccounts(fileName: FileName) {
  try {
    const file = await readTextFile(fileName, directory);

    return JSON.parse(file) as MinecraftAccount[];
  } catch (error) {
    console.log(error);

    if (!(await exists(fileName, directory))) {
      await mkdir("", { ...directory, recursive: true });
      await create(fileName, directory);
    }

    return [];
  }
}
