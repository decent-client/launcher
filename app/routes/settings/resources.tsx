import { useEffect } from "react";
import { useBreadcrumbs } from "~/providers/breadcrumbs";

export default function Resources() {
	const { setBreadcrumbs } = useBreadcrumbs();

	useEffect(() => {
		setBreadcrumbs(["Settings", "Resources"]);
	}, [setBreadcrumbs]);

	return <article>eh</article>;
}
