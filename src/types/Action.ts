import type { PatientInput } from "./PatientInput";
import type { TaskInput } from "./TaskInput";
import type { Observation } from "./Observation";

export type Action =
  | { type: "patient.create"; input: PatientInput }
  | { type: "patient.update"; id: string; input: PatientInput }
  | { type: "patient.delete"; id: string }
  | { type: "task.create"; input: TaskInput }
  | { type: "task.update"; id: string; input: TaskInput }
  | { type: "task.toggle"; id: string }
  | { type: "task.delete"; id: string }
  | {
      type: "observation.create";
      patientId: string;
      kind: Observation["kind"];
      value: number;
    }
  | { type: "observation.delete"; id: string };
