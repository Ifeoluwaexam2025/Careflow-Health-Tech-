export type CreateTaskInput = {
  patientId: string;
  title: string;
  description: string;
  priority?: "low" | "normal" | "high";
  dueAt?: string | null;
};
