import { Outlet } from "react-router";
import { AppSidebar } from "~/components/sidebar";
import { Card } from "~/components/ui/card";
import { SidebarProvider } from "~/components/ui/sidebar";

export default function SidebarLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <Card className="relative flex-1 rounded-none p-2 rounded-ss-xl border-r-0 border-b-0">
        <Outlet />
      </Card>
    </SidebarProvider>
  );
}

// import { Outlet } from "react-router";
// impor_instancesar } from "~/components/sidebar";
// import { Card } from "~/components/ui/card";
// import { cn } from "~/lib/utils";
// import { useSidebar } from "~/providers/sidebar";

// export default function SidebarLayout() {
//   const { open } = useSidebar();

//   return (
//     <main
//       className={cn("grid grid-cols-(--grid-sidebar) overflow-hidden", {
//         "grid-cols-(--grid-sidebar-collapse)": !open,
//       })}
//     >
//       <Sidebar />
//       <Card className="relative rounded-none p-2 rounded-ss-xl border-r-0 border-b-0">
//         <Outlet />
//       </Card>
//     </main>
//   );
// }
