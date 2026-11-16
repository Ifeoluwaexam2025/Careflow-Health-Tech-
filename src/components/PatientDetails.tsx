import { useState } from "react";
import type { CareFlowData } from "../types/CareFlowData";
import type { Patient } from "../types/Patient";
import type { ModalState } from "../types/ModalState";
import { TaskList } from "./TaskList";
import { ActivityTimeline } from "./ActivityTimeline";
import { ObservationHistory } from "./ObservationHistory";
import { formatDate } from "../logic/formatDate";
import { Icon } from "./Icon";

export function PatientDetails({
  data,
  patient,
  open,
}: {
  data: CareFlowData;
  patient: Patient;
  open: (modal: ModalState) => void;
}) {
  const [tab, setTab] = useState<"tasks" | "observations" | "activity">(
    "tasks",
  );
  const tasks = data.tasks.filter((task) => task.patientId === patient.id);
  const completed = tasks.filter((task) => task.status === "completed").length;
  return (
    <div className="page-stack">
      <a href="#/patients" className="text-link back-link">
        <Icon name="back" size={16} />
        All patients
      </a>
      <section className="surface patient-overview">
        <div className="patient-overview-main">
          <span className="avatar large">
            {patient.name
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")}
          </span>
          <div>
            <span className="eyebrow">FICTIONAL PATIENT</span>
            <h2>{patient.name}</h2>
            <p>
              Room {patient.room} <span className="separator">·</span>{" "}
              {patient.ward}
            </p>
          </div>
          <div className="patient-tools">
            <button
              className="button secondary"
              onClick={() => open({ kind: "patientForm", id: patient.id })}
            >
              <Icon name="edit" size={16} />
              Edit patient
            </button>
            <button
              className="icon-button danger-quiet"
              aria-label="Remove patient"
              onClick={() =>
                open({ kind: "confirm", target: "patient", id: patient.id })
              }
            >
              <Icon name="trash" />
            </button>
          </div>
        </div>
        {patient.notes && <p className="patient-notes">{patient.notes}</p>}
        <div className="patient-overview-footer">
          <span>
            <strong>{tasks.length - completed}</strong> pending tasks
          </span>
          <span>
            <strong>{completed}</strong> completed tasks
          </span>
          <span>
            <strong>
              {
                data.observations.filter(
                  (item) => item.patientId === patient.id,
                ).length
              }
            </strong>{" "}
            observations
          </span>
          <span className="muted">Added {formatDate(patient.createdAt)}</span>
        </div>
      </section>
      <div className="workspace-toolbar">
        <div className="segmented" aria-label="Patient sections">
          {(["tasks", "observations", "activity"] as const).map((section) => (
            <button
              key={section}
              aria-pressed={tab === section}
              className={tab === section ? "active" : ""}
              onClick={() => setTab(section)}
            >
              {section === "tasks"
                ? "Tasks"
                : section === "observations"
                  ? "Observations"
                  : "Activity"}
            </button>
          ))}
        </div>
        <div className="button-row">
          <button
            className="button secondary"
            onClick={() =>
              open({ kind: "observationForm", patientId: patient.id })
            }
          >
            <Icon name="pulse" size={17} />
            Record observation
          </button>
          <button
            className="button primary"
            onClick={() => open({ kind: "taskForm", patientId: patient.id })}
          >
            <Icon name="plus" size={17} />
            Add task
          </button>
        </div>
      </div>
      {tab === "tasks" && (
        <TaskList
          data={data}
          patientId={patient.id}
          onOpen={(id) => open({ kind: "taskDetails", id })}
        />
      )}
      {tab === "observations" && (
        <ObservationHistory
          data={data}
          patientId={patient.id}
          onDelete={(id) =>
            open({ kind: "confirm", target: "observation", id })
          }
        />
      )}
      {tab === "activity" && (
        <ActivityTimeline
          events={data.activity.filter(
            (event) => event.patientId === patient.id,
          )}
        />
      )}
    </div>
  );
}
