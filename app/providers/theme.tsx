import { setTheme as setAppTheme } from "@tauri-apps/api/app";
import { Loader2Icon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { type JSX, createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "~/hooks/storage";

export type Theme = "light" | "dark" | "system";
export const themes: Theme[] = ["light", "dark", "system"];
export const icons = {
  light: <SunIcon className="size-3.5" />,
  dark: <MoonIcon className="size-3.5" />,
  system: <MonitorIcon className="size-3.5" />,
};

type ThemeProviderState = {
  theme: Theme;
  themeIcon: JSX.Element;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  themeIcon: <Loader2Icon className="size-3.5 animate-spin" />,
  setTheme: () => null,
});

function resolveTheme(theme: Theme) {
  if (theme === "system") {
    return undefined;
  }

  return theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setTheme] = useLocalStorage(storageKey, defaultTheme);
  const [themeIcon, setIcon] = useState(<Loader2Icon className="size-3.5 animate-spin" />);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      let resolvedTheme = theme;

      root.classList.remove(...themes);

      if (theme === "system") {
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setIcon(icons[resolvedTheme]);
      } else {
        setIcon(icons[theme]);
      }

      root.classList.add(resolvedTheme);
      setAppTheme(resolveTheme(theme));
    }
  }, [theme]);

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        themeIcon,
        setTheme,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}
