import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useLocalStorage } from "~/hooks/storage";

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useLocalStorage("sidebar-state", true);

  const toggle = useCallback(() => {
    return setOpen(!open);
  }, [open, setOpen]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [toggle]);

  return (
    <SidebarContext.Provider
      value={useMemo<SidebarContextValue>(() => ({ open, setOpen, toggle }), [open, setOpen, toggle])}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within an SidebarProvider");
  }

  return context;
}
