import { Loader2, Monitor, Moon, MoonStar, Sun } from "lucide-react";
import { createContext, type JSX, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "~/hooks/storage";

export type Theme = "light" | "dark" | "oled" | "system";

export const icons: { [K in Theme]: JSX.Element } = {
  light: <Sun className="size-3.5" />,
  dark: <Moon className="size-3.5" />,
  oled: <MoonStar className="size-3.5" />,
  system: <Monitor className="size-3.5" />,
};

export const themes: { name: Theme; icon: JSX.Element }[] = [
  { name: "light", icon: icons.light },
  { name: "dark", icon: icons.dark },
  { name: "oled", icon: icons.oled },
  { name: "system", icon: icons.system },
];

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: Exclude<Theme, "system">;
  icon: JSX.Element;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  resolvedTheme: "light",
  icon: <Loader2 className="size-3.5 animate-spin" />,
  setTheme: () => null,
});

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
  const [resolvedTheme, setResolvedTheme] = useState<Exclude<Theme, "system">>("light");
  const [icon, setIcon] = useState(<Loader2 className="size-3.5 animate-spin" />);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      let resolvedTheme = theme;

      root.classList.remove(...themes.map((t) => t.name));

      if (theme === "system") {
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setResolvedTheme(resolvedTheme);
        setIcon(icons[resolvedTheme]);
      } else {
        setResolvedTheme(theme);
        setIcon(icons[theme]);
      }

      root.classList.add(resolvedTheme);
    }
  }, [theme]);

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        resolvedTheme,
        icon,
        setTheme,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
