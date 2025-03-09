import { ArrowRightIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export function SelectAccount({ className }: { className?: string }) {
  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              className={cn("group h-7 justify-start has-[>svg]:px-1 has-[>svg]:pr-3", className)}
              variant={"ghost"}
            >
              <img
                className="size-5 rounded-sm"
                src={"https://skins.mcstats.com/face/1c682784-a9cc-43bd-8007-3aa2e3878712"}
                alt="Skin Face"
              />
              <span className="font-minecraft text-base leading-5">liqw</span>
              <ArrowRightIcon className="size-4 shrink-0 stroke-2.5 stroke-muted-foreground transition-transform group-hover:translate-x-1" />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent side="right">Select Account</TooltipContent>
      </Tooltip>
    </Dialog>
  );
}
