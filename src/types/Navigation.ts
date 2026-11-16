export type View =
  "overview" | "patients" | "tasks" | "observations" | "activity";
export type Navigation = {
  view: View;
  patientId?: string;
  taskFilters?: {
    status: "all" | "pending" | "completed";
    priority: "all" | "high" | "normal" | "low";
    due: "all" | "today" | "overdue";
  };
};
