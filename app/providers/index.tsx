import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { BreadcrumbProvider } from "~/providers/breadcrumbs";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BreadcrumbProvider>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </BreadcrumbProvider>
  );
}
