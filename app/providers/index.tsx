import { AccountsProvider } from "~/providers/accounts";
import { AppWindowProvider } from "~/providers/app-window";
import { ThemeProvider } from "~/providers/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppWindowProvider>
      <ThemeProvider>
        <AccountsProvider>{children}</AccountsProvider>
      </ThemeProvider>
    </AppWindowProvider>
  );
}
