import { createContext, useContext } from "react";
import { useLocalStorage } from "~/hooks/storage";

export type Theme = "dark" | "light" | "system" | "oled";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setTheme] = useLocalStorage(storageKey, defaultTheme);

  // useEffect(() => {
  //   if (typeof document !== "undefined") {
  //     const root = window.document.documentElement;

  //     root.classList.remove("light", "dark", "oled");

  //     if (theme === "system") {
  //       const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  //       root.classList.add(systemTheme);
  //       return;
  //     }

  //     root.classList.add(theme);
  //   }
  // }, [theme]);

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme,
      }}
      {...props}
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
