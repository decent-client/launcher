import { BellIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function Notifications({
  className,
}: {
  className?: string;
}) {
  return (
    <Button className={cn("size-6.5 ", className)} variant={"ghost"} size={"icon"}>
      <BellIcon className="size-3.5" />
    </Button>
  );
}
