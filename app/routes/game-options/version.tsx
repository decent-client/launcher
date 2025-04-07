import { SearchBar } from "~/components/search-bar";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import { ScrollArea } from "~/components/ui/scroll-area";
import versions from "~/lib/constants/versions";
import { cn } from "~/lib/utils";
import { useGameOptions } from "~/providers/game-options";

export const handle = {
  breadcrumb: "Versions",
};

export default function Version() {
  const { version: selectedVersion, setVersion } = useGameOptions();
  const currentVersion = versions.find((v) => v.version === selectedVersion);

  return (
    <Command className="flex flex-col overflow-hidden px-6 pt-5" value={selectedVersion}>
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
        {currentVersion && (
          <div key={currentVersion.version} className="mt-2 mr-4 mb-1.5 flex gap-2 rounded-lg bg-accent/50 p-2">
            <img
              className="size-10 rounded-sm object-cover object-center"
              // src={currentVersion}
              alt="Version thumbnail"
            />
            <fieldset className="flex flex-col">
              <h1 className="font-extrabold text-blue-500 text-xl leading-6">{currentVersion.version}</h1>
              <p className="text-muted-foreground text-sm leading-4">{currentVersion.update}</p>
            </fieldset>
          </div>
        )}
        <CommandSeparator className="mr-4 mb-1.5" />
        <CommandList className="mr-4 mb-4 max-h-auto">
          <CommandEmpty>Did not find any versions.</CommandEmpty>
          {versions.map((version) => (
            <CommandItem
              key={version.version}
              value={version.version}
              className={cn("mb-1 rounded-lg p-2", {
                "bg-accent data-[selected=true]:bg-accent": selectedVersion === version.version,
              })}
              onSelect={() => setVersion(version.version)}
              keywords={[version.version, version.update]}
            >
              <img
                className="size-10 rounded-sm object-cover object-center"
                // src={version.art}
                alt="Version thumbnail"
              />
              <fieldset className="flex flex-col">
                <h1
                  className={cn("font-bold text-xl leading-6", {
                    "font-extrabold text-blue-500": selectedVersion === version.version,
                  })}
                >
                  {version.version}
                </h1>
                <p className="text-muted-foreground leading-4">{version.update}</p>
              </fieldset>
            </CommandItem>
          ))}
        </CommandList>
      </ScrollArea>
    </Command>
  );
}
