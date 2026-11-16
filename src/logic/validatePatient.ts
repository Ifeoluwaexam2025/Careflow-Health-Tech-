import type { PatientInput } from "../types/PatientInput";

export function validatePatient(input: PatientInput): void {
  if (!input.name.trim() || input.name.trim().length > 100) {
    throw new Error("Enter a fictional name between 1 and 100 characters.");
  }
  if (!input.room.trim() || input.room.trim().length > 20) {
    throw new Error("Enter a room between 1 and 20 characters.");
  }
  if (!input.ward.trim() || input.ward.trim().length > 60) {
    throw new Error("Enter a ward between 1 and 60 characters.");
  }
  if (input.notes.trim().length > 1000)
    throw new Error("Notes must be 1000 characters or fewer.");
}
