import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const subtitles = [
	"Tailoring your experience",
	"Loading your blocks",
	"Building your world",
	"Generating the landscapes",
	"Crafting your adventure",
	"Preparing your inventory",
	"Spawning the mobs",
	"Mining resources",
	"Generating villages",
	"Brewing potions",
	"Growing your crops",
	"Smelting your ores",
	"Expanding your map",
	"Loading your realms",
	"Constructing structures",
	"Enchanting your gear",
	"Terraforming your land",
	"Growing your forests",
];

function randomSubtitle() {
	return subtitles[Math.floor(Math.random() * subtitles.length)];
}

export default function SplashScreen() {
	const [subtitle, setSubtitle] = useState(randomSubtitle());
	const [slowConnection, setSlowConnection] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setSlowConnection(true);
		}, 10000);

		const interval = setInterval(() => {
			setSubtitle((previous) => {
				let newSubtitle = randomSubtitle();

				while (newSubtitle === previous) {
					newSubtitle = randomSubtitle();
				}

				return newSubtitle;
			});
		}, 5000);

		return () => {
			clearInterval(interval);
			clearTimeout(timer);
		};
	}, []);

	return (
		<main
			className="relative grid h-screen place-items-center text-center font-sans"
			data-tauri-drag-region
		>
			<AnimatePresence>
				<motion.span
					className="pointer-events-none flex flex-col items-center justify-center drop-shadow-md"
					initial={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<h1 className="font-black text-3xl">Decent Client</h1>
					<p className="flex items-center gap-2 font-medium text-muted-foreground text-sm italic">
						{subtitle}
						<Loader2
							className="animate-spin stroke-muted-foreground"
							size={14}
						/>
					</p>
				</motion.span>
			</AnimatePresence>
			{slowConnection && (
				<p className="pointer-events-none absolute right-2 bottom-1 font-medium text-red-300 text-sm drop-shadow-md">
					Slow connection?
				</p>
			)}
			<motion.img
				className="-scale-x-100 pointer-events-none absolute bottom-4 drop-shadow-md"
				src={"/gifs/minecraft-bee.gif"}
				alt="Minecraft Bee"
				initial={{
					left: -64,
				}}
				animate={{
					left: "0.75rem",
					transition: { duration: 0.75, ease: "easeInOut" },
				}}
				width={64}
				height={64}
			/>
		</main>
	);
}
