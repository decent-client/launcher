import { RocketIcon } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { FriendList } from "~/components/friend-list";
import { SelectAccount } from "~/components/select-account";
import { SkinViewer3D } from "~/components/skin-viewer";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { usePlayerSkin } from "~/hooks/player-skin";
import { useLocalStorage } from "~/hooks/storage";
import { cn } from "~/lib/utils";
import { useAccount } from "~/providers/account";
import { useTheme } from "~/providers/theme";

const ARTICELS = [
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
  { index: 1 },
];

export const handle = {
  breadcrumb: "Launcher",
};

function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid h-screen grid-cols-(--grid-layout) overflow-hidden">
      <FriendList />
      {children}
    </main>
  );
}

const MotionCard = motion.create(Card);

const transition = {
  type: "spring",
  damping: 20,
  stiffness: 100,
  duration: 0.2,
};

export default function Launcher() {
  const { backgroundImage } = useTheme();
  const { account } = useAccount();
  const { skin, loading } = usePlayerSkin(account?.uuid);
  const [launching, setLaunching] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollAreaRef = useRef(null);
  const { scrollY } = useScroll({
    container: scrollAreaRef,
  });
  const [sortOption, setSortOption] = useLocalStorage("sort-option", "latest");

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 0);
  });

  return (
    <SidebarLayout>
      <Card className="flex flex-col gap-y-0 overflow-hidden rounded-none rounded-ss-xl border-r-0 border-b-0 bg-background p-0 px-2 pt-2">
        <MotionCard
          className="relative grid h-64 shrink-0 rounded-md bg-[size:100%] bg-center p-1 transition-[background-size] duration-500 hover:bg-[size:105%]"
          variants={{
            full: {
              height: "16rem",
            },
            shrunk: {
              height: "5.25rem",
            },
          }}
          animate={scrolled ? "shrunk" : "full"}
          style={{ backgroundImage }}
          transition={transition}
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
            <motion.span
              className="-translate-x-1/2 absolute left-1/2"
              variants={{
                show: {
                  top: "1.5rem",
                  opacity: 1,
                },
                hide: {
                  top: "3rem",
                  opacity: 0,
                },
              }}
              animate={scrolled ? "hide" : "show"}
              transition={transition}
            >
              {!loading && (
                <SkinViewer3D
                  className={cn({ "pointer-events-none opacity-50": !account })}
                  skinUrl={skin}
                  height={256 * 1.25}
                  width={256}
                  onReady={({ viewer }) => {
                    viewer.fov = 35;
                    3.25;
                    viewer.camera.position.x = 22 * Math.sin(0.01) - 20;
                    viewer.camera.position.y = 22 * Math.sin(0.01) + 15;
                    viewer.controls.enableZoom = false;
                    viewer.controls.enablePan = false;
                  }}
                />
              )}
            </motion.span>
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
              disabled={!account}
            >
              <RocketIcon className="size-7 transition-colors group-hover:stroke-green-400" />
              <span className="flex flex-col">
                <span className="font-bold text-lg leading-5">Launch Minecraft</span>
                <span className="text-muted-foreground text-sm leading-4">on version 1.xx.x</span>
              </span>
            </Button>
          </CardContent>
          <CardBackdrop />
        </MotionCard>
        <ScrollArea ref={scrollAreaRef} className="relative grow overflow-hidden" scrollBarClassName="py-2">
          <motion.nav
            className="sticky flex items-center justify-between rounded-lg py-1 pr-1 pl-4 backdrop-blur-sm"
            variants={{
              active: {
                top: "0.75rem",
                backgroundColor: "color-mix(in oklab, var(--accent) 35%, transparent)",
                marginLeft: "2rem",
                marginRight: "2rem",
              },
              inactive: {
                top: "0.25rem",
                backgroundColor: "color-mix(in oklab, var(--accent) 0%, transparent)",
                marginLeft: 0,
                marginRight: "0.75rem",
              },
            }}
            animate={scrolled ? "active" : "inactive"}
            transition={transition}
          >
            <h1 className="font-bold text-xl">Recent News</h1>
            <Select defaultValue={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="h-4" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </motion.nav>
          <motion.section
            className="mt-2 mb-4 grid grid-cols-2 gap-2 rounded-[inherit] lg:grid-cols-3 xl:grid-cols-4"
            variants={{
              full: { marginLeft: 0, marginRight: 0 },
              shrunk: { marginLeft: "0.75rem", marginRight: "0.75rem" },
            }}
            animate={scrolled ? "full" : "shrunk"}
          >
            {ARTICELS.map((article, index) => (
              <Card key={`${article.index}+${Math.random()}`} className="aspect-[24/10] p-0">
                {index}
              </Card>
            ))}
          </motion.section>
        </ScrollArea>
      </Card>
    </SidebarLayout>
  );
}

function CardBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] backdrop-blur-xs" />
    </div>
  );
}
