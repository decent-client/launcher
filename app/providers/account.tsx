import {} from "@tauri-apps/plugin-fs";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAsyncEffect } from "~/hooks/async-effect";
import { getAccounts, storeAccounts } from "~/lib/account";
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

  useEffect(() => {
    if (accounts.length > 0) {
      const activeAccount = accounts.find((acc) => acc.active);
      setActiveAccount(activeAccount);
    }

    storeAccounts(fileName, accounts);
  }, [fileName, accounts]);

  function selectAccount(target: MinecraftAccount) {
    return accounts.map((account) => ({
      ...account,
      active: account.uuid === target.uuid,
    }));
  }

  async function setAccount(account: MinecraftAccount) {
    setAccounts(selectAccount(account));
  }

  async function addAccount(account: MinecraftAccount) {}

  async function removeAccount(account: MinecraftAccount) {
    const filteredAccounts = [...accounts].filter((v) => v !== account);

    if (account.active) {
      if (filteredAccounts.length > 0) {
        filteredAccounts[0].active = true;
      }
      setActiveAccount(filteredAccounts[0]);
    }

    try {
      setAccounts(filteredAccounts);
    } finally {
      toast.success(`Successfully removed the account "${account.username}".`);
    }
  }

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
