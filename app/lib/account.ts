import { BaseDirectory, exists, mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import type { MinecraftAccount } from "~/lib/types/account";

type FileName = `${string}.json`;

export const directory = { baseDir: BaseDirectory.AppData };

async function writeToFile(fileName: FileName, content: unknown) {
  if (!(await exists(fileName, directory))) {
    await mkdir("", { ...directory, recursive: true });
  }

  await writeTextFile(fileName, JSON.stringify(content, null, 2), { ...directory, createNew: true });
}

export async function storeAccounts(fileName: FileName, accounts: MinecraftAccount[]) {
  writeToFile(fileName, accounts);
}

export async function getAccounts(fileName: FileName) {
  try {
    const file = await readTextFile(fileName, directory);

    return JSON.parse(file) as MinecraftAccount[];
  } catch (error) {
    return [];
  }
}
