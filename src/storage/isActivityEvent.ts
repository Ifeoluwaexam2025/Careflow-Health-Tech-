import type { ActivityEvent } from "../types/ActivityEvent";
import { isRecord } from "./isRecord";
import { isTimestamp } from "./isTimestamp";

export function isActivityEvent(value: unknown): value is ActivityEvent {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    !!value.id.trim() &&
    (value.patientId === null ||
      (typeof value.patientId === "string" && !!value.patientId.trim())) &&
    typeof value.description === "string" &&
    !!value.description.trim() &&
    isTimestamp(value.createdAt)
  );
}
