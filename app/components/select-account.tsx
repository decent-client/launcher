import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { useAccounts } from "~/providers/accounts";

export function SelectAccount({ className }: { className?: string }) {
  const { authenticate, accounts, account } = useAccounts();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn("justify-start pl-2", className)} variant="ghost">
          <img
            className="size-5 rounded-sm"
            src={account ? `https://skins.mcstats.com/face/${account.uuid}` : "/face-fallback.png"}
            alt="face"
          />
          <span className="font-minecraft text-base text-minecraft-white">{account ? account.username : "Guest"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Minecraft Account</DialogTitle>
        </DialogHeader>
        <ul>
          {accounts.map((a) => (
            <li key={a.uuid}>{a.username}</li>
          ))}
        </ul>
        <DialogFooter>
          <Button className="w-full gap-2" variant={"secondary"} onClick={() => authenticate()}>
            <Plus className="size-4" />
            <span className="text-base">{accounts.length > 0 ? "Add another account" : "Add account"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
