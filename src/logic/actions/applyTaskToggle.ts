import type { CareFlowData } from "../../types/CareFlowData";
import type { Action } from "../../types/Action";
import type { ActionChange } from "../../types/ActionChange";
import { toggleTaskStatus } from "../toggleTaskStatus";

export function applyTaskToggle(
  data: CareFlowData,
  action: Extract<Action, { type: "task.toggle" }>,
): ActionChange {
  const task = data.tasks.find((item) => item.id === action.id);
  if (!task) throw new Error("Task no longer exists.");
  const updated = toggleTaskStatus(task);
  return {
    data: {
      ...data,
      tasks: data.tasks.map((item) => (item.id === task.id ? updated : item)),
    },
    patientId: task.patientId,
    entityId: task.id,
    message: `Task ${updated.status === "completed" ? "completed" : "reopened"}: ${task.title}`,
  };
}
