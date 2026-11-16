import type { Task } from "../types/Task";
import type { TaskInput } from "../types/TaskInput";
import { validateTask } from "./validateTask";

export function updateTask(task: Task, input: TaskInput): Task {
  validateTask(input);
  if (!["general", "observation"].includes(input.category))
    throw new Error("Choose a valid category.");
  if (input.patientId !== task.patientId)
    throw new Error("A task cannot be moved to another patient.");
  return {
    ...task,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    priority: input.priority ?? "normal",
    dueAt: input.dueAt ? new Date(input.dueAt).toISOString() : null,
  };
}
