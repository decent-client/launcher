import { LibraryBig, Package } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { type GameOptionsTab, useGameOptions } from "~/providers/game-options";

const tabs: {
  title: string;
  icon: React.ReactNode;
  value: GameOptionsTab;
}[] = [
  { title: "Versions", icon: <LibraryBig className="size-4" />, value: "version" },
  {
    title: "Mods",
    icon: <Package className="size-4" />,
    value: "mods",
  },
];

export default function GameOptionsLayout() {
  const { setTab } = useGameOptions();
  const { pathname } = useLocation();

  return (
    <main className="grid h-screen grid-rows-[3rem_1fr] overflow-hidden">
      <nav className="mx-8 flex items-center justify-between">
        <h1 className="font-extrabold font-sans text-xl">Game Options</h1>
        <fieldset className="flex gap-x-3">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              className={cn("relative h-7 justify-start gap-2 rounded-full", {
                "bg-accent text-blue-500 hover:text-blue-500": pathname === `/game-options/${tab.value}`,
                "hover:bg-accent/50": pathname !== `/game-options/${tab.value}`,
              })}
              variant={"ghost"}
              size={"sm"}
              asChild
            >
              <NavLink to={`/game-options/${tab.value}`} onClick={() => setTab(tab.value)}>
                {tab.icon}
                <span className="font-semibold text-base">{tab.title}</span>
                {tab.value === "mods" && <span className="text-muted-foreground text-xs">{"(0)"}</span>}
              </NavLink>
            </Button>
          ))}
        </fieldset>
      </nav>
      <Card className="relative mx-2 mb-2 overflow-hidden bg-background p-0">
        <Outlet />
      </Card>
    </main>
  );
}
