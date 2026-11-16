import type { CareFlowData } from "../types/CareFlowData";

export function getDashboardSummary(data: CareFlowData, now = new Date()) {
  const pending = data.tasks.filter((task) => task.status === "pending");
  return {
    patients: data.patients.length,
    pending: pending.length,
    completed: data.tasks.length - pending.length,
    dueToday: pending.filter(
      (task) =>
        task.dueAt &&
        new Date(task.dueAt).toDateString() === now.toDateString(),
    ).length,
    overdue: pending.filter(
      (task) => task.dueAt && Date.parse(task.dueAt) < now.getTime(),
    ).length,
  };
}
