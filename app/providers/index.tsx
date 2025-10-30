import { AppWindowProvider } from "~/providers/app-window";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AppWindowProvider>{children}</AppWindowProvider>;
}
