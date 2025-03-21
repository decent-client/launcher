import { BellIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Drawer, DrawerTrigger } from "~/components/ui/drawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export function Notifications({
  className,
}: {
  className?: string;
}) {
  return (
    <Drawer>
      <Tooltip>
        <TooltipTrigger asChild>
          <DrawerTrigger asChild>
            <Button className={cn("size-6.5", className)} variant={"ghost"} size={"icon"}>
              <BellIcon className="size-3.5" />
            </Button>
          </DrawerTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">Notifications</TooltipContent>
      </Tooltip>
    </Drawer>
  );
}
