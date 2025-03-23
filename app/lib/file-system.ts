import { BaseDirectory, exists, mkdir, writeTextFile } from "@tauri-apps/plugin-fs";

export type FileName = `${string}.json`;

export const directory = { baseDir: BaseDirectory.AppData };

export async function storeToTextFile(fileName: FileName, content: unknown) {
  if (!(await exists(fileName, directory))) {
    await mkdir("", { ...directory, recursive: true });
    await writeTextFile(fileName, JSON.stringify(content, null, 2), { ...directory, createNew: true });
  }

  await writeTextFile(fileName, JSON.stringify(content, null, 2), directory);
}

export * from "@tauri-apps/plugin-fs";
