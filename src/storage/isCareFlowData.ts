import type { CareFlowData } from "../types/CareFlowData";
import { isRecord } from "./isRecord";
import { isPatient } from "./isPatient";
import { isTask } from "./isTask";
import { isObservation } from "./isObservation";
import { isActivityEvent } from "./isActivityEvent";

export function isCareFlowData(value: unknown): value is CareFlowData {
  if (
    !isRecord(value) ||
    !Array.isArray(value.patients) ||
    !value.patients.every(isPatient) ||
    !Array.isArray(value.tasks) ||
    !value.tasks.every(isTask) ||
    !Array.isArray(value.observations) ||
    !value.observations.every(isObservation) ||
    !Array.isArray(value.activity) ||
    !value.activity.every(isActivityEvent)
  )
    return false;
  const patientIds = new Set(value.patients.map((patient) => patient.id));
  return (
    patientIds.size === value.patients.length &&
    [value.tasks, value.observations, value.activity].every(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
    ) &&
    value.tasks.every((task) => patientIds.has(task.patientId)) &&
    value.observations.every((item) => patientIds.has(item.patientId)) &&
    value.activity.every(
      (event) => event.patientId === null || patientIds.has(event.patientId),
    )
  );
}
