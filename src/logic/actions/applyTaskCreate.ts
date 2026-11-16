import type { CareFlowData } from "../../types/CareFlowData";
import type { Action } from "../../types/Action";
import type { ActionChange } from "../../types/ActionChange";
import { selectTaskFactory } from "../selectTaskFactory";

export function applyTaskCreate(
  data: CareFlowData,
  action: Extract<Action, { type: "task.create" }>,
): ActionChange {
  if (!data.patients.some((item) => item.id === action.input.patientId)) {
    throw new Error("Select an existing patient.");
  }
  const task = selectTaskFactory(action.input.category).createTask(
    action.input,
  );
  return {
    data: { ...data, tasks: [...data.tasks, task] },
    patientId: task.patientId,
    entityId: task.id,
    message: `Task created: ${task.title}`,
  };
}
