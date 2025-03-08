import { Outlet } from "react-router";
import { BreadcrumbProvider } from "~/providers/breadcrumbs";

export function Providers({ children }: { children: React.ReactNode }) {
	return <BreadcrumbProvider>{children}</BreadcrumbProvider>;
}
