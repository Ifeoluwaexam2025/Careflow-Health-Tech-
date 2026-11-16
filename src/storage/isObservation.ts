import type { Observation } from "../types/Observation";
import { isRecord } from "./isRecord";
import { isTimestamp } from "./isTimestamp";

export function isObservation(value: unknown): value is Observation {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    !!value.id.trim() &&
    typeof value.patientId === "string" &&
    !!value.patientId.trim() &&
    typeof value.value === "number" &&
    Number.isFinite(value.value) &&
    ((value.kind === "temperature" && value.value >= 0 && value.value <= 60) ||
      (value.kind === "heartRate" &&
        Number.isInteger(value.value) &&
        value.value >= 1 &&
        value.value <= 300)) &&
    isTimestamp(value.recordedAt)
  );
}
