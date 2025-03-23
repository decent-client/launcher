import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { AccountProvider } from "~/providers/account";
import { AppWindowProvider } from "~/providers/app-window";
import { BreadcrumbProvider } from "~/providers/breadcrumbs";
import { ThemeProvider } from "~/providers/theme";
import { SettingsProvider } from "./settings";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppWindowProvider>
      <ThemeProvider>
        <BreadcrumbProvider>
          <SettingsProvider>
            <AccountProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </AccountProvider>
          </SettingsProvider>
        </BreadcrumbProvider>
      </ThemeProvider>
    </AppWindowProvider>
  );
}
