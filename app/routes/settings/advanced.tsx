import { Form } from "~/components/ui/form";
import { useSettings } from "~/providers/settings";

export const handle = {
  breadcrumb: "Advanced",
};

export default function Advanced() {
  const { form } = useSettings();

  return (
    <Form {...form}>
      <form className="flex flex-col space-y-8 px-8 py-7">eh</form>
    </Form>
  );
}
