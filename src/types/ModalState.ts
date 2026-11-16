export type ModalState =
  | { kind: "patientForm"; id?: string }
  | { kind: "taskForm"; id?: string; patientId?: string }
  | { kind: "taskDetails"; id: string }
  | { kind: "observationForm"; patientId?: string }
  | { kind: "confirm"; target: "patient" | "task" | "observation"; id: string }
  | null;
