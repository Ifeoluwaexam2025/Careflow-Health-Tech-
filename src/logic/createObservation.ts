import type { Observation } from "../types/Observation";

export function createObservation(
  patientId: string,
  kind: Observation["kind"],
  value: number,
): Observation {
  if (!patientId.trim()) throw new Error("Select a patient.");
  if (!["temperature", "heartRate"].includes(kind))
    throw new Error("Choose an observation type.");
  if (!Number.isFinite(value)) throw new Error("Enter a numeric value.");
  // Broad demo data-entry bounds, not clinical reference ranges.
  if (kind === "temperature" && (value < 0 || value > 60))
    throw new Error("Enter a temperature from 0 to 60 °C.");
  if (
    kind === "heartRate" &&
    (!Number.isInteger(value) || value < 1 || value > 300)
  )
    throw new Error("Enter a whole heart rate from 1 to 300 bpm.");
  return {
    id: crypto.randomUUID(),
    patientId,
    kind,
    value,
    recordedAt: new Date().toISOString(),
  };
}
