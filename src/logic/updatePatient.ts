import type { Patient } from "../types/Patient";
import type { PatientInput } from "../types/PatientInput";
import { validatePatient } from "./validatePatient";

export function updatePatient(patient: Patient, input: PatientInput): Patient {
  validatePatient(input);
  return {
    ...patient,
    name: input.name.trim(),
    room: input.room.trim(),
    ward: input.ward.trim(),
    notes: input.notes.trim(),
  };
}
