import { Outlet } from "react-router";
import { WindowTitleBar } from "~/components/title-bar";

export default function TitleBar() {
  return (
    <>
      <WindowTitleBar />
      <Outlet />
    </>
  );
}
