import { Home } from "lucide-react";
import { Link, Outlet } from "react-router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

export default function SettingsLayout() {
  return (
    <main className="grid grid-cols-(--grid-sidebar) overflow-hidden">
      <aside className="flex flex-col overflow-hidden" data-tauri-drag-region>
        <div className="mt-auto" data-tauri-drag-region>
          <Separator />
        </div>
        <fieldset className="mx-4 my-3 gap-y-1 flex flex-col" data-tauri-drag-region>
          <Button className="justify-start" variant="ghost" size="sm" asChild>
            <Link to="/">
              <Home />
              Home
            </Link>
          </Button>
        </fieldset>
      </aside>
      <Card className="relative rounded-none p-2 rounded-ss-xl border-r-0 border-b-0">
        <Outlet />
      </Card>
    </main>
  );
}
