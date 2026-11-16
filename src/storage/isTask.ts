import type { Task } from "../types/Task";
import { isRecord } from "./isRecord";
import { isTimestamp } from "./isTimestamp";

export function isTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    !!value.id.trim() &&
    typeof value.patientId === "string" &&
    !!value.patientId.trim() &&
    typeof value.title === "string" &&
    !!value.title.trim() &&
    value.title.length <= 100 &&
    typeof value.description === "string" &&
    value.description.length <= 2000 &&
    (value.category === "general" || value.category === "observation") &&
    (value.priority === "low" ||
      value.priority === "normal" ||
      value.priority === "high") &&
    (value.dueAt === null || isTimestamp(value.dueAt)) &&
    isTimestamp(value.createdAt) &&
    ((value.status === "pending" && value.completedAt === null) ||
      (value.status === "completed" &&
        isTimestamp(value.completedAt) &&
        Date.parse(value.completedAt) >= Date.parse(value.createdAt)))
  );
}
