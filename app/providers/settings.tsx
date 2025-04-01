import { zodResolver } from "@hookform/resolvers/zod";
import {} from "@tauri-apps/api/path";
import { deepmerge } from "deepmerge-ts";
import { createContext, useContext, useRef, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import type { z } from "zod";
import { useAsyncEffect } from "~/hooks/async-effect";
import { useDebouncedCallback } from "~/hooks/debounce";
import { useSessionStorage } from "~/hooks/storage";
import { directory, exists, readTextFile, storeToTextFile } from "~/lib/file-system";
import { defaultSettings, schema } from "~/lib/settings";

export type Settings = z.infer<typeof schema>;
export type SettingsTab = "launcher" | "preferences" | "notifications" | "advanced" | "resources";

type FileName = `${string}.json`;

type SettingsProviderState = {
  form: UseFormReturn<Settings>;
  settings: Settings;
  tab: SettingsTab;
  setTab: (tab: SettingsTab) => void;
};

const SettingsProviderContext = createContext<SettingsProviderState>({
  form: undefined as unknown as UseFormReturn<Settings>,
  settings: defaultSettings,
  tab: "launcher",
  setTab: () => null,
});

export function SettingsProvider({
  children,
  defaults = defaultSettings,
  fileName = "launcher-settings.json",
}: {
  children: React.ReactNode;
  defaults?: Settings;
  fileName?: FileName;
}) {
  const [settings, setSettings] = useState(defaults);
  const [tab, setTab] = useSessionStorage<SettingsTab>("settings-tab", "launcher");
  const isResettingForm = useRef(false);

  const form = useForm<Settings>({
    resolver: zodResolver(schema),
    defaultValues: defaultSettings,
    mode: "onChange",
  });

  const debounce = useDebouncedCallback(async (settings: Settings) => {
    storeToTextFile(fileName, deepmerge(defaultSettings, settings));
  }, 200);

  async function resetForm() {
    const content = deepmerge(defaultSettings, JSON.parse(await readTextFile(fileName, directory)));

    isResettingForm.current = true;
    form.reset(content);
    setSettings(content);
    isResettingForm.current = false;
  }

  useAsyncEffect(async () => {
    if (!(await exists(fileName, directory))) {
      await storeToTextFile(fileName, defaultSettings);
    }

    resetForm();

    const { unsubscribe } = form.watch((values) => {
      if (!isResettingForm.current) {
        setSettings(values as Settings);
        debounce(values as Settings);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <SettingsProviderContext.Provider value={{ form, settings, tab, setTab }}>
      {children}
    </SettingsProviderContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsProviderContext);

  if (context === undefined) throw new Error("useSettings must be used within a SettingsProvider");

  return context;
}
