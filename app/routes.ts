import { index, layout, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  layout("layouts/title-bar.tsx", [
    layout("layouts/sidebar.tsx", [index("routes/launcher.tsx"), route("instances", "routes/instances/manage.tsx")]),
  ]),
  route("splash-screen", "routes/splash-screen.tsx"),
] satisfies RouteConfig;
