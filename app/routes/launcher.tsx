import { useEffect } from "react";
import { SelectAccount } from "~/components/select-account";
import { showLauncherWindow } from "~/lib/bindings/show-window";
import type { Handle } from "~/lib/handle";

export const handle = {
  breadcrumb: "Launcher",
} satisfies Handle;

export default function Launcher() {
  useEffect(() => {
    showLauncherWindow(3000);
  }, []);

  return (
    <div>
      <SelectAccount />
    </div>
  );
}
