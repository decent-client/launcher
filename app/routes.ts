import { index, layout, prefix, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  layout("layouts/title-bar.tsx", [
    layout("layouts/sidebar.tsx", [
      index("routes/launcher.tsx", { id: "home" }),
      route("instances", "routes/instances.tsx", { id: "instances" }),
      route("instance/:instance", "routes/instance.tsx", { id: "instance" }),
      route("skin-library", "routes/skins.tsx"),
    ]),
    layout("layouts/settings.tsx", [...prefix("settings", [route("temp", "routes/settings/temp.tsx")])]),
  ]),
  route("splash-screen", "routes/splash-screen.tsx"),
] satisfies RouteConfig;
