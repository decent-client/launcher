import { invoke } from "@tauri-apps/api/core";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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
    await invoke("plugin:account|authenticate");
    await refresh();
  }, [refresh]);

  const setActive = useCallback(
    async (uuid: string) => {
      await invoke("plugin:account|set_active", { uuid });
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (uuid: string) => {
      await invoke("plugin:account|remove", { uuid });
      await refresh();
    },
    [refresh],
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
