import { directory, readTextFile, storeToTextFile } from "~/lib/file-system";
import type { MinecraftAccount } from "~/lib/types/account";

type FileName = `${string}.json`;

export async function storeAccounts(fileName: FileName, accounts: MinecraftAccount[]) {
  await storeToTextFile(fileName, accounts);
}

export async function getAccounts(fileName: FileName) {
  try {
    const file = await readTextFile(fileName, directory);

    return JSON.parse(file) as MinecraftAccount[];
  } catch (error) {
    return [];
  }
}
