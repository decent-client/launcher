import { invoke } from "@tauri-apps/api/core";
import { Cpu, ProportionsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import { useSettings } from "~/providers/settings";

export const handle = {
  breadcrumb: "Game Preferences",
};

export default function Preferences() {
  const { form } = useSettings();
  const [systemMemory, setSystemMemory] = useState(0);

  useEffect(() => {
    invoke("plugin:system-info|total_memory").then((memory) => {
      setSystemMemory(Math.floor(((memory as number) / 1024 / 1024 / 1024) * 1024) ?? 4096);
    });
  }, []);

  return (
    <Form {...form}>
      <form className="flex flex-col space-y-8 px-8 py-7">
        <FormField
          control={form.control}
          name="preferences.ram"
          render={({ field }) => {
            const { value, onChange } = field;
            const recommended = 4096;

            return (
              <FormItem className="gap-y-0">
                <FormLabel className="flex items-end font-bold text-base">
                  Allocated Memory
                  <span className="ml-2 font-medium text-muted-foreground text-sm">
                    {Intl.NumberFormat().format(value)} MB
                  </span>
                  <Button
                    className="ml-auto h-6 translate-x-2.5 text-sm text-yellow-500"
                    variant={"ghost"}
                    size={"sm"}
                    onClick={(event) => {
                      event.preventDefault();

                      if (value === recommended) {
                        return toast.warning("4096 MB of ram is already allocated");
                      }

                      onChange(recommended);
                      toast.success("4096 MB of ram has been allocated");
                    }}
                  >
                    <Cpu className="size-3.5" />
                    Detect Recommended
                  </Button>
                </FormLabel>
                <fieldset className="flex items-center gap-2">
                  <FormControl>
                    <Slider
                      min={1024}
                      max={systemMemory}
                      step={256}
                      defaultValue={[value]}
                      onValueChange={(values) => {
                        onChange(values[0]);
                      }}
                      value={[form.getValues("preferences.ram")]}
                    />
                  </FormControl>
                  <span className="whitespace-nowrap text-muted-foreground text-sm">
                    / <span className="font-medium">{Intl.NumberFormat().format(systemMemory)} MB</span>
                  </span>
                </fieldset>
                <FormDescription className="flex justify-between">
                  The amount of memory the game instance can use.
                  <span className="italic">
                    <span className="font-medium">
                      {systemMemory - value > 0 ? `${Intl.NumberFormat().format(systemMemory - value)} MB` : "Nothing"}
                    </span>{" "}
                    left to allocate
                  </span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="preferences.afterLaunch"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <FormLabel className="font-bold text-base">After Game Launch</FormLabel>
                  <FormDescription>What the launcher should do after the game is launched.</FormDescription>
                </div>
                <FormControl>
                  <Select onValueChange={onChange} defaultValue={value} value={value}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={value} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Keep open</SelectItem>
                      <SelectItem value="hide">Hide</SelectItem>
                      <SelectItem value="close">Close</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full">
          <FormField
            control={form.control}
            name="preferences.resolution.width"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <div className="flex justify-between gap-4">
                  <div>
                    <FormLabel className="flex items-center gap-2 font-bold text-base">
                      <span>Game Resolution</span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="h-6 gap-2 px-2 text-blue-500 text-sm" variant={"ghost"} size={"sm"}>
                            <ProportionsIcon className="size-3.5" />
                            View Presets
                          </Button>
                        </DialogTrigger>
                        <DialogContent>hi</DialogContent>
                      </Dialog>
                    </FormLabel>
                    <FormDescription>The resolution the game instance should start in</FormDescription>
                    <FormMessage />
                  </div>
                  <FormItem className="gap-0">
                    <FormControl>
                      <Input className="w-32 placeholder:text-muted-foreground" {...field} placeholder="auto" />
                    </FormControl>
                    <FormDescription className="italic">Width</FormDescription>
                  </FormItem>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preferences.resolution.height"
            render={({ field }) => (
              <FormItem className="ml-2 gap-0">
                <FormControl>
                  <Input className="w-32 placeholder:text-muted-foreground" {...field} placeholder="auto" />
                </FormControl>
                <FormDescription className="italic">Height</FormDescription>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
