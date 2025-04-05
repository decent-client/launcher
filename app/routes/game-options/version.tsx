import { SearchBar } from "~/components/search-bar";
import { Command, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { ScrollArea } from "~/components/ui/scroll-area";
import versions from "~/lib/constants/versions";
import { cn } from "~/lib/utils";
import { useGameOptions } from "~/providers/game-options";

export default function Version() {
  const { version: selectedVersion, setVersion } = useGameOptions();

  return (
    <Command className="flex flex-col overflow-hidden px-6 pt-5">
      <SearchBar
        className="h-8 gap-x-2.5 pl-2.5"
        input={
          <CommandInput
            className="h-8 w-full rounded-none rounded-se-full rounded-ee-full text-sm outline-none placeholder:text-muted-foreground"
            placeholder={"Search for a specific verison..."}
          />
        }
      />
      <ScrollArea className="grow overflow-hidden" scrollBarClassName="py-2">
        <CommandList className="mt-2 mb-6 max-h-auto">
          {versions.map((version) => (
            <CommandItem
              key={version.version}
              className={cn("", { "bg-accent data-[selected=true]:bg-accent": selectedVersion === version.version })}
              onClick={() => setVersion(version.version)}
            >
              <h1>{version.version}</h1>
              <p>{version.name}</p>
            </CommandItem>
          ))}
        </CommandList>
      </ScrollArea>
    </Command>
  );
}
