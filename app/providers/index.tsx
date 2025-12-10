import { AccountsProvider } from "~/providers/accounts";
import { AppWindowProvider } from "~/providers/app-window";
import { InstanceProvider } from "~/providers/instance";
import { SidebarProvider } from "~/providers/sidebar";
import { ThemeProvider } from "~/providers/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AccountsProvider>
      <AppWindowProvider>
        <InstanceProvider>
          <SidebarProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </SidebarProvider>
        </InstanceProvider>
      </AppWindowProvider>
    </AccountsProvider>
  );
}
