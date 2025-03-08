import { useEffect } from "react";
import { useBreadcrumbs } from "~/providers/breadcrumbs";

export default function Preferences() {
	const { setBreadcrumbs } = useBreadcrumbs();

	useEffect(() => {
		setBreadcrumbs(["Settings", "Preferences"]);
	}, [setBreadcrumbs]);

	return <article>eh</article>;
}
