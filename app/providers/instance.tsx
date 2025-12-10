import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { createInstance, getInstances, removeInstance, renameInstance } from "~/lib/bindings/instance";

export type Instance = {
  name: string;
  identifier: string;
  loader: string;
  version: string;
  icon?: string;
};

type InstanceContextValue = {
  instances: Instance[];
  loading: boolean;
  refresh: () => Promise<void>;
  create: (options: InstanceValues) => Promise<void>;
  remove: (identifier: string) => Promise<void>;
  get: (identifier: string) => Instance | undefined;
  rename: (identifier: string, newName: string) => Promise<Instance>;
  nameExists: (name: string, excludeIdentifier?: string) => boolean;
};

const InstanceContext = createContext<InstanceContextValue | undefined>(undefined);

export const createInstanceSchema = (instances: Instance[], excludeIdentifier?: string) =>
  z.object({
    name: z
      .string()
      .min(1, "Instance name is required")
      .refine(
        (name) => {
          const normalizedName = name.toLowerCase().trim();
          return instances.every(
            (instance) =>
              instance.identifier === excludeIdentifier || instance.name.toLowerCase().trim() !== normalizedName,
          );
        },
        {
          message: "An instance with this name already exists",
        },
      ),
    icon: z.string().optional(),
    loader: z.enum(["vanilla", "fabric", "forge"], "Mod Loader is required"),
    version: z.enum(["1.8.9", "1.21.10"], "Select a game version"),
  });

export type CreateInstanceValues = z.infer<ReturnType<typeof createInstanceSchema>>;

export const instanceSchema = z.object({
  name: z.string().min(1, "Instance name is required"),
  icon: z.string().optional(),
  loader: z.enum(["vanilla", "fabric", "forge"]),
  version: z.enum(["1.8.9", "1.21.10"]),
});

export type InstanceValues = z.infer<typeof instanceSchema>;

export function InstanceProvider({ children }: { children: React.ReactNode }) {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const list = (await getInstances()).map((instance) => ({
        ...instance,
        icon: instance.icon ?? "/images/fallback/face.png",
      }));
      setInstances(list);
    } catch (error) {
      console.error("Failed to fetch instances:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (options: InstanceValues) => {
      try {
        const instance = await createInstance(options);
        await refresh();
        navigate(`/instance/${instance.identifier}`);
        toast.success(`Instance "${options.name}" has been created`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to create instance";
        toast.error("Failed to create instance", {
          description: errorMessage,
        });
        throw error;
      }
    },
    [refresh, navigate],
  );

  const remove = useCallback(
    async (identifier: string) => {
      const instance = instances.find((i) => i.identifier === identifier);
      const name = instance?.name || identifier;

      try {
        await removeInstance(identifier);
        await refresh();
        toast.success(`Instance "${name}" has been removed`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to remove instance";
        toast.error("Failed to remove instance", {
          description: errorMessage,
        });
        throw error;
      }
    },
    [refresh, instances],
  );

  const rename = useCallback(
    async (identifier: string, newName: string) => {
      const instance = instances.find((i) => i.identifier === identifier);
      const oldName = instance?.name || identifier;

      try {
        const updatedInstance = await renameInstance(identifier, newName);
        await refresh();
        toast.success("Instance renamed", {
          description: `"${oldName}" has been renamed to "${newName}".`,
        });
        return updatedInstance;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to rename instance";
        toast.error("Failed to rename instance", {
          description: errorMessage,
        });
        throw error;
      }
    },
    [refresh, instances],
  );

  const get = useCallback((identifier: string) => instances.find((i) => i.identifier === identifier), [instances]);

  const nameExists = useCallback(
    (name: string, excludeIdentifier?: string) => {
      const normalizedName = name.toLowerCase().trim();
      return instances.some(
        (instance) =>
          instance.identifier !== excludeIdentifier && instance.name.toLowerCase().trim() === normalizedName,
      );
    },
    [instances],
  );

  const value = useMemo<InstanceContextValue>(
    () => ({
      instances,
      loading,
      refresh,
      create,
      remove,
      get,
      rename,
      nameExists,
    }),
    [instances, loading, refresh, create, remove, rename, get, nameExists],
  );

  return <InstanceContext.Provider value={value}>{children}</InstanceContext.Provider>;
}

export function useInstance() {
  const context = useContext(InstanceContext);

  if (!context) {
    throw new Error("useInstance must be used within an InstanceProvider");
  }

  return context;
}
