import { BellIcon, XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "~/components/ui/drawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export function Notifications({
  className,
}: {
  className?: string;
}) {
  return (
    <Drawer direction="right">
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
      <DrawerContent className="mt-8 rounded-ss-xl border-t">
        <DrawerClose className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
          <XIcon />
          <span className="sr-only">Close</span>
        </DrawerClose>
        <DrawerHeader>
          <DrawerTitle className="font-bold">Notification Center</DrawerTitle>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
