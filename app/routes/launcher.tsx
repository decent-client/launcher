import { RocketIcon } from "lucide-react";
import { useState } from "react";
import { FriendList } from "~/components/friend-list";
import { SelectAccount } from "~/components/select-account";
import { SkinViewer3D } from "~/components/skin-viewer";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { ScrollArea } from "~/components/ui/scroll-area";
import { usePlayerSkin } from "~/hooks/player-skin";
import { cn } from "~/lib/utils";

export const handle = {
  breadcrumb: "Launcher",
};

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid h-screen grid-cols-(--grid-layout) overflow-hidden">
      <FriendList />
      {children}
    </main>
  );
}

export default function Launcher() {
  const { skin, loading } = usePlayerSkin("a75000c85c0f4550a278780d2f37c745");
  const [launching, setLaunching] = useState(false);

  return (
    <Layout>
      <Card className="flex flex-col gap-y-0 overflow-hidden rounded-none rounded-ss-xl border-r-0 border-b-0 bg-card/50 p-0 px-2 pt-2">
        <Card
          className="relative grid h-64 shrink-0 rounded-md bg-[size:100%] bg-center p-1 transition-[background-size] duration-500 hover:bg-[size:105%] "
          style={{
            backgroundImage: "url(/images/launcher-background.png)",
          }}
        >
          <span className="-bottom-1 absolute inset-x-8 z-20 h-2">
            <Progress
              className={cn(
                "-translate-y-1/2 absolute top-1/2 h-0 bg-border opacity-0 transition-all delay-200 duration-500 *:bg-green-400",
                {
                  "h-2 opacity-100": launching,
                },
              )}
              value={20}
            />
          </span>
          <CardContent className="absolute inset-0 z-10 overflow-hidden p-0">
            <SelectAccount className="absolute top-1 left-1" />
            {!loading && (
              <SkinViewer3D
                className="-translate-x-1/2 absolute top-6 left-1/2"
                skinUrl={skin}
                height={256 * 1.25}
                width={256}
                onReady={({ viewer }) => {
                  viewer.fov = 35;
                  viewer.camera.position.x = 22 * Math.sin(0.01) - 20;
                  viewer.camera.position.y = 22 * Math.sin(0.01) + 15;
                  viewer.controls.enableZoom = false;
                  viewer.controls.enablePan = false;
                }}
              />
            )}
            <Button
              className={cn(
                "-translate-x-1/2 group absolute bottom-4 left-1/2 h-13 gap-x-4 transition-all duration-300 has-[>svg]:pr-6",
                {
                  "bottom-5": launching,
                },
              )}
              variant="outline"
              size={"lg"}
              onClick={() => setLaunching(true)}
            >
              <RocketIcon className="size-7 transition-colors group-hover:stroke-green-400" />
              <span className="flex flex-col">
                <span className="font-bold text-lg leading-5">Launch Minecraft</span>
                <span className="text-muted-foreground text-sm leading-4">on version 1.xx.x</span>
              </span>
            </Button>
          </CardContent>
          <CardBackdrop />
        </Card>
        <ScrollArea className="grow overflow-hidden" scrollBarClassName="py-2">
          <h1 className="text-6xl">placeholder</h1>
          <h1 className="text-6xl">placeholder</h1>
          <h1 className="text-6xl">placeholder</h1>
          <h1 className="text-6xl">placeholder</h1>
          <h1 className="text-6xl">placeholder</h1>
          <h1 className="text-6xl">placeholder</h1>
          <h1 className="text-6xl">placeholder</h1>
          <h1 className="text-6xl">placeholder</h1>
        </ScrollArea>
      </Card>
    </Layout>
  );
}

function CardBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] backdrop-blur-xs" />
    </div>
  );
}
