import { useEffect } from "react";
import { useBreadcrumbs } from "~/providers/breadcrumbs";

export default function Notifications() {
	const { setBreadcrumbs } = useBreadcrumbs();

	useEffect(() => {
		setBreadcrumbs(["Settings", "Notifications"]);
	}, [setBreadcrumbs]);

	return <article>eh</article>;
}
