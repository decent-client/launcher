import { ArrowRightIcon, CheckIcon, PlusIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import { MicrosoftIcon } from "~/components/icons/microsoft";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { usePlayerSkin } from "~/hooks/player-skin";
import { microsoftAuth } from "~/lib/bindings/msa-auth";
import type { MinecraftAccount } from "~/lib/types/account";
import { cn } from "~/lib/utils";
import { useAccount } from "~/providers/account";
import { useTheme } from "~/providers/theme";

export function SelectAccount({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const { account, accounts } = useAccount();
  const { face, loading } = usePlayerSkin(account?.uuid);

  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              className={cn("group h-7 justify-start has-[>svg]:px-1 has-[>svg]:pr-4", className)}
              variant={resolvedTheme === "light" ? "secondary" : "ghost"}
            >
              {loading ? (
                <Skeleton className="size-5 rounded-sm" />
              ) : (
                <img className="size-5 rounded-sm" src={face} alt="Skin Face" />
              )}
              <span className="font-minecraft text-base leading-5">{account ? account.username : "Guest"}</span>
              <ArrowRightIcon className="size-4 shrink-0 translate-x-1 stroke-2.5 stroke-muted-foreground transition-transform group-hover:translate-x-2" />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent side="right">Select Account</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-x-2 font-bold">
            <MicrosoftIcon className="size-4.5" />
            Select Minecraft Account
          </DialogTitle>
          <DialogDescription className="leading-4">Select an existing account, or add a new one.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          {accounts.length > 0 ? (
            accounts.map((account) => <AccountRow key={account.uuid} account={account} />)
          ) : (
            <div className="px-8 py-6 text-center font-normal text-base">You do not have any accounts added.</div>
          )}
        </div>
        <DialogFooter>
          <Button className="w-full gap-2" variant={"secondary"} onClick={() => microsoftAuth()}>
            <PlusIcon className="size-4" />
            <span className="text-base">{accounts.length > 0 ? "Add another account" : "Add account"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AccountRow({ account }: { account: MinecraftAccount }) {
  const { face } = usePlayerSkin(account.uuid);
  const { setAccount, removeAccount } = useAccount();

  return (
    <motion.fieldset
      key={account.uuid}
      className="grid overflow-hidden rounded-md"
      initial={{ gridTemplateColumns: "1fr 0rem" }}
      whileHover={{
        gridTemplateColumns: "1fr 2.25rem",
      }}
    >
      <Button
        className={cn(
          "relative w-full justify-start gap-2 pl-1.5 has-[>svg]:pl-1.5",
          account.active && "bg-blue-500/25 hover:bg-blue-500/50",
        )}
        variant={"ghost"}
        size={"sm"}
        onClick={() => {
          setAccount(account);
        }}
      >
        <img src={face} className="rounded-sm" alt="Face" width={20} height={20} />
        <span className="font-minecraft text-base">{account.username}</span>
        {account.active && <CheckIcon className="absolute right-4" strokeWidth={2.5} size={16} />}
      </Button>
      <Button className="ml-1 size-8 p-0" variant={"secondary"} size={"sm"} onClick={() => removeAccount(account)}>
        <XIcon className="size-4 stroke-red-500" />
      </Button>
    </motion.fieldset>
  );
}
