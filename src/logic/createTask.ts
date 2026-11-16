import type { Task } from "../types/Task";
import type { CreateTaskInput } from "../types/CreateTaskInput";
import { validateTask } from "./validateTask";

export function createTask(
  input: CreateTaskInput,
  category: Task["category"] = "general",
): Task {
  validateTask(input);
  return {
    id: crypto.randomUUID(),
    patientId: input.patientId.trim(),
    title: input.title.trim(),
    description: input.description.trim(),
    category,
    priority: input.priority ?? "normal",
    dueAt: input.dueAt ? new Date(input.dueAt).toISOString() : null,
    status: "pending",
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}
