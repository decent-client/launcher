import * as SelectPrimitive from "@radix-ui/react-select";
import { titleCase } from "string-ts";
import { buttonVariants } from "~/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem } from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { type Theme, themes, useTheme } from "~/providers/theme";

export function ThemeToggle() {
  const { theme, setTheme, icon } = useTheme();

  return (
    <Select defaultValue={theme} onValueChange={(value: Theme) => setTheme(value)}>
      <SelectPrimitive.Trigger
        className={cn(buttonVariants({ variant: "ghost", className: "size-6.5" }))}
        data-slot="select-trigger"
      >
        <SelectPrimitive.Icon asChild>{icon}</SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectContent>
        <SelectGroup>
          {themes.map((theme) => (
            <SelectItem key={theme.name} value={theme.name} onSelect={() => setTheme(theme.name)}>
              {theme.icon} {titleCase(theme.name)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
