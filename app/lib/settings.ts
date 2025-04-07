import { appDataDir, join } from "@tauri-apps/api/path";
import { z } from "zod";
import type { Settings } from "~/providers/settings";

const gameOptions = z.object({
  version: z.string(),
});

export const schema = z.object({
  launcher: z.object({ language: z.string(), autoBoot: z.boolean(), exitToDock: z.boolean() }),
  preferences: z.object({
    ram: z.number(),
    afterLaunch: z.string(),
    resolution: z.object({
      width: z
        .preprocess(
          (val) => (val === "" ? "auto" : Number.isNaN(Number(val)) ? val : Number(val)),
          z.union([
            z.literal("auto", {
              errorMap: () => ({
                message: 'Width must be a number or "auto".',
              }),
            }),
            z.number({ message: "Width must be a number." }).positive({ message: "Width must be a positive number." }),
          ]),
        )
        .default("auto"),
      height: z
        .preprocess(
          (val) => (val === "" ? "auto" : Number.isNaN(Number(val)) ? val : Number(val)),
          z.union([
            z.literal("auto", {
              errorMap: () => ({
                message: 'Height must be a number or "auto".',
              }),
            }),
            z
              .number({ message: "Height must be a number." })
              .positive({ message: "Height must be a positive number." }),
          ]),
        )
        .default("auto"),
    }),
  }),
  notifications: z.object({
    friendsOnline: z.boolean(),
    friendsPlaying: z.boolean(),
    discord: z.object({
      richPresence: z.boolean(),
    }),
  }),
  advanced: z.object({
    gameDirectory: z.string().optional(),
    javaPath: z.string().optional(),
    branch: z.string(),
    updatePreferences: z.string(),
    JVMArguments: z
      .string()
      .refine((value) => value === "" || /^-[\w\d]+(\s+-[\w\d]+)*$/.test(value), {
        message: "Invalid JVM arguments format.",
      })
      .optional(),
    displayTooltips: z.boolean(),
    reducedAnimations: z.boolean(),
  }),
  gameOptions,
});

export async function defaultMinecraftPath() {
  return await join(await appDataDir(), ".minecraft");
}

export async function defaultJavaPath() {}

export const defaultSettings: Settings = {
  launcher: {
    language: "en-us",
    autoBoot: true,
    exitToDock: true,
  },
  preferences: {
    ram: 4096,
    afterLaunch: "hide",
    resolution: {
      width: "auto",
      height: "auto",
    },
  },
  notifications: {
    friendsOnline: true,
    friendsPlaying: true,
    discord: {
      richPresence: true,
    },
  },
  advanced: {
    gameDirectory: undefined,
    javaPath: undefined,
    branch: "master",
    updatePreferences: "normal",
    displayTooltips: true,
    reducedAnimations: false,
  },
  gameOptions: {
    version: "1.8.9",
  },
};
