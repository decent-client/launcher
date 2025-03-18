import { CheckIcon, Monitor, Moon, MoonStar, Sun } from "lucide-react";
import type { JSX } from "react";
import { titleCase } from "string-ts";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { type Theme, useTheme } from "~/providers/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const themes: { [key in Theme]: JSX.Element } = {
    light: <Sun className="size-3.5" />,
    dark: <Moon className="size-3.5" />,
    oled: <MoonStar className="size-3.5" />,
    system: <Monitor className="size-3.5" />,
  };

  function resolveIcon(theme: Theme) {
    if (theme === "system") {
      return themes[window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"];
    }

    return themes[theme === "oled" || theme === "dark" ? "dark" : "light"];
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn("size-[1.625rem]", className)}
              variant={"ghost"}
              size={"icon"}
              suppressHydrationWarning
            >
              {resolveIcon(theme)}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">Select Theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="center" sideOffset={6}>
        {Object.keys(themes).map((key) => (
          <DropdownMenuItem key={key} className="flex cursor-pointer gap-x-2" onClick={() => setTheme(key as Theme)}>
            {themes[key as Theme]}
            {titleCase(key)}
            {key === theme && <CheckIcon className="mr-1 ml-auto size-3.5 stroke-green-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
