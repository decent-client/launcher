import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSessionStorage } from "~/hooks/storage";
import { useSettings } from "~/providers/settings";

export type GameOptionsTab = "version" | "mods";

type GameOptionsProviderState = {
  tab: GameOptionsTab;
  setTab: (tab: GameOptionsTab) => void;
  version: string | undefined;
  setVersion: (version: string) => void;
};

const GameOptionsContext = createContext<GameOptionsProviderState>({
  tab: "version",
  setTab: () => null,
  version: undefined,
  setVersion: () => null,
});

export function GameOptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tab, setTab] = useSessionStorage<GameOptionsTab>("game-options-tab", "version");
  const { form, settings, settingsLoaded } = useSettings();
  const [version, setVersion] = useState<string | undefined>();
  const [mods, setMods] = useState();
  const loadedVersion = useRef(false);

  useEffect(() => {
    if (!loadedVersion.current && settingsLoaded) {
      setVersion(settings.gameOptions.version);
      loadedVersion.current = true;
    }
  }, [settingsLoaded, settings]);

  useEffect(() => {
    if (typeof version === "string" && loadedVersion.current) {
      form.setValue("gameOptions.version", version);
    }
  }, [version, form]);

  return (
    <GameOptionsContext.Provider value={{ tab, setTab, version, setVersion }}>{children}</GameOptionsContext.Provider>
  );
}

export function useGameOptions() {
  const context = useContext(GameOptionsContext);

  if (context === undefined) throw new Error("useGameOptions must be used within a GameOptionsProvider");

  return context;
}
