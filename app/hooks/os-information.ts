import type { Arch, Family, OsType, Platform } from "@tauri-apps/plugin-os";
import { useEffect, useState } from "react";

export function useOSInformation() {
  const [arch, setArch] = useState<Arch | undefined>();
  const [exeExtension, setExeExtension] = useState<string | undefined>();
  const [family, setFamily] = useState<Family | undefined>();
  const [osType, setOsType] = useState<OsType | undefined>();
  const [platform, setPlatform] = useState<Platform | undefined>();
  const [version, setVersion] = useState<string | undefined>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@tauri-apps/plugin-os").then((module) => {
        setArch(module.arch());
        setExeExtension(module.exeExtension());
        setFamily(module.family());
        setOsType(module.type());
        setPlatform(module.platform());
        setVersion(module.version());
      });
    }
  }, []);

  return { arch, exeExtension, family, osType, platform, version };
}
