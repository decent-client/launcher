import { ArrowRightIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { usePlayerSkin } from "~/hooks/player-skin";
import { cn } from "~/lib/utils";

export function SelectAccount({ className }: { className?: string }) {
  const { face, loading } = usePlayerSkin("a75000c85c0f4550a278780d2f37c745");

  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              className={cn("group h-7 justify-start has-[>svg]:px-1 has-[>svg]:pr-3", className)}
              variant={"ghost"}
            >
              {loading ? (
                <Skeleton className="size-5 rounded-sm" />
              ) : (
                <img className="size-5 rounded-sm" src={face} alt="Skin Face" />
              )}

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
