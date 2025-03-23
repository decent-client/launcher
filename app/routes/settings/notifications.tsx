import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";
import { useSettings } from "~/providers/settings";

export const handle = {
  breadcrumb: "Notifications",
};

export default function Notifications() {
  const { form } = useSettings();

  return (
    <Form {...form}>
      <form className="flex flex-col space-y-8 px-8 py-7">
        <span>*notification settings*</span>
        <fieldset className="flex flex-col space-y-4">
          <h1 className="font-bold text-lg">Discord Settings</h1>
          <FormField
            control={form.control}
            name="notifications.discord.richPresence"
            render={({ field: { value, onChange } }) => (
              <FormItem className="flex gap-x-4 gap-y-0">
                <FormControl className="mt-[calc((1.5rem-1.15rem)/2)]">
                  <Switch className="data-[state=checked]:bg-green-500" checked={value} onCheckedChange={onChange} />
                </FormControl>
                <fieldset>
                  <FormLabel className="font-bold text-base">Show Discord Rich Presence</FormLabel>
                  <FormDescription>Whether your current activity should be shown on discord.</FormDescription>
                  <FormMessage />
                </fieldset>
              </FormItem>
            )}
          />
        </fieldset>
      </form>
    </Form>
  );
}
