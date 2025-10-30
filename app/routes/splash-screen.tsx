import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const loadingMessages = [
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

function randomLoadingMessage(previousMessage?: string) {
  let message = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  if (previousMessage) {
    while (message === previousMessage) {
      message = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    }
  }

  return message;
}

export default function SplashScreen() {
  const [loadingMessage, setLoadingMessage] = useState<string>(randomLoadingMessage);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingMessage(randomLoadingMessage);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="grid row-span-2 place-items-center" data-tauri-drag-region>
      <fieldset className="flex pointer-events-none flex-col gap-y-4 items-center">
        <img src="banner.png" className="h-20" alt="Decent Client" />
        <p className="flex text-muted-foreground gap-x-2 items-center">
          {loadingMessage} <Loader2 className="size-3.5 stroke-muted-foreground animate-spin" />
        </p>
      </fieldset>
      <img
        className="pointer-events-none absolute bottom-4 left-4 size-16 drop-shadow-md"
        src="/gifs/minecraft-bee.gif"
        alt="Minecraft Bee"
      />
    </main>
  );
}
