import type { Patient } from "../types/Patient";
import { isRecord } from "./isRecord";
import { isTimestamp } from "./isTimestamp";

export function isPatient(value: unknown): value is Patient {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    !!value.id.trim() &&
    typeof value.name === "string" &&
    !!value.name.trim() &&
    value.name.length <= 100 &&
    typeof value.room === "string" &&
    !!value.room.trim() &&
    value.room.length <= 20 &&
    typeof value.ward === "string" &&
    !!value.ward.trim() &&
    value.ward.length <= 60 &&
    typeof value.notes === "string" &&
    value.notes.length <= 1000 &&
    isTimestamp(value.createdAt)
  );
}
