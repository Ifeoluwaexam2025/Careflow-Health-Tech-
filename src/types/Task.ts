export type Task = {
  id: string;
  patientId: string;
  title: string;
  description: string;
  category: "general" | "observation";
  priority: "low" | "normal" | "high";
  dueAt: string | null;
  status: "pending" | "completed";
  createdAt: string;
  completedAt: string | null;
};
