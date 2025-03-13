import { cn } from "~/lib/utils";

export function TitleBarMenu({ className }: { className?: string }) {
  return <fieldset className={cn("mr-1 flex h-8 items-center gap-x-0.5", className)}>{/* <ThemeToggle /> */}</fieldset>;
}
