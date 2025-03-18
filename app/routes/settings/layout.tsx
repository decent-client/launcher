import { BellDotIcon, MonitorCogIcon, PackageOpenIcon, PickaxeIcon, RocketIcon } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useSessionStorage } from "~/hooks/storage";
import { cn } from "~/lib/utils";

export const handle = {
  breadcrumb: "Settings",
};

const tabs: {
  title: string;
  icon: React.ReactNode;
  value: string;
}[] = [
  {
    title: "Launcher",
    icon: <RocketIcon className="size-4" />,
    value: "launcher",
  },
  {
    title: "Game Preferences",
    icon: <MonitorCogIcon className="size-4" />,
    value: "preferences",
  },
  {
    title: "Notifications",
    icon: <BellDotIcon className="size-4" />,
    value: "notifications",
  },
  {
    title: "Advanced",
    icon: <PickaxeIcon className="size-4" />,
    value: "advanced",
  },
  {
    title: "Resources",
    icon: <PackageOpenIcon className="size-4" />,
    value: "resources",
  },
];

export default function SettingsLayout() {
  const [_, setSettingsTab] = useSessionStorage("settings-tab", "launcher");
  const { pathname } = useLocation();

  return (
    <main className="grid h-screen grid-cols-(--grid-layout) overflow-hidden">
      <aside className="relative mt-2 mb-8 flex flex-col overflow-hidden">
        <h1 className="ml-8 w-full font-extrabold font-sans text-xl">Settings</h1>
        <ul className="flex grow flex-col gap-y-0.5">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              className={cn(
                "ml-8 h-7 w-full justify-start gap-3 rounded-s-full rounded-e-none transition-[margin] hover:ml-8.5",
                {
                  "ml-9 bg-accent/50 text-blue-500 hover:ml-10 hover:text-blue-500":
                    pathname === `/settings/${tab.value}`,
                  "mt-auto": tab.value === "resources",
                },
              )}
              variant={"ghost"}
              size={"sm"}
              asChild
            >
              <NavLink to={`/settings/${tab.value}`} onClick={() => setSettingsTab(tab.value)}>
                {tab.icon}
                <span className="font-semibold text-base">{tab.title}</span>
              </NavLink>
            </Button>
          ))}
        </ul>
      </aside>
      <Card className="relative overflow-hidden rounded-none rounded-ss-xl border-r-0 border-b-0 bg-card/50 p-0 px-2">
        <ScrollArea className="grow overflow-hidden" scrollBarClassName="py-2">
          <Outlet />
        </ScrollArea>
      </Card>
    </main>
  );
}
