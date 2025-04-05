import { createContext, useContext, useState } from "react";
import { useSessionStorage } from "~/hooks/storage";

export type GameOptionsTab = "version" | "mods";

type GameOptionsProviderState = {
  tab: GameOptionsTab;
  setTab: (tab: GameOptionsTab) => void;
  version: string;
  setVersion: (version: string) => void;
};

const GameOptionsContext = createContext<GameOptionsProviderState>({
  tab: "version",
  setTab: () => null,
  version: "1.21",
  setVersion: (version: string) => null,
});

export function GameOptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tab, setTab] = useSessionStorage<GameOptionsTab>("game-options-tab", "version");
  const [version, setVersion] = useState("1.21");

  return (
    <GameOptionsContext.Provider value={{ tab, setTab, version, setVersion }}>{children}</GameOptionsContext.Provider>
  );
}

export function useGameOptions() {
  const context = useContext(GameOptionsContext);

  if (context === undefined) throw new Error("useGameOptions must be used within a GameOptionsProvider");

  return context;
}
