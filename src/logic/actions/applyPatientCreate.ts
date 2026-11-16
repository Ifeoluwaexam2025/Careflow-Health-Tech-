import type { CareFlowData } from "../../types/CareFlowData";
import type { Action } from "../../types/Action";
import type { ActionChange } from "../../types/ActionChange";
import { createPatient } from "../createPatient";

export function applyPatientCreate(
  data: CareFlowData,
  action: Extract<Action, { type: "patient.create" }>,
): ActionChange {
  const patient = createPatient(action.input);
  return {
    data: { ...data, patients: [...data.patients, patient] },
    patientId: patient.id,
    entityId: patient.id,
    message: `Patient added: ${patient.name}`,
  };
}
