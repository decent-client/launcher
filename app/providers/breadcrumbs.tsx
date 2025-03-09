import { createContext, useContext, useState } from "react";

type Breadcrumb = string;

type BreadcrumbProviderState = {
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbProviderState>({
  breadcrumbs: [],
  setBreadcrumbs: () => null,
});

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  return <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>{children}</BreadcrumbContext.Provider>;
}

export function useBreadcrumbs() {
  const context = useContext(BreadcrumbContext);

  if (context === undefined) throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider");

  return context;
}
