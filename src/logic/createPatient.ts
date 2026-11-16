import type { Patient } from "../types/Patient";
import type { PatientInput } from "../types/PatientInput";
import { validatePatient } from "./validatePatient";

export function createPatient(input: PatientInput): Patient {
  validatePatient(input);
  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    room: input.room.trim(),
    ward: input.ward.trim(),
    notes: input.notes.trim(),
    createdAt: new Date().toISOString(),
  };
}
