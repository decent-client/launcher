import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { useSettings } from "~/providers/settings";

export const handle = {
  breadcrumb: "Launcher",
};

export default function Launcher() {
  const { form } = useSettings();

  return (
    <Form {...form}>
      <form className="flex flex-col space-y-8 px-8 py-7">
        <FormField
          control={form.control}
          name="launcher.language"
          render={({ field: { value, onChange } }) => (
            <FormItem className="pb-4">
              <div className="flex justify-between gap-4">
                <div>
                  <FormLabel className="font-bold text-base">Language</FormLabel>
                  <FormDescription>What language the launcher should be displayed in.</FormDescription>
                </div>
                <FormControl>
                  <Select onValueChange={onChange} defaultValue={value} value={value}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={value} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-us">English</SelectItem>
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
          name="launcher.autoBoot"
          render={({ field: { value, onChange } }) => (
            <FormItem className="flex gap-x-4 gap-y-0">
              <FormControl className="mt-[calc((1.5rem-1.15rem)/2)]">
                <Switch className="data-[state=checked]:bg-green-500" checked={value} onCheckedChange={onChange} />
              </FormControl>
              <fieldset>
                <FormLabel className="font-bold text-base">Automatically start on boot</FormLabel>
                <FormDescription>Whether the launcher should start when the system boots.</FormDescription>
                <FormMessage />
              </fieldset>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="launcher.exitToDock"
          render={({ field: { value, onChange } }) => (
            <FormItem className="flex gap-x-4 gap-y-0">
              <FormControl className="mt-[calc((1.5rem-1.15rem)/2)]">
                <Switch className="data-[state=checked]:bg-green-500" checked={value} onCheckedChange={onChange} />
              </FormControl>
              <fieldset>
                <FormLabel className="font-bold text-base">Exit to dock</FormLabel>
                <FormDescription>
                  Whether the launcher should stay in the background after you close it.
                </FormDescription>
                <FormMessage />
              </fieldset>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
