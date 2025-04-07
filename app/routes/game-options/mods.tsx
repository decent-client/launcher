import { FolderIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CardContent } from "~/components/ui/card";

export const handle = {
  breadcrumb: "Mods",
};

export default function Mods() {
  return (
    <CardContent className="h-full px-6 pt-5">
      <nav className="flex justify-end">
        <Button className="gap-x-2" variant={"secondary"} size={"sm"}>
          <FolderIcon className="size-4" />
          View Mods Folder
        </Button>
      </nav>
    </CardContent>
  );
}
