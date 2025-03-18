import {} from "@tauri-apps/plugin-fs";
import { createContext, useContext, useState } from "react";
import { useAsyncEffect } from "~/hooks/async-effect";
import { getAccounts } from "~/lib/account";
import type { MinecraftAccount } from "~/lib/types/account";

type AccountProviderState = {
  accounts: MinecraftAccount[];
  account: MinecraftAccount | undefined;
  setAccount: (account: MinecraftAccount) => void;
  addAccount: (account: MinecraftAccount) => void;
  removeAccount: (account: MinecraftAccount) => void;
};

const AccountContext = createContext<AccountProviderState>({} as AccountProviderState);

type FileName = `${string}.json`;

export function AccountProvider({
  children,
  fileName = "microsoft-accounts.json",
}: { children: React.ReactNode; fileName?: FileName }) {
  const [accounts, setAccounts] = useState<MinecraftAccount[]>([]);
  const [account, setActiveAccount] = useState<MinecraftAccount>();

  useAsyncEffect(async () => {
    setAccounts(await getAccounts(fileName));
  }, []);

  async function setAccount(account: MinecraftAccount) {}

  async function addAccount(account: MinecraftAccount) {}

  async function removeAccount(account: MinecraftAccount) {}

  return (
    <AccountContext.Provider
      value={{
        accounts,
        account,
        setAccount,
        addAccount,
        removeAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);

  if (context === undefined) throw new Error("useAccount must be used within a AccountProvider");

  return context;
}
