import { useEffect } from "react";
import { FriendList } from "~/components/friend-list";
import { Card } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useBreadcrumbs } from "~/providers/breadcrumbs";

export default function Launcher() {
	const { setBreadcrumbs } = useBreadcrumbs();

	useEffect(() => {
		setBreadcrumbs(["Launcher"]);
	}, [setBreadcrumbs]);

	return (
		<main className="mt-8 grid h-screen grid-cols-(--grid-layout) overflow-hidden">
			<FriendList />
			<Card className="rounded-none rounded-ss-lg bg-card/50"></Card>
		</main>
	);
}
