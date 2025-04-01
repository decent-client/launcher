import { MotionConfig } from "motion/react";
import { useEffect, useState } from "react";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { AccountProvider } from "~/providers/account";
import { AppWindowProvider } from "~/providers/app-window";
import { BreadcrumbProvider } from "~/providers/breadcrumbs";
import { SettingsProvider, useSettings } from "~/providers/settings";
import { ThemeProvider } from "~/providers/theme";

type ReducedMotionConfig = "always" | "never" | "user";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppWindowProvider>
      <ThemeProvider>
        <BreadcrumbProvider>
          <SettingsProvider>
            <AccountProvider>
              <TooltipProvider>
                <ReduceMotionConfig>
                  {children}
                  <Toaster />
                </ReduceMotionConfig>
              </TooltipProvider>
            </AccountProvider>
          </SettingsProvider>
        </BreadcrumbProvider>
      </ThemeProvider>
    </AppWindowProvider>
  );
}

function ReduceMotionConfig({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState<ReducedMotionConfig>("user");
  const { settings } = useSettings();

  useEffect(() => {
    setReduceMotion(settings.advanced.reducedAnimations ? "always" : "never");
  }, [settings]);

  return <MotionConfig reducedMotion={reduceMotion}>{children}</MotionConfig>;
}
