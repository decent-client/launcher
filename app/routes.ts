import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	layout("components/title-bar.tsx", [
		index("routes/launcher.tsx"),
		route("settings", "routes/settings.tsx"),
	]),
	route("splash-screen", "routes/splash-screen.tsx"),
] satisfies RouteConfig;
