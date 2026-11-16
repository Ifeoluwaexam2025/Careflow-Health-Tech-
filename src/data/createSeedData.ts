import { patients } from "./patients";
import type { CareFlowData } from "../types/CareFlowData";

export function createSeedData(): CareFlowData {
  const now = new Date().toISOString();
  return {
    patients: patients.map((patient) => ({
      id: patient.id,
      name: patient.displayName,
      room: patient.room,
      ward: "North Ward",
      notes: "Fictional demonstration patient.",
      createdAt: now,
    })),
    tasks: patients.flatMap((patient) =>
      patient.tasks.map((task) => ({
        id: task.id,
        patientId: patient.id,
        title: task.label,
        description:
          "Fictional starter checklist. Dates reflect when this demo was opened or imported.",
        category: "general" as const,
        priority: "normal" as const,
        dueAt: null,
        status: "pending" as const,
        createdAt: now,
        completedAt: null,
      })),
    ),
    observations: [],
    activity: [],
  };
}
