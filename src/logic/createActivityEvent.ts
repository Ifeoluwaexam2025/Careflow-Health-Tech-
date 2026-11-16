import type { ActivityEvent } from "../types/ActivityEvent";

export function createActivityEvent(
  patientId: string | null,
  description: string,
): ActivityEvent {
  return {
    id: crypto.randomUUID(),
    patientId,
    description,
    createdAt: new Date().toISOString(),
  };
}
