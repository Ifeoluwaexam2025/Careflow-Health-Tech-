import { useState } from "react";
import type { Patient } from "../types/Patient";
import type { Observation } from "../types/Observation";
import { useFormSubmit } from "../hooks/useFormSubmit";
import { Modal } from "./Modal";

export function ObservationForm({
  patients,
  patientId,
  onSave,
  onClose,
}: {
  patients: Patient[];
  patientId?: string;
  onSave: (patientId: string, kind: Observation["kind"], value: number) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(patientId ?? patients[0]?.id ?? "");
  const [kind, setKind] = useState<Observation["kind"]>("temperature");
  const [value, setValue] = useState("");
  const { submit, submitting, error } = useFormSubmit(() => {
    if (!value.trim()) throw new Error("Enter a numeric value.");
    onSave(selected, kind, Number(value));
  });
  return (
    <Modal title="Record simulated observation" onClose={onClose}>
      <p className="form-note">
        Fictional measurements only. Values are recorded without clinical
        interpretation.
      </p>
      <form onSubmit={submit}>
        <label>
          Patient
          <select
            required
            disabled={!!patientId}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="" disabled>
              Select patient
            </option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} · Room {patient.room}
              </option>
            ))}
          </select>
        </label>
        <label>
          Observation type
          <select
            value={kind}
            onChange={(e) => {
              setKind(
                e.target.value === "heartRate" ? "heartRate" : "temperature",
              );
              setValue("");
            }}
          >
            <option value="temperature">Temperature (°C)</option>
            <option value="heartRate">Heart rate (bpm)</option>
          </select>
        </label>
        <label>
          {kind === "temperature" ? "Temperature (°C)" : "Heart rate (bpm)"}
          <input
            required
            type="number"
            inputMode="decimal"
            min={kind === "temperature" ? 0 : 1}
            max={kind === "temperature" ? 60 : 300}
            step={kind === "temperature" ? "any" : "1"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <p className="muted small-text">
          Recorded at the time you save. Input limits are for demo data quality,
          not clinical reference ranges.
        </p>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save observation"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
