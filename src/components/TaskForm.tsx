import { useState } from "react";
import type { Patient } from "../types/Patient";
import type { Task } from "../types/Task";
import type { TaskInput } from "../types/TaskInput";
import { toLocalDateInput } from "../logic/toLocalDateInput";
import { useFormSubmit } from "../hooks/useFormSubmit";
import { Modal } from "./Modal";

export function TaskForm({
  task,
  patientId,
  patients,
  onSave,
  onClose,
}: {
  task?: Task;
  patientId?: string;
  patients: Patient[];
  onSave: (input: TaskInput) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState<TaskInput>({
    patientId: task?.patientId ?? patientId ?? patients[0]?.id ?? "",
    title: task?.title ?? "",
    description: task?.description ?? "",
    category: task?.category ?? "general",
    priority: task?.priority ?? "normal",
    dueAt: toLocalDateInput(task?.dueAt ?? null),
  });
  const { submit, submitting, error } = useFormSubmit(() => onSave(input));
  return (
    <Modal title={task ? "Edit task" : "Create task"} onClose={onClose}>
      <form onSubmit={submit}>
        <label>
          Patient
          <select
            name="patientId"
            required
            disabled={!!task || !!patientId}
            value={input.patientId}
            onChange={(e) => setInput({ ...input, patientId: e.target.value })}
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
          Task title
          <input
            name="title"
            required
            maxLength={100}
            value={input.title}
            onChange={(e) => setInput({ ...input, title: e.target.value })}
            placeholder="What needs to be done?"
          />
        </label>
        <label>
          Description <span className="optional">optional</span>
          <textarea
            name="description"
            maxLength={2000}
            rows={4}
            value={input.description}
            onChange={(e) =>
              setInput({ ...input, description: e.target.value })
            }
            placeholder="Add details for this fictional task"
          />
        </label>
        <div className="form-grid">
          <label>
            Category
            <select
              name="category"
              value={input.category}
              onChange={(e) =>
                setInput({
                  ...input,
                  category:
                    e.target.value === "observation"
                      ? "observation"
                      : "general",
                })
              }
            >
              <option value="general">General task</option>
              <option value="observation">Observation task</option>
            </select>
          </label>
          <label>
            Priority
            <select
              name="priority"
              value={input.priority}
              onChange={(e) =>
                setInput({
                  ...input,
                  priority:
                    e.target.value === "high"
                      ? "high"
                      : e.target.value === "low"
                        ? "low"
                        : "normal",
                })
              }
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <label>
          Due date & time{" "}
          <span className="optional">optional · local time</span>
          <input
            type="datetime-local"
            name="dueAt"
            value={input.dueAt ?? ""}
            onChange={(e) => setInput({ ...input, dueAt: e.target.value })}
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
            {submitting ? "Saving…" : task ? "Save changes" : "Create task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
