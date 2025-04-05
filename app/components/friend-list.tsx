import { Circle, Plus, SettingsIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { useSettings } from "~/providers/settings";
import { SearchBar } from "./search-bar";

const friends = [
  {
    skin: "https://skins.mcstats.com/face/f25075b4-3c7a-43c2-8a40-f58adedbe46a",
    username: "liqws_wife",
    favorite: true,
    online: true,
    playing: "Hypixel",
  },
  {
    skin: "https://skins.mcstats.com/face/a4e6e3d14d6149e59b190f5e8a7454c9",
    username: "Alosted",
  },
  {
    skin: "https://skins.mcstats.com/face/1c682784-a9cc-43bd-8007-3aa2e3878712",
    username: "liqwtf",
    online: true,
    playing: "Hypixel",
  },
  {
    skin: "https://skins.mcstats.com/face/c4e8cb39-3e02-4f71-bf9f-65ecfeb087f9",
    username: "MMMMMMMMMMMMMMMMMM",
  },
  {
    skin: "https://skins.mcstats.com/face/64bc1be8-e903-4f18-8884-0bcda6153432",
    username: "nicalae",
    favorite: true,
  },
];

export function FriendList({ className }: { className?: string }) {
  const onlineFriends = friends.filter((friend) => friend.online).length;

  return (
    <aside className={cn("relative mt-2 mb-8 flex flex-col overflow-hidden", className)}>
      <h1 className="ml-8 w-full font-extrabold font-sans text-xl">Friend List</h1>
      <Button className="absolute top-0 right-2 size-7" size={"icon"} variant={"ghost"}>
        <Plus className="size-4.5 stroke-3" />
      </Button>
      <Command className="mt-0.5 mb-2 w-auto bg-transparent" loop>
        <SearchBar
          className="mr-2 ml-5.5 bg-card/50"
          input={
            <CommandInput
              className="w-full rounded-none rounded-se-full rounded-ee-full text-sm outline-none placeholder:text-muted-foreground"
              placeholder={"Search for friends..."}
            />
          }
        />
        <ScrollArea className="grow overflow-hidden">
          <CommandList className="ml-8 max-h-auto">
            <CommandEmpty className="mt-2 mr-8 flex flex-col items-center justify-center">
              No friends found...
            </CommandEmpty>
            <CommandGroup
              className="mt-1 p-0 [&_[cmdk-group-heading]]:p-0 [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-sm"
              heading={`Online − ${onlineFriends}`}
            >
              {friends.map((friend) => {
                const keywords = [
                  friend.username,
                  friend.online ? "online" : "offline",
                  friend.playing ?? undefined,
                  friend.favorite ? "favorite best" : undefined,
                ].filter((keyword): keyword is string => !!keyword);

                return (
                  <CommandItem
                    key={friend.username}
                    className="group grid h-7 cursor-pointer grid-cols-(--grid-friend-item) grid-rows-[--grid-friend-item-row] items-start gap-0 gap-x-2 rounded-e-none p-1 transition-all aria-selected:ml-0.5 aria-selected:h-11"
                    keywords={keywords}
                  >
                    <img src={friend.skin} className="z-50 size-5 rounded-sm" alt="Skin" />
                    <h1 className="truncate font-minecraft text-base text-minecraft-foreground leading-5">
                      {friend.username}
                    </h1>
                    <StatusIndicator
                      online={friend.online ?? false}
                      className="mt-1.75 transition-opacity group-aria-selected:opacity-0"
                    />
                    <p className="col-span-3 ml-1.25 flex h-4 items-center gap-x-1.5 opacity-0 transition-opacity delay-75 group-aria-selected:opacity-100">
                      <StatusIndicator online={friend.online ?? false} />
                      <span className="text-muted-foreground text-xs italic">
                        {friend.playing ? `Playing on ${friend.playing}` : "Last online 12 hours ago"}
                      </span>
                    </p>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </ScrollArea>
      </Command>
      <SettingsButton />
    </aside>
  );
}

function SettingsButton() {
  const { tab } = useSettings();

  return (
    <Button
      className="mt-auto ml-8 h-7 w-auto justify-start gap-3 rounded-s-full rounded-e-none transition-[margin] hover:ml-8.5"
      variant={"ghost"}
      size={"sm"}
      asChild
    >
      <Link to={`/settings/${tab}`}>
        <SettingsIcon className="size-4" />
        <span className="font-medium text-base">Settings</span>
      </Link>
    </Button>
  );
}

function StatusIndicator({ online, className }: { online: boolean; className?: string }) {
  return (
    <Circle
      className={cn(
        "size-1.5 fill-green-500 text-green-500",
        {
          "fill-red-500 text-red-500": !online,
        },
        className,
      )}
    />
  );
}
