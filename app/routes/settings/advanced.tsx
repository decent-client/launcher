import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

export const handle = {
  breadcrumb: "Advanced",
};

export default function Advanced() {
  const [accepted, setAccepted] = useState(false);

  return (
    <article>
      eh
      {!accepted && (
        <span className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-y-2 bg-card/50 backdrop-blur-md">
          <h1 className="font-bold">These settings are only for advanced users.</h1>
          <Button variant={"outline"} size={"sm"} onClick={() => setAccepted(true)}>
            <Check />
            Accept Risks
          </Button>
        </span>
      )}
    </article>
  );
}
