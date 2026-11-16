import type { CareFlowData } from "../../types/CareFlowData";
import type { Action } from "../../types/Action";
import type { ActionChange } from "../../types/ActionChange";
import { deletePatient } from "../deletePatient";

export function applyPatientDelete(
  data: CareFlowData,
  action: Extract<Action, { type: "patient.delete" }>,
): ActionChange {
  const patient = data.patients.find((item) => item.id === action.id);
  if (!patient) throw new Error("Patient no longer exists.");
  return {
    data: deletePatient(data, action.id),
    patientId: null,
    entityId: null,
    message: `Patient removed: ${patient.name}. Associated tasks, observations and patient activity removed.`,
  };
}
