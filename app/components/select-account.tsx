import { Check, Plus, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { usePlayerSkin } from "~/hooks/player-skin";
import { cn } from "~/lib/utils";
import { type AccountSummary, useAccounts } from "~/providers/accounts";

export function SelectAccount({ className }: { className?: string }) {
  const { authenticate, accounts, account } = useAccounts();
  const { face } = usePlayerSkin(account?.uuid);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn("justify-start pl-2", className)} variant="ghost">
          <img className="size-5 rounded-sm" src={face} alt="face" />
          <span className="font-minecraft text-base text-minecraft-white">{account ? account.username : "Guest"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Minecraft Account</DialogTitle>
          <DialogDescription>Select an existing account or add a new one.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          {accounts.length > 0 ? (
            accounts.map((a) => <AccountItem key={a.uuid} account={a} />)
          ) : (
            <p className="py-4 text-center text-muted-foreground">You haven't added any accounts yet.</p>
          )}
        </div>
        <Separator />
        <DialogFooter>
          <Button className="grow" variant="default" size="sm" onClick={() => authenticate()}>
            <Plus />
            Add account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AccountItem({ account, className }: { account: AccountSummary; className?: string }) {
  const { setActive, remove } = useAccounts();
  const { face } = usePlayerSkin(account.uuid);

  return (
    <ButtonGroup className={cn("group not-hover:gap-0! gap-1.5! w-full", className)}>
      <ButtonGroup className="flex-1">
        <Button
          className={cn("justify-between pl-1.5! flex-1", {
            "bg-blue-500/25 hover:bg-blue-500/50!": account.isActive,
          })}
          variant="ghost"
          onClick={() => setActive(account.uuid)}
          size="sm"
        >
          <fieldset className="flex items-center gap-x-2">
            <img className="size-5 rounded-sm" src={face} alt="face" />
            <span className="font-minecraft text-base text-minecraft-white">{account.username}</span>
          </fieldset>
          {account.isActive && <Check />}
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button
          className="group-hover:inline-flex hidden"
          variant="destructive"
          size="icon-sm"
          onClick={() => remove(account.uuid)}
        >
          <X />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
