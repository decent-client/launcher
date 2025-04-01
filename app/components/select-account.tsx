import { ArrowRightIcon, CheckIcon, ExternalLinkIcon, PlusIcon } from "lucide-react";
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
import { createMinecraftAuth } from "~/lib/bindings/msa-auth";
import type { MinecraftAccount } from "~/lib/types/account";
import { cn } from "~/lib/utils";
import { useAccount } from "~/providers/account";
import { useTheme } from "~/providers/theme";

export function SelectAccount({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const { accounts } = useAccount();
  const { face, loading } = usePlayerSkin("a75000c85c0f4550a278780d2f37c745");

  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              className={cn("group h-7 justify-start has-[>svg]:px-1 has-[>svg]:pr-3", className)}
              variant={resolvedTheme === "light" ? "secondary" : "ghost"}
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="w-full gap-2" variant={"secondary"} onClick={() => createMinecraftAuth()}>
                <PlusIcon className="size-4" />
                <span className="text-base">Add another Account</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex gap-x-2" side="bottom">
              Microsoft Authentication
              <ExternalLinkIcon className="size-3.5 stroke-accent-foreground" />
            </TooltipContent>
          </Tooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AccountRow({ account }: { account: MinecraftAccount }) {
  return (
    <fieldset key={account.uuid} className="grid overflow-hidden rounded-md">
      <Button
        className={cn(
          "group/account relative w-full justify-start gap-2.5 pl-1.5",
          account.active && "bg-blue-500/25 hover:bg-blue-500/50",
        )}
        variant={"ghost"}
        size={"sm"}
        // onClick={() => {
        // 	setSelectedAccount(account);
        // }}
      >
        <img
          // src={headTexture}
          className="rounded-sm"
          alt="Face"
          width={20}
          height={20}
        />
        <span className="font-minecraft text-base transition-[margin] group-hover/account:ml-1">
          {account.username}
        </span>
        {account.active && <CheckIcon className="absolute right-4" strokeWidth={2.5} size={16} />}
      </Button>
      {/* <Button
				className="ml-1 size-8 p-0"
				variant={"secondary"}
				size={"sm"}
				onClick={() => removeAccount(account)}
			>
				<XIcon className=" stroke-red-500" strokeWidth={2.5} size={16} />
			</Button> */}
    </fieldset>
  );
}
