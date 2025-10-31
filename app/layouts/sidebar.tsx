import { Library, Plus, Settings } from "lucide-react";
import { Link, Outlet } from "react-router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export const handle = {
  breadcrumb: "Launcher",
};

export default function Sidebar() {
  return (
    <main className="grid grid-cols-(--grid-layout) overflow-hidden">
      <aside className="flex flex-col overflow-hidden" data-tauri-drag-region>
        <fieldset className="flex mt-2 mr-2 ml-6 justify-between items-center">
          <h1 className="font-bold text-xl">Instances</h1>
          <fieldset className="flex gap-x-1">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to="/instances">
                <Library className="size-4.5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon-sm">
              <Plus className="size-4.5" />
            </Button>
          </fieldset>
        </fieldset>
        <fieldset className="mt-auto p-4 flex gap-y-1 flex-col">
          <Button className="justify-start flex-1" variant="ghost" size="default" asChild>
            <Link to="/settings">
              <Settings />
              Settings
            </Link>
          </Button>
        </fieldset>
      </aside>
      <Card className="rounded-none p-2 rounded-ss-xl border-r-0 border-b-0">
        <Outlet />
      </Card>
    </main>
  );
}
