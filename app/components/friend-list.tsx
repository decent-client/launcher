import { Circle, Plus, SearchIcon, SettingsIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/components/ui/command";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
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
		username: "SillyBillyTime",
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
		<aside
			className={cn(
				"relative mt-2 mb-8 flex flex-col overflow-hidden",
				className,
			)}
		>
			<h1 className="ml-8 w-full font-extrabold font-sans text-xl">
				Friend List
			</h1>
			<Button
				className="absolute top-0 right-2 size-7 cursor-pointer"
				size={"icon"}
				variant={"ghost"}
			>
				<Plus className="size-4.5 stroke-3" />
			</Button>
			<Command className="mt-0.5 mb-2 w-auto bg-transparent">
				<SearchBar
					className="mr-2 ml-5.5 bg-card/50"
					input={
						<CommandInput
							className="w-full rounded-none rounded-se-full rounded-ee-full outline-none placeholder:text-muted-foreground"
							placeholder={"Search for friends..."}
						/>
					}
				/>
				{friends.length > 0 && onlineFriends && (
					<p className="mt-1 ml-8 text-muted-foreground text-sm">
						Online &minus; {onlineFriends}
					</p>
				)}
				<ScrollArea className="grow overflow-hidden">
					<CommandList className="ml-8 max-h-auto">
						{friends.map((friend) => {
							const keywords = [
								friend.username,
								friend.online ? "online" : "offline",
								friend.playing,
								friend.favorite && "favorite best",
							].filter(Boolean);

							return (
								<CommandItem
									key={friend.username}
									className="grid h-7 w-full grid-cols-(--grid-friend-item) gap-x-2 rounded-e-none p-1"
									value={keywords.join(" ")}
								>
									<img
										src={friend.skin}
										className="z-50 size-5 rounded-sm"
										alt="Skin"
									/>
									<h1 className="truncate font-minecraft text-base text-minecraft-foreground leading-4">
										{friend.username}
									</h1>
									<Circle
										className={cn(
											"col-start-3 size-1.5 fill-green-500 text-green-500",
											{ "fill-red-500 text-red-500": !friend.online },
										)}
									/>
								</CommandItem>
							);
						})}
						<CommandEmpty className="mt-2 mr-8 flex flex-col items-center justify-center">
							No friends found...
						</CommandEmpty>
					</CommandList>
				</ScrollArea>
			</Command>
			<Button
				className="mt-auto ml-6 h-7 w-auto justify-start gap-3 rounded-s-full rounded-e-none transition-[margin] hover:ml-7"
				variant={"ghost"}
				size={"sm"}
				asChild
			>
				<Link to="/settings">
					<SettingsIcon className="size-4" />
					<span className="font-medium text-base">Settings</span>
				</Link>
			</Button>
		</aside>
	);
}
