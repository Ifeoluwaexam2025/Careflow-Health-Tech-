import { useState } from "react";
import { useCareFlow } from "./hooks/useCareFlow";
import { useNavigation } from "./hooks/useNavigation";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import type { ModalState } from "./types/ModalState";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { PatientList } from "./components/PatientList";
import { PatientDetails } from "./components/PatientDetails";
import { TaskList } from "./components/TaskList";
import { ObservationHistory } from "./components/ObservationHistory";
import { ActivityTimeline } from "./components/ActivityTimeline";
import { DialogRouter } from "./components/DialogRouter";
import { RecoveryScreen } from "./components/RecoveryScreen";
import { EmptyState } from "./components/EmptyState";
import { Icon } from "./components/Icon";

const pageCopy = {
  overview: {
    title: "Workspace overview",
    subtitle: "A clearer view of your patients and the work ahead.",
  },
  patients: {
    title: "Patients",
    subtitle: "Every fictional patient, with everything in one place.",
  },
  tasks: {
    title: "Task workspace",
    subtitle: "Plan, prioritize and follow through.",
  },
  observations: {
    title: "Simulated observations",
    subtitle: "A simple record of fictional measurements.",
  },
  activity: {
    title: "Workspace activity",
    subtitle: "A timeline of the changes you make.",
  },
};

export default function App() {
  const { data, feedback, loadError, dispatch } = useCareFlow();
  const navigation = useNavigation();
  const online = useOnlineStatus();
  const [modal, open] = useState<ModalState>(null);
  if (!data)
    return (
      <RecoveryScreen message={loadError ?? "Could not load local data."} />
    );
  const patient = data.patients.find(
    (item) => item.id === navigation.patientId,
  );
  const pending = data.tasks.filter((task) => task.status === "pending").length;
  const copy = pageCopy[navigation.view];
  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      <Sidebar view={navigation.view} pending={pending} />
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <Icon name="chevron" size={13} />
            <span>
              {navigation.patientId
                ? "Patient profile"
                : navigation.view === "overview"
                  ? "Overview"
                  : copy.title}
            </span>
          </div>
          <div className="topbar-status">
            <span className="local-indicator">
              <Icon name="device" size={15} />
              {online ? "On this device only" : "Offline · on this device"}
            </span>
            <span className="demo-badge">DEMO ENVIRONMENT</span>
            <span className="avatar small">CF</span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="main-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">FICTIONAL CARE · REAL COORDINATION</p>
              <h1 tabIndex={-1} data-main-focus>
                {navigation.patientId ? "Patient workspace" : copy.title}
              </h1>
              <p>
                {navigation.patientId
                  ? "Patient details, tasks and observations, together."
                  : copy.subtitle}
              </p>
            </div>
            <div className="button-row">
              {(navigation.view === "overview" ||
                (navigation.view === "patients" && !navigation.patientId)) && (
                <button
                  className="button primary"
                  onClick={() => open({ kind: "patientForm" })}
                >
                  <Icon name="plus" size={18} />
                  Add patient
                </button>
              )}
              {navigation.view === "tasks" && (
                <button
                  className="button primary"
                  disabled={!data.patients.length}
                  onClick={() => open({ kind: "taskForm" })}
                >
                  <Icon name="plus" size={18} />
                  Add task
                </button>
              )}
              {navigation.view === "observations" && (
                <button
                  className="button primary"
                  disabled={!data.patients.length}
                  onClick={() => open({ kind: "observationForm" })}
                >
                  <Icon name="plus" size={18} />
                  Record observation
                </button>
              )}
            </div>
          </div>
          <div
            className={`save-feedback ${feedback.error ? "feedback-error" : ""}`}
            role={feedback.error ? "alert" : "status"}
          >
            <Icon name={feedback.error ? "shield" : "check"} size={15} />
            <span>{feedback.message}</span>
            <span className="save-note">No server synchronization</span>
          </div>
          {navigation.view === "overview" && (
            <Dashboard
              data={data}
              onOpenTask={(id) => open({ kind: "taskDetails", id })}
              onAddPatient={() => open({ kind: "patientForm" })}
            />
          )}
          {navigation.view === "patients" &&
            (navigation.patientId ? (
              patient ? (
                <PatientDetails
                  key={patient.id}
                  data={data}
                  patient={patient}
                  open={open}
                />
              ) : (
                <section className="surface">
                  <EmptyState
                    icon="people"
                    title="Patient not found"
                    description="This patient may have been removed from this workspace."
                  >
                    <a className="button secondary" href="#/patients">
                      Back to patients
                    </a>
                  </EmptyState>
                </section>
              )
            ) : (
              <PatientList data={data} />
            ))}
          {navigation.view === "tasks" && (
            <TaskList
              key={JSON.stringify(navigation.taskFilters)}
              data={data}
              initialFilters={navigation.taskFilters}
              onOpen={(id) => open({ kind: "taskDetails", id })}
            />
          )}
          {navigation.view === "observations" && (
            <ObservationHistory
              data={data}
              onDelete={(id) =>
                open({ kind: "confirm", target: "observation", id })
              }
            />
          )}
          {navigation.view === "activity" && (
            <ActivityTimeline events={data.activity} />
          )}
          {!data.patients.length &&
            (navigation.view === "tasks" ||
              navigation.view === "observations") && (
              <p className="inline-help">
                Add a fictional patient first.{" "}
                <a className="text-link" href="#/patients">
                  Go to patients <Icon name="arrow" size={14} />
                </a>
              </p>
            )}
          <footer className="page-footer">
            <span>
              CareFlow <span className="separator">/</span> A fictional nursing
              workflow prototype
            </span>
            <span>No real patient data. Not for clinical use.</span>
          </footer>
        </main>
      </div>
      <DialogRouter
        key={
          modal?.kind === "taskForm"
            ? `taskForm-${modal.id ?? "new"}`
            : modal?.kind === "patientForm"
              ? `patientForm-${modal.id ?? "new"}`
              : modal?.kind
        }
        modal={modal}
        data={data}
        dispatch={dispatch}
        open={open}
        onPatientCreated={(id) =>
          navigation.navigate({ view: "patients", patientId: id })
        }
        onPatientDeleted={() => navigation.navigate({ view: "patients" })}
      />
    </div>
  );
}
