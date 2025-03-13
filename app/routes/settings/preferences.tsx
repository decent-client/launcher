import { zodResolver } from "@hookform/resolvers/zod";
import { invoke } from "@tauri-apps/api/core";
import { Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Slider } from "~/components/ui/slider";

export const handle = {
  breadcrumb: "Preferences",
};

const settingsSchema = z.object({
  allocatedMemory: z.number(),
});

export default function Preferences() {
  const [systemMemory, setSystemMemory] = useState(0);
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      allocatedMemory: 4096,
    },
  });

  useEffect(() => {
    invoke("plugin:system-info|total_memory").then((memory) => {
      console.log(memory);
      setSystemMemory(Math.floor(((memory as number) / 1024 / 1024 / 1024) * 1024) ?? 4096);
    });
  }, []);

  return (
    <Form {...form}>
      <form className="flex flex-col space-y-4 px-8 py-6">
        <FormField
          control={form.control}
          name="allocatedMemory"
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
                      value={[form.getValues("allocatedMemory")]}
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
                      {systemMemory - value > 0 ? `${Intl.NumberFormat().format(systemMemory - value)} MB ` : "Nothing"}
                    </span>{" "}
                    left to allocate
                  </span>
                </FormDescription>
              </FormItem>
            );
          }}
        />
      </form>
    </Form>
  );
}
