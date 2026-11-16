import type { CareFlowData } from "../types/CareFlowData";
import type { Action } from "../types/Action";
import type { ActionChange } from "../types/ActionChange";
import { getActionChange } from "./getActionChange";
import { createActivityEvent } from "./createActivityEvent";

export function applyAction(
  data: CareFlowData,
  action: Action,
): Omit<ActionChange, "patientId"> {
  const change = getActionChange(data, action);
  const event = createActivityEvent(change.patientId, change.message);
  return {
    data: { ...change.data, activity: [...change.data.activity, event] },
    message: change.message,
    entityId: change.entityId,
  };
}
