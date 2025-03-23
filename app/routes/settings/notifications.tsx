import { Form } from "~/components/ui/form";
import { useSettings } from "~/providers/settings";

export const handle = {
  breadcrumb: "Notifications",
};

export default function Notifications() {
  const { form } = useSettings();

  return (
    <Form {...form}>
      <form className="flex flex-col space-y-8 px-8 py-7">e</form>
    </Form>
  );
}
