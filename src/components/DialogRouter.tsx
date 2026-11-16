import type { CareFlowData } from "../types/CareFlowData";
import type { Action } from "../types/Action";
import type { ModalState } from "../types/ModalState";
import { PatientForm } from "./PatientForm";
import { TaskForm } from "./TaskForm";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { ObservationForm } from "./ObservationForm";
import { ConfirmDialog } from "./ConfirmDialog";

export function DialogRouter({
  modal,
  data,
  dispatch,
  open,
  onPatientCreated,
  onPatientDeleted,
}: {
  modal: ModalState;
  data: CareFlowData;
  dispatch: (action: Action) => string | null;
  open: (modal: ModalState) => void;
  onPatientCreated: (id: string) => void;
  onPatientDeleted: () => void;
}) {
  if (!modal) return null;
  const close = () => open(null);
  switch (modal.kind) {
    case "patientForm":
      return (
        <PatientForm
          patient={data.patients.find((patient) => patient.id === modal.id)}
          onClose={close}
          onSave={(input) => {
            const id = dispatch(
              modal.id
                ? { type: "patient.update", id: modal.id, input }
                : { type: "patient.create", input },
            );
            close();
            if (!modal.id && id) onPatientCreated(id);
          }}
        />
      );
    case "taskForm":
      return (
        <TaskForm
          task={data.tasks.find((task) => task.id === modal.id)}
          patients={data.patients}
          patientId={modal.patientId}
          onClose={close}
          onSave={(input) => {
            dispatch(
              modal.id
                ? { type: "task.update", id: modal.id, input }
                : { type: "task.create", input },
            );
            close();
          }}
        />
      );
    case "taskDetails": {
      const task = data.tasks.find((item) => item.id === modal.id);
      if (!task) return null;
      return (
        <TaskDetailsModal
          task={task}
          patientName={
            data.patients.find((patient) => patient.id === task.patientId)
              ?.name ?? "Fictional patient"
          }
          onClose={close}
          onToggle={() => {
            dispatch({ type: "task.toggle", id: task.id });
            close();
          }}
          onEdit={() => open({ kind: "taskForm", id: task.id })}
          onDelete={() =>
            open({ kind: "confirm", target: "task", id: task.id })
          }
        />
      );
    }
    case "observationForm":
      return (
        <ObservationForm
          patients={data.patients}
          patientId={modal.patientId}
          onClose={close}
          onSave={(patientId, kind, value) => {
            dispatch({ type: "observation.create", patientId, kind, value });
            close();
          }}
        />
      );
    case "confirm": {
      const name =
        modal.target === "patient"
          ? data.patients.find((item) => item.id === modal.id)?.name
          : modal.target === "task"
            ? data.tasks.find((item) => item.id === modal.id)?.title
            : "this simulated observation";
      return (
        <ConfirmDialog
          title={`Remove ${modal.target}?`}
          description={
            modal.target === "patient"
              ? `Remove ${name} and all associated tasks, observations and patient activity? This cannot be undone. A workspace removal event will remain.`
              : `Remove ${name}? This cannot be undone. The action will be recorded in activity.`
          }
          onClose={close}
          onConfirm={() => {
            if (modal.target === "patient")
              dispatch({ type: "patient.delete", id: modal.id });
            else if (modal.target === "task")
              dispatch({ type: "task.delete", id: modal.id });
            else dispatch({ type: "observation.delete", id: modal.id });
            close();
            if (modal.target === "patient") onPatientDeleted();
          }}
        />
      );
    }
  }
}
