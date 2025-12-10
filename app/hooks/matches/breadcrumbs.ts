import { useMatches } from "react-router";
import type { Handle } from "~/lib/handle";

export function useBreadcrumbs() {
  const matches = useMatches();

  return matches
    .filter((match) => match.handle && Boolean((match.handle as Handle).breadcrumb))
    .map((match) => {
      const b = (match.handle as Handle).breadcrumb;
      if (typeof b === "function") {
        return b(match.params as Record<string, string>);
      }

      return b;
    });
}
