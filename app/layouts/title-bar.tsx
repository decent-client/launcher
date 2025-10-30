import { Outlet } from "react-router";
import { WindowTitleBar } from "~/components/title-bar";

export const handle = {
  bodyClassName: "grid-rows-(--grid-title-bar)",
};

export default function TitleBar() {
  return (
    <>
      <WindowTitleBar />
      <Outlet />
    </>
  );
}
