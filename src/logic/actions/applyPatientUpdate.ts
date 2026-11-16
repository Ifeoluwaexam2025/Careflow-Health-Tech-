import type { CareFlowData } from "../../types/CareFlowData";
import type { Action } from "../../types/Action";
import type { ActionChange } from "../../types/ActionChange";
import { updatePatient } from "../updatePatient";

export function applyPatientUpdate(
  data: CareFlowData,
  action: Extract<Action, { type: "patient.update" }>,
): ActionChange {
  const patient = data.patients.find((item) => item.id === action.id);
  if (!patient) throw new Error("Patient no longer exists.");
  const updated = updatePatient(patient, action.input);
  return {
    data: {
      ...data,
      patients: data.patients.map((item) =>
        item.id === patient.id ? updated : item,
      ),
    },
    patientId: patient.id,
    entityId: patient.id,
    message: `Patient updated: ${updated.name}`,
  };
}
