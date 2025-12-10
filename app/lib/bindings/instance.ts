import { invoke } from "@tauri-apps/api/core";
import type { Instance, InstanceValues } from "~/providers/instance";

export async function createInstance(options: InstanceValues): Promise<Instance> {
  return invoke("plugin:instance|create_instance", { options });
}

export async function getInstance(identifier: string): Promise<Instance> {
  return invoke("plugin:instance|get_instance", { identifier });
}

export async function getInstances(): Promise<Instance[]> {
  return invoke("plugin:instance|get_instances");
}

export async function removeInstance(identifier: string): Promise<void> {
  return invoke("plugin:instance|remove_instance", { identifier });
}

export async function renameInstance(identifier: string, newName: string): Promise<Instance> {
  return invoke("plugin:instance|rename_instance", { options: { identifier, new_name: newName } });
}

export async function updateInstanceIcon(identifier: string, iconData: string | null): Promise<Instance> {
  return invoke("plugin:instance|update_instance_icon", {
    options: { identifier, icon_data: iconData },
  });
}
