import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { type CreateInstanceValues, createInstanceSchema, useInstance } from "~/providers/instance";
import { Label } from "./ui/label";

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

function randomPlaceholder() {
  const placeholders = [
    "dirt hut society",
    "creeper spa services",
    "enderman moving crew",
    "lava bucket ministry",
    "lost coordinates club",
    "cursed redstone museum",
    "fall damage academy",
    "ethical skeleton range",
    "tnt duplication bureau",
    "overclocked smelter lab",
    "quantum potato reactor",
    "buzzing flux capacitor",
    "automation ethics office",
    "teleportation mishap lab",
    "lag machine engineers",
    "forgot manual reactor",
    "dont dig down",
    "professional tree punchers",
    "mostly cobble kingdom",
    "accidental pigmen union",
    "permanent afk village",
    "unorganized chest nation",
    "accidental wolf slappers",
    "lost base expedition",
  ];

  return placeholders[Math.floor(Math.random() * placeholders.length)];
}

export function CreateInstance({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const [open, setOpen] = useState(false);
  const [palceholder, setPlaceholder] = useState(randomPlaceholder);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { create, instances } = useInstance();

  const schema = useMemo(() => createInstanceSchema(instances), [instances]);

  const form = useForm<CreateInstanceValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      loader: "vanilla",
      icon: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      setPlaceholder(randomPlaceholder);
      setImagePreview(null);
      form.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open, form.reset]);

  async function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setImagePreview(base64);
      form.setValue("icon", base64);
    } catch (error) {
      console.error("Failed to process image:", error);
      alert("Failed to process image");
    }
  }

  async function onSubmit(values: CreateInstanceValues) {
    try {
      await create({
        name: values.name,
        loader: values.loader,
        version: values.version,
        icon: values.icon,
      });
      setOpen(false);
      setImagePreview(null);
      form.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to create instance:", error);

      if (error instanceof Error && error.message.includes("already exists")) {
        form.setError("name", {
          type: "manual",
          message: error.message,
        });
      }
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Instance</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <fieldset className="flex gap-x-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="instance-image-upload"
              />
              <label htmlFor="instance-image-upload" className="cursor-pointer">
                <div className="relative h-14.5 group aspect-square rounded-lg overflow-hidden">
                  <Pencil className="absolute inset-0 m-auto transition-opacity opacity-0 group-hover:opacity-100 size-5" />
                  <img
                    className="size-14.5 rounded-[inherit] object-cover"
                    src={imagePreview || "/images/fallback/face.png"}
                    alt="cover"
                  />
                </div>
              </label>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Instance Name</FormLabel>
                    <fieldset>
                      <FormControl>
                        <Input placeholder={palceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </fieldset>
                  </FormItem>
                )}
              />
            </fieldset>
            <fieldset className="flex items-start gap-x-6">
              <FormField
                control={form.control}
                name="loader"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Mod Loader</FormLabel>
                    <fieldset>
                      <FormControl>
                        <Select {...field} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Loader" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="vanilla">Vanilla</SelectItem>
                              <SelectItem value="fabric">Fabric</SelectItem>
                              <SelectItem value="forge">Forge</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </fieldset>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Version</FormLabel>
                    <fieldset>
                      <FormControl>
                        <fieldset className="flex gap-x-4">
                          <Select {...field} onValueChange={field.onChange}>
                            <SelectTrigger className="w-28">
                              <SelectValue placeholder="Version" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="1.8.9">1.8.9</SelectItem>
                                <SelectItem value="1.21.10">1.21.10</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <div className="flex whitespace-nowrap items-center gap-2">
                            <Checkbox id="snapshots" disabled />
                            <Label htmlFor="snapshots">Show snapshots</Label>
                          </div>
                        </fieldset>
                      </FormControl>
                      <FormMessage />
                    </fieldset>
                  </FormItem>
                )}
              />
            </fieldset>
            <Separator />
            <DialogFooter>
              <Button className="grow" variant="default" size="sm" type="submit">
                <Plus />
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
