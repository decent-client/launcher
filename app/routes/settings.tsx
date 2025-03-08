import { useEffect, useState } from "react";
import { useBreadcrumbs } from "~/providers/breadcrumbs";

export default function Settings() {
	const { setBreadcrumbs } = useBreadcrumbs();
	const [tab, setTab] = useState();

	useEffect(() => {
		setBreadcrumbs(["Settings"]);
	}, [setBreadcrumbs]);

	return <main className="mt-8">settings</main>;
}
