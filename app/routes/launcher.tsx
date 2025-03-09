import { useEffect } from "react";
import { FriendList } from "~/components/friend-list";
import { SelectAccount } from "~/components/select-account";
import { Card, CardContent } from "~/components/ui/card";
import { useBreadcrumbs } from "~/providers/breadcrumbs";

export default function Launcher() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs(["Launcher"]);
  }, [setBreadcrumbs]);

  return (
    <main className="mt-8 grid h-screen grid-cols-(--grid-layout) overflow-hidden">
      <FriendList />
      <Card className="rounded-none rounded-ss-xl bg-card/50 p-2">
        <Card
          className="relative grid h-64 rounded-md bg-[size:100%] bg-center p-1 transition-[background-size] duration-500 hover:bg-[size:105%] "
          style={{
            backgroundImage: "url(/images/launcher-background.png)",
          }}
        >
          <CardContent className="absolute inset-1 z-10 p-0">
            <SelectAccount />
          </CardContent>
          <CardBackdrop />
        </Card>
      </Card>
    </main>
  );
}

function CardBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] backdrop-blur-xs" />
    </div>
  );
}
