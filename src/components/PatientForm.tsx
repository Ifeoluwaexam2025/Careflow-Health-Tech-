import { useState } from "react";
import type { Patient } from "../types/Patient";
import type { PatientInput } from "../types/PatientInput";
import { useFormSubmit } from "../hooks/useFormSubmit";
import { Modal } from "./Modal";

export function PatientForm({
  patient,
  onSave,
  onClose,
}: {
  patient?: Patient;
  onSave: (input: PatientInput) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState<PatientInput>({
    name: patient?.name ?? "",
    room: patient?.room ?? "",
    ward: patient?.ward ?? "North Ward",
    notes: patient?.notes ?? "",
  });
  const { submit, submitting, error } = useFormSubmit(() => onSave(input));
  return (
    <Modal
      title={patient ? "Edit patient" : "Add fictional patient"}
      onClose={onClose}
    >
      <p className="form-note">
        Use invented information only. This workspace is a demonstration.
      </p>
      <form onSubmit={submit}>
        <label>
          Fictional patient name
          <input
            name="name"
            required
            maxLength={100}
            autoComplete="off"
            value={input.name}
            onChange={(e) => setInput({ ...input, name: e.target.value })}
            placeholder="e.g. Casey Rivers (fictional)"
          />
        </label>
        <div className="form-grid">
          <label>
            Room
            <input
              name="room"
              required
              maxLength={20}
              value={input.room}
              onChange={(e) => setInput({ ...input, room: e.target.value })}
              placeholder="e.g. 104"
            />
          </label>
          <label>
            Ward
            <input
              name="ward"
              required
              maxLength={60}
              value={input.ward}
              onChange={(e) => setInput({ ...input, ward: e.target.value })}
            />
          </label>
        </div>
        <label>
          Non-clinical notes <span className="optional">optional</span>
          <textarea
            name="notes"
            maxLength={1000}
            rows={3}
            value={input.notes}
            onChange={(e) => setInput({ ...input, notes: e.target.value })}
            placeholder="Fictional context for your demonstration"
          />
        </label>
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
            {submitting ? "Saving…" : "Save patient"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
