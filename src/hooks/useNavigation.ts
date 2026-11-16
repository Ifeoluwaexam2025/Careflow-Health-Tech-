import { useEffect, useState } from "react";
import type { Navigation } from "../types/Navigation";
import { parseRoute } from "../logic/parseRoute";

export function useNavigation() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const listener = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  return {
    ...route,
    navigate: (next: Navigation) => {
      const query = next.taskFilters
        ? `?${new URLSearchParams(next.taskFilters)}`
        : "";
      window.location.hash = `/${next.view}${next.patientId ? `/${next.patientId}` : ""}${query}`;
    },
  };
}
