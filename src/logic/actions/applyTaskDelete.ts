import type { CareFlowData } from "../../types/CareFlowData";
import type { Action } from "../../types/Action";
import type { ActionChange } from "../../types/ActionChange";
import { deleteTask } from "../deleteTask";

export function applyTaskDelete(
  data: CareFlowData,
  action: Extract<Action, { type: "task.delete" }>,
): ActionChange {
  const task = data.tasks.find((item) => item.id === action.id);
  if (!task) throw new Error("Task no longer exists.");
  return {
    data: { ...data, tasks: deleteTask(data.tasks, task.id) },
    patientId: task.patientId,
    entityId: task.id,
    message: `Task deleted: ${task.title}`,
  };
}
