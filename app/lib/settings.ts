import { z } from "zod";
import type { Settings } from "~/providers/settings";

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
    discord: z.object({
      richPresence: z.boolean(),
    }),
  }),
  advanced: z.object({}),
});

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
    discord: { richPresence: true },
  },
  advanced: {},
};
