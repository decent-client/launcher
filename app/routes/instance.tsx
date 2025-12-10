import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { updateInstanceIcon } from "~/lib/bindings/instance";
import type { Handle } from "~/lib/handle";
import { useInstance } from "~/providers/instance";
import type { Route } from "./+types/instance";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const handle = {
  breadcrumb: ["Instance", "instance name"],
} satisfies Handle;

const renameSchema = (instances: Array<{ name: string; identifier: string }>, currentIdentifier: string) =>
  z.object({
    name: z
      .string()
      .min(1, "Instance name is required")
      .refine(
        (name) => {
          const normalizedName = name.toLowerCase().trim();
          const currentInstance = instances.find((i) => i.identifier === currentIdentifier);

          if (currentInstance && currentInstance.name.toLowerCase().trim() === normalizedName) {
            return true;
          }

          return instances.every(
            (instance) =>
              instance.identifier === currentIdentifier || instance.name.toLowerCase().trim() !== normalizedName,
          );
        },
        {
          message: "An instance with this name already exists",
        },
      ),
  });

type RenameFormValues = z.infer<ReturnType<typeof renameSchema>>;

export default function Instance({ params }: Route.ComponentProps) {
  const { rename, get, remove, instances, refresh } = useInstance();
  const [isEditing, setIsEditing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const instance = get(params.instance);

  const schema = useMemo(
    () => (instance ? renameSchema(instances, instance.identifier) : z.object({ name: z.string() })),
    [instances, instance],
  );

  const form = useForm<RenameFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: instance?.name || "",
    },
  });

  useEffect(() => {
    if (instance) {
      form.reset({ name: instance.name });
    }
  }, [instance, form]);

  async function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      console.warn("No file selected");
      return;
    }

    if (!instance) {
      console.warn("No instance found");
      return;
    }

    console.log("Selected file:", { name: file.name, size: file.size, type: file.type });

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      console.log("Generated base64:", { length: base64.length, prefix: base64.substring(0, 100) });

      if (!base64) {
        throw new Error("Failed to generate base64");
      }

      const result = await updateInstanceIcon(instance.identifier, base64);
      console.log("Backend response:", result);

      await refresh();
      setRefreshKey((k) => k + 1);
      toast.success("Instance icon updated");
    } catch (error) {
      console.error("Failed to update image:", error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to update image: ${message}`);
    }
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (!instance) {
    return <div>Instance not found</div>;
  }

  async function handleInlineBlur() {
    if (!instance) {
      return;
    }

    const currentValue = form.getValues("name");

    if (currentValue.trim() === instance.name.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      const isValid = await form.trigger("name");
      if (isValid) {
        await rename(instance.identifier, currentValue.trim());
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to rename instance:", error);
      // Keep editing mode on error so user can fix it
    }
  }

  return (
    <div className="flex flex-col gap-y-10">
      <fieldset className="flex items-start gap-x-3 m-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          id="instance-image-edit"
        />
        <label htmlFor="instance-image-edit" className="cursor-pointer">
          <div className="relative h-28 group aspect-square rounded-xl overflow-hidden">
            <Pencil className="absolute z-10 inset-0 m-auto transition-opacity opacity-0 group-hover:opacity-100 size-5" />
            <img
              key={refreshKey}
              className="aspect-square h-28 rounded-xl object-cover"
              src={instance.icon}
              alt="cover"
            />
          </div>
        </label>
        <fieldset className="flex grow flex-col justify-between">
          <Form {...form}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="gap-0.5">
                  <FormDescription>
                    {instance.loader} {instance.version}
                  </FormDescription>
                  <FormControl>
                    <Input
                      {...field}
                      ref={(e) => {
                        field.ref(e);
                        inputRef.current = e;
                      }}
                      className="h-10 w-fit field-sizing-content text-2xl! font-bold"
                      onBlur={() => {
                        field.onBlur();
                        handleInlineBlur();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        } else if (e.key === "Escape") {
                          form.reset({ name: instance.name });
                          setIsEditing(false);
                        }
                      }}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </fieldset>
      </fieldset>

      <fieldset className="space-x-2">
        <Button variant="destructive" size="sm" onClick={() => remove(instance.identifier)}>
          <X />
          Delete Instance
        </Button>
      </fieldset>
    </div>
  );
}
