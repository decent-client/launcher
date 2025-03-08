import { useEffect } from "react";
import { useBreadcrumbs } from "~/providers/breadcrumbs";

export default function Launcher() {
	const { setBreadcrumbs } = useBreadcrumbs();

	useEffect(() => {
		setBreadcrumbs(["Settings", "Launcher"]);
	}, [setBreadcrumbs]);

	return <article>eh</article>;
}
