import type { OsType } from "@tauri-apps/plugin-os";
import { useEffect, useState } from "react";
import { getOsType } from "./os-type";

export function useOSInformation() {
  const [osType, setOsType] = useState<OsType | undefined>();

  useEffect(() => {
    async function loadModules() {
      getOsType().then((type) => {
        setOsType(type);
      });
    }

    loadModules();
  }, []);

  return { osType };
}
