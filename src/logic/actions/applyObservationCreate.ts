import type { CareFlowData } from "../../types/CareFlowData";
import type { Action } from "../../types/Action";
import type { ActionChange } from "../../types/ActionChange";
import { createObservation } from "../createObservation";

export function applyObservationCreate(
  data: CareFlowData,
  action: Extract<Action, { type: "observation.create" }>,
): ActionChange {
  if (!data.patients.some((item) => item.id === action.patientId)) {
    throw new Error("Select an existing patient.");
  }
  const observation = createObservation(
    action.patientId,
    action.kind,
    action.value,
  );
  return {
    data: { ...data, observations: [...data.observations, observation] },
    patientId: observation.patientId,
    entityId: observation.id,
    message: `Observation recorded: ${observation.kind === "temperature" ? "temperature" : "heart rate"} ${observation.value} ${observation.kind === "temperature" ? "°C" : "bpm"}`,
  };
}
