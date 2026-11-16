import type { Navigation, View } from "../types/Navigation";

export function parseRoute(hash: string): Navigation {
  const [path, query] = hash.replace(/^#\/?/, "").split("?");
  const [view, patientId] = path.split("/");
  const params = new URLSearchParams(query);
  const status = params.get("status");
  const priority = params.get("priority");
  const due = params.get("due");
  const views: View[] = [
    "overview",
    "patients",
    "tasks",
    "observations",
    "activity",
  ];
  return {
    view: views.find((item) => item === view) ?? "overview",
    patientId: view === "patients" ? patientId : undefined,
    taskFilters:
      view === "tasks"
        ? {
            status:
              status === "pending" || status === "completed" ? status : "all",
            priority:
              priority === "high" || priority === "normal" || priority === "low"
                ? priority
                : "all",
            due: due === "today" || due === "overdue" ? due : "all",
          }
        : undefined,
  };
}
