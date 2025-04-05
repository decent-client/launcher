import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  layout("components/title-bar.tsx", [
    index("routes/launcher.tsx"),
    layout("routes/settings/layout.tsx", [
      ...prefix("settings", [
        route("preferences", "routes/settings/preferences.tsx"),
        route("launcher", "routes/settings/launcher.tsx"),
        route("notifications", "routes/settings/notifications.tsx"),
        route("advanced", "routes/settings/advanced.tsx"),
        route("resources", "routes/settings/resources.tsx"),
      ]),
    ]),
    layout("routes/game-options/layout.tsx", [
      ...prefix("game-options", [
        route("version", "routes/game-options/version.tsx"),
        route("mods", "routes/game-options/mods.tsx"),
      ]),
    ]),
  ]),
  route("splash-screen", "routes/splash-screen.tsx"),
] satisfies RouteConfig;
