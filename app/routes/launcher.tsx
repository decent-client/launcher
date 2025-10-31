import { useEffect } from "react";
import { SelectAccount } from "~/components/select-account";
import { showLauncherWindow } from "~/lib/bindings/show-window";

export default function Launcher() {
  useEffect(() => {
    showLauncherWindow(3000);
  }, []);

  return <SelectAccount />;
}
