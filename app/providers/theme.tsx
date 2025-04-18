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
  resolvedTheme: "light" | "dark";
  backgroundImage: string;
  themeIcon: JSX.Element;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  resolvedTheme: "light",
  backgroundImage: "",
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
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [themeIcon, setIcon] = useState(<Loader2Icon className="size-3.5 animate-spin" />);
  const [backgroundImage, setBackgroundImage] = useState("url(/images/launcher-background.png)");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      let resolvedTheme = theme;

      root.classList.remove(...themes);

      if (theme === "system") {
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setResolvedTheme(resolvedTheme);
        setIcon(icons[resolvedTheme]);

        if (resolvedTheme === "light") {
          setBackgroundImage("url(/images/launcher-background.png)");
        } else {
          setBackgroundImage("url(/images/launcher-background-dark.png)");
        }
      } else {
        setIcon(icons[theme]);
        setResolvedTheme(theme);

        if (theme === "light") {
          setBackgroundImage("url(/images/launcher-background.png)");
        } else {
          setBackgroundImage("url(/images/launcher-background-dark.png)");
        }
      }

      root.classList.add(resolvedTheme);
      setAppTheme(resolveTheme(theme));
    }
  }, [theme]);

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        resolvedTheme,
        backgroundImage,
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
