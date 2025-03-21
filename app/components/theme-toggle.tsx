import { CheckIcon } from "lucide-react";
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
import { type Theme, icons, themes, useTheme } from "~/providers/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, themeIcon, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button className={cn("size-6.5", className)} variant={"ghost"} size={"icon"}>
              {themeIcon}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">Select Theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="center" sideOffset={6}>
        {themes.map((key) => (
          <DropdownMenuItem key={key} className="flex cursor-pointer gap-x-2" onClick={() => setTheme(key as Theme)}>
            {icons[key as keyof typeof icons]}
            {titleCase(key)}
            {key === theme && <CheckIcon className="mr-1 ml-auto size-3.5 stroke-green-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
