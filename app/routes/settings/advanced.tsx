import { open } from "@tauri-apps/plugin-dialog";
import { ChevronRightIcon, FolderGit2Icon, FolderIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { useSettings } from "~/providers/settings";

export const handle = {
  breadcrumb: "Advanced",
};

function vaildatePath(path: string | undefined | null) {
  if (!path || path === undefined || path === null || path === "") {
    return false;
  }

  return true;
}

export default function Advanced() {
  const { form } = useSettings();

  const gameDirectory = form.getValues("advanced.gameDirectory");
  const javaPath = form.getValues("advanced.javaPath");

  return (
    <Form {...form}>
      <form className="flex flex-col space-y-8 px-8 py-7">
        <fieldset className="space-y-4">
          <FormField
            control={form.control}
            name="advanced.gameDirectory"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <fieldset className="flex justify-between gap-4">
                  <div>
                    <FormLabel className="font-bold text-base">Game Directory</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <FormDescription className="ml-1 flex items-center gap-x-1">
                          {vaildatePath(gameDirectory) ? (
                            <>
                              <ChevronRightIcon className="size-3.5 stroke-muted-foreground" />
                              <button
                                type="button"
                                className="truncate font-medium text-blue-500"
                                onClick={async (event) => {
                                  event.preventDefault();
                                }}
                              >
                                {gameDirectory}
                              </button>
                            </>
                          ) : (
                            <span className="-ml-1">Could not find game directory.</span>
                          )}
                        </FormDescription>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Which directory to launch the game from.</TooltipContent>
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Button
                      className="min-w-40 gap-2 border border-input bg-accent/50 text-foreground hover:bg-accent/75"
                      onClick={async (event) => {
                        event.preventDefault();

                        const path = await open({ directory: true, multiple: false, defaultPath: value });

                        if (path) {
                          onChange(path);
                        }
                      }}
                    >
                      <FolderIcon size={16} />
                      Browse
                    </Button>
                  </FormControl>
                </fieldset>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="advanced.javaPath"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <fieldset className="flex justify-between gap-4">
                  <div>
                    <FormLabel className="font-bold text-base">Java Path</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <FormDescription className="ml-1 flex items-center gap-x-1">
                          {vaildatePath(javaPath) ? (
                            <>
                              <ChevronRightIcon className="size-3.5 stroke-muted-foreground" />
                              <button
                                type="button"
                                className="truncate font-medium text-blue-500"
                                onClick={async (event) => {
                                  event.preventDefault();
                                }}
                              >
                                {javaPath}
                              </button>
                            </>
                          ) : (
                            <span className="-ml-1">Could not find the java path.</span>
                          )}
                        </FormDescription>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Path to the Java executable.</TooltipContent>
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Button
                      className="min-w-40 gap-2 border border-input bg-accent/50 text-foreground hover:bg-accent/75"
                      onClick={async (event) => {
                        event.preventDefault();

                        const path = await open({ directory: true, multiple: false, defaultPath: value });

                        if (path) {
                          onChange(path);
                        }
                      }}
                    >
                      <FolderIcon size={16} />
                      Browse
                    </Button>
                  </FormControl>
                </fieldset>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
        <FormField
          control={form.control}
          name="advanced.branch"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <div className="flex justify-between gap-4">
                <div>
                  <FormLabel className="font-bold text-base">Branch</FormLabel>
                  <FormDescription>The github repository branch to use for the launcher.</FormDescription>
                  <FormMessage />
                </div>
                <FormItem className="space-y-0">
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <FolderGit2Icon className="stroke-muted-foreground" size={18} />
                      <Input className="w-36 placeholder:text-muted-foreground" {...field} placeholder="master" />
                    </div>
                  </FormControl>
                </FormItem>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="advanced.updatePreferences"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <div className="flex justify-between gap-4">
                <div>
                  <FormLabel className="font-bold text-base">Launcher Update Preference</FormLabel>
                  <FormDescription>When you want to receive updates for the launcher.</FormDescription>
                </div>
                <FormControl>
                  <Select onValueChange={onChange} defaultValue={value} value={value}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={value} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal (Stable)</SelectItem>
                      <SelectItem value="early">Early Release</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="advanced.JVMArguments"
          render={({ field }) => (
            <FormItem className="gap-y-0">
              <FormLabel className="font-bold text-base aria-disabled:text-muted-foreground" aria-disabled>
                JVM Arguments
              </FormLabel>
              <FormControl>
                <Input className="placeholder:text-muted-foreground" {...field} disabled />
              </FormControl>
              <FormDescription>Additional arguments to pass when launching the game.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="advanced.displayTooltips"
          render={({ field: { value, onChange } }) => (
            <FormItem className="flex gap-x-4 gap-y-0">
              <FormControl className="mt-[calc((1.5rem-1.15rem)/2)]">
                <Switch className="data-[state=checked]:bg-green-500" checked={value} onCheckedChange={onChange} />
              </FormControl>
              <fieldset>
                <FormLabel className="font-bold text-base">Display Tooltips</FormLabel>
                <FormDescription> Whether the launcher should display helping tooltips.</FormDescription>
                <FormMessage />
              </fieldset>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="advanced.reducedAnimations"
          render={({ field: { value, onChange } }) => (
            <FormItem className="flex gap-x-4 gap-y-0">
              <FormControl className="mt-[calc((1.5rem-1.15rem)/2)]">
                <Switch className="data-[state=checked]:bg-green-500" checked={value} onCheckedChange={onChange} />
              </FormControl>
              <fieldset>
                <FormLabel className="font-bold text-base">Reduce Animations</FormLabel>
                <FormDescription>Whether the launcher should render animations.</FormDescription>
                <FormMessage />
              </fieldset>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
