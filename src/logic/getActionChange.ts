import type { CareFlowData } from "../types/CareFlowData";
import type { Action } from "../types/Action";
import type { ActionChange } from "../types/ActionChange";
import { applyPatientCreate } from "./actions/applyPatientCreate";
import { applyPatientUpdate } from "./actions/applyPatientUpdate";
import { applyPatientDelete } from "./actions/applyPatientDelete";
import { applyTaskCreate } from "./actions/applyTaskCreate";
import { applyTaskUpdate } from "./actions/applyTaskUpdate";
import { applyTaskToggle } from "./actions/applyTaskToggle";
import { applyTaskDelete } from "./actions/applyTaskDelete";
import { applyObservationCreate } from "./actions/applyObservationCreate";
import { applyObservationDelete } from "./actions/applyObservationDelete";

export function getActionChange(
  data: CareFlowData,
  action: Action,
): ActionChange {
  switch (action.type) {
    case "patient.create":
      return applyPatientCreate(data, action);
    case "patient.update":
      return applyPatientUpdate(data, action);
    case "patient.delete":
      return applyPatientDelete(data, action);
    case "task.create":
      return applyTaskCreate(data, action);
    case "task.update":
      return applyTaskUpdate(data, action);
    case "task.toggle":
      return applyTaskToggle(data, action);
    case "task.delete":
      return applyTaskDelete(data, action);
    case "observation.create":
      return applyObservationCreate(data, action);
    case "observation.delete":
      return applyObservationDelete(data, action);
  }
}
