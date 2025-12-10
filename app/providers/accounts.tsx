import { invoke } from "@tauri-apps/api/core";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { authenticateAccount } from "~/lib/bindings/account";

export type AccountSummary = {
  uuid: string;
  username: string;
  obtainedAt: number;
  isActive: boolean;
};

type AccountsContextValue = {
  accounts: AccountSummary[];
  account: AccountSummary | undefined;
  loading: boolean;
  refresh: () => Promise<void>;
  authenticate: () => Promise<void>;
  setActive: (uuid: string) => Promise<void>;
  remove: (uuid: string) => Promise<void>;
};

const AccountsContext = createContext<AccountsContextValue | undefined>(undefined);

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await invoke<AccountSummary[]>("plugin:account|get_all");
      setAccounts(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const authenticate = useCallback(async () => {
    try {
      const record = await authenticateAccount();
      await refresh();
      toast.success("Successfully authenticated account", {
        description: `The account "${record.username}" has been added.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to authenticate account";
      toast.error("Failed to add account", {
        description: errorMessage,
      });
      throw error;
    }
  }, [refresh]);

  const setActive = useCallback(
    async (uuid: string) => {
      const account = accounts.find((a) => a.uuid === uuid);
      const username = account?.username || "Unknown";

      if (account === accounts.find((account) => account.isActive)) {
        toast.warning(`The account "${accounts.find((account) => account.isActive)?.username}" is already active`);
        return;
      }

      try {
        await invoke("plugin:account|set_active", { uuid });
        await refresh();
        toast.success(`Set account "${username}" to active`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to set active account";
        toast.error("Failed to set active account", {
          description: errorMessage,
        });
        throw error;
      }
    },
    [refresh, accounts],
  );

  const remove = useCallback(
    async (uuid: string) => {
      const account = accounts.find((a) => a.uuid === uuid);
      const username = account?.username || "Unknown";

      try {
        await invoke("plugin:account|remove", { uuid });
        await refresh();
        toast.success("Successfully removed account", {
          description: `The account "${username}" has been removed.`,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to remove account";
        toast.error("Failed to remove account", {
          description: errorMessage,
        });
        throw error;
      }
    },
    [refresh, accounts],
  );

  const value = useMemo<AccountsContextValue>(
    () => ({
      accounts,
      account: accounts.find((account) => account.isActive),
      loading,
      refresh,
      authenticate,
      setActive,
      remove,
    }),
    [accounts, authenticate, loading, refresh, remove, setActive],
  );

  return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>;
}

export function useAccounts() {
  const context = useContext(AccountsContext);

  if (!context) {
    throw new Error("useAccounts must be used within an AccountsProvider");
  }

  return context;
}
