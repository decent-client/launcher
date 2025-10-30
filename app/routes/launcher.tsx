import { Link } from "react-router";

export const handle = {
  breadcrumb: "Launcher",
};

export default function Launcher() {
  return <Link to="splash-screen">Go to Splash Screen</Link>;
}
