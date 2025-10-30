import { useMatches } from "react-router";

type Handle = {
  breadcrumb?: string;
};

export function useBreadcrumbs() {
  const matches = useMatches();

  return matches
    .filter((match) => match.handle && Boolean((match.handle as Handle).breadcrumb))
    .map((match) => (match.handle as Handle).breadcrumb);
}
