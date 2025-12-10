import { House, Library, Plus, Settings } from "lucide-react";
import { Link, useLocation } from "react-router";
import { CreateInstance } from "~/components/create-instance";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "~/components/ui/sidebar";
import { useInstance } from "~/providers/instance";

export function AppSidebar() {
  const { pathname } = useLocation();
  const { instances } = useInstance();

  return (
    <Sidebar className="border-r-0!" collapsible="icon">
      <div className="h-(--title-bar-height)" />
      <SidebarHeader className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Home" asChild isActive={pathname === "/"}>
              <Link to="/">
                <House />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="flex gap-x-1">
            <SidebarMenuButton tooltip="Instance Library" asChild isActive={pathname === "/instances"}>
              <Link to="/instances">
                <Library />
                <span>Instance Library</span>
              </Link>
            </SidebarMenuButton>
            <CreateInstance asChild>
              <SidebarMenuButton
                tooltip="Create Instance"
                className="group-data-[collapsible=icon]:hidden w-8 min-w-8 max-w-8"
              >
                <Plus />
              </SidebarMenuButton>
            </CreateInstance>
            {/* <CreateInstance asChild>
              <SidebarMenuAction className="right-1.5">
                <Plus />
              </SidebarMenuAction>
            </CreateInstance> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSub>
                {instances.map((instance) => (
                  <SidebarMenuSubItem key={instance.identifier}>
                    <SidebarMenuSubButton
                      className="pl-1"
                      isActive={pathname === `/instance/${instance.identifier}`}
                      asChild
                    >
                      <Link to={`/instance/${instance.identifier}`}>
                        <img className="size-5 rounded-sm" src={instance.icon} alt={instance.name} />
                        <span>{instance.name}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail className="hover:after:bg-transparent" />
    </Sidebar>
  );
}
