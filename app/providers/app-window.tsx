import type { Window } from "@tauri-apps/api/window";
import { createContext, useContext, useEffect, useState } from "react";

type AppWindowProviderState = {
  appWindow: Window | null;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isMaximized: boolean;
};

const AppWindowContext = createContext<AppWindowProviderState>({
  appWindow: null,
  minimizeWindow: () => Promise.resolve(),
  maximizeWindow: () => Promise.resolve(),
  closeWindow: () => Promise.resolve(),
  isMaximized: false,
});

export function AppWindowProvider({ children }: { children: React.ReactNode }) {
  const [appWindow, setAppWindow] = useState<Window | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@tauri-apps/api/window").then((module) => {
        setAppWindow(module.getCurrentWindow());
      });
    }
  }, []);

  useEffect(() => {
    const updateMaximizedState = async () => {
      if (appWindow) {
        const maximized = await appWindow.isMaximized();
        setIsMaximized(maximized);
      }
    };

    updateMaximizedState();

    if (appWindow) {
      const unlistenResize = appWindow.onResized(updateMaximizedState);

      return () => {
        unlistenResize.then((unlisten) => unlisten());
      };
    }
  }, [appWindow]);

  async function minimizeWindow() {
    appWindow?.minimize();
  }

  async function maximizeWindow() {
    appWindow?.toggleMaximize();
  }

  async function closeWindow() {
    appWindow?.close();
  }

  return (
    <AppWindowContext.Provider
      value={{
        appWindow,
        minimizeWindow,
        maximizeWindow,
        closeWindow,
        isMaximized,
      }}
    >
      {children}
    </AppWindowContext.Provider>
  );
}

export function useAppWindow() {
  const context = useContext(AppWindowContext);

  if (context === undefined) {
    throw new Error("useAppWindow must be used within a AppWindowProvider");
  }

  return context;
}
