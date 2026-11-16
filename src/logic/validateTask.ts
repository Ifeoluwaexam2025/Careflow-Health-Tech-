import type { CreateTaskInput } from "../types/CreateTaskInput";

export function validateTask(input: CreateTaskInput): void {
  if (!input.patientId.trim()) throw new Error("Select a patient.");
  if (!input.title.trim() || input.title.trim().length > 100)
    throw new Error("Enter a title between 1 and 100 characters.");
  if (input.description.trim().length > 2000)
    throw new Error("Description must be 2000 characters or fewer.");
  if (
    input.priority !== undefined &&
    !["low", "normal", "high"].includes(input.priority)
  )
    throw new Error("Choose a valid priority.");
  if (input.dueAt && !Number.isFinite(Date.parse(input.dueAt)))
    throw new Error("Enter a valid due date.");
}
