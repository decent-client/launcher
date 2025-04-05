import { Gamepad2Icon, RocketIcon } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { Link } from "react-router";
import { FriendList } from "~/components/friend-list";
import { SelectAccount } from "~/components/select-account";
import { SkinViewer3D } from "~/components/skin-viewer";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { usePlayerSkin } from "~/hooks/player-skin";
import { useLocalStorage } from "~/hooks/storage";
import { cn } from "~/lib/utils";
import { useAccount } from "~/providers/account";
import { useGameOptions } from "~/providers/game-options";
import { useTheme } from "~/providers/theme";

type Article = {
  title: string;
};
const ARTICELS: Article[] = [
  { title: "article1" },
  { title: "article2" },
  { title: "article3" },
  { title: "article4" },
  { title: "article5" },
  { title: "article6" },
  { title: "article7" },
  { title: "article8" },
  { title: "article9" },
  { title: "article10" },
  { title: "article11" },
  { title: "article12" },
  { title: "article13" },
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
  const { tab } = useGameOptions();
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
          <CardContent className="absolute inset-0 z-10 overflow-hidden p-0">
            <SelectAccount className="absolute top-1 left-1" />
            <Button
              className="absolute right-1 bottom-1 h-7 gap-x-2 transition-[bottom] duration-300"
              variant={"ghost"}
              size={"sm"}
              asChild
            >
              <Link to={`/game-options/${tab}`}>
                <Gamepad2Icon className="size-4" />
                <span className="text-sm">Game Options</span>
              </Link>
            </Button>
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
              className="-translate-x-1/2 group absolute bottom-4 left-1/2 h-13 gap-x-6 rounded-xl transition-[bottom] duration-300"
              variant="outline"
              size={"lg"}
              disabled={!account}
            >
              <RocketIcon className="size-7 transition-colors group-hover:stroke-blue-400" />
              <fieldset className="mr-2 flex flex-col">
                <span className="font-bold text-lg leading-5">Launch Minecraft</span>
                <span className="text-muted-foreground text-sm leading-4">on version 1.xx.x</span>
              </fieldset>
            </Button>
          </CardContent>
          <CardBackdrop />
        </MotionCard>
        <ScrollArea ref={scrollAreaRef} className="relative grow overflow-hidden" scrollBarClassName="py-2">
          <motion.nav
            className="sticky z-20 flex items-center justify-between rounded-lg py-1 pr-1 pl-4 backdrop-blur-sm"
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
          <section className="mx-3 mt-2 mb-5 grid grid-cols-2 gap-2 rounded-[inherit] lg:grid-cols-3 xl:grid-cols-4">
            {ARTICELS.map((article) => (
              <NewsArticle key={article.title} article={article} />
            ))}
          </section>
        </ScrollArea>
      </Card>
    </SidebarLayout>
  );
}

function NewsArticle({ article }: { article: Article }) {
  return (
    <Dialog>
      <DialogTrigger>
        <Card className="relative aspect-[24/10] overflow-hidden p-0">
          <img
            className="absolute inset-0 bg-center bg-cover"
            src="images/launcher-background-dark.png"
            alt="Article Cover"
          />
          <h1 className="absolute bottom-1 left-3 z-10 font-bold">{article.title}</h1>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{article.title}</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function CardBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] backdrop-blur-xs" />
    </div>
  );
}
