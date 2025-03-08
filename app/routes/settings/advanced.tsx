import { useEffect } from "react";
import { useBreadcrumbs } from "~/providers/breadcrumbs";

export default function Advanced() {
	const { setBreadcrumbs } = useBreadcrumbs();

	useEffect(() => {
		setBreadcrumbs(["Settings", "Advanced"]);
	}, [setBreadcrumbs]);

	return <article>eh</article>;
}
