import type { Task } from "../types/Task";

export function toggleTaskStatus(task: Task): Task {
  const completed = task.status === "pending";
  return {
    ...task,
    status: completed ? "completed" : "pending",
    completedAt: completed ? new Date().toISOString() : null,
  };
}
