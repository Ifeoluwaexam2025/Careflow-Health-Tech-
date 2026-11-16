import type { CareFlowData } from "../../types/CareFlowData";
import type { Action } from "../../types/Action";
import type { ActionChange } from "../../types/ActionChange";

export function applyObservationDelete(
  data: CareFlowData,
  action: Extract<Action, { type: "observation.delete" }>,
): ActionChange {
  const observation = data.observations.find((item) => item.id === action.id);
  if (!observation) throw new Error("Observation no longer exists.");
  return {
    data: {
      ...data,
      observations: data.observations.filter((item) => item.id !== action.id),
    },
    patientId: observation.patientId,
    entityId: null,
    message: `Observation removed: ${observation.kind === "temperature" ? "temperature" : "heart rate"}`,
  };
}
