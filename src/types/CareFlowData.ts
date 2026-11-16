import type { Patient } from "./Patient";
import type { Task } from "./Task";
import type { Observation } from "./Observation";
import type { ActivityEvent } from "./ActivityEvent";

export type CareFlowData = {
  patients: Patient[];
  tasks: Task[];
  observations: Observation[];
  activity: ActivityEvent[];
};
