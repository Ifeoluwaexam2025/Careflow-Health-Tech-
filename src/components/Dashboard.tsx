import type { CareFlowData } from "../types/CareFlowData";
import { SummaryCards } from "./SummaryCards";
import { PatientList } from "./PatientList";
import { ActivityTimeline } from "./ActivityTimeline";
import { TaskCard } from "./TaskCard";
import { EmptyState } from "./EmptyState";
import { Icon } from "./Icon";
import { filterTasks } from "../logic/filterTasks";

export function Dashboard({
  data,
  onOpenTask,
  onAddPatient,
}: {
  data: CareFlowData;
  onOpenTask: (id: string) => void;
  onAddPatient: () => void;
}) {
  const pending = filterTasks(data.tasks, {
    query: "",
    status: "pending",
    category: "all",
    sort: "priority",
  });
  const completed = data.tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const progress = data.tasks.length
    ? Math.round((completed / data.tasks.length) * 100)
    : 0;
  return (
    <div className="page-stack">
      <div className="welcome-banner">
        <div>
          <p className="eyebrow">YOUR WARD, AT A GLANCE</p>
          <h2>More clarity. Better coordination.</h2>
          <p>A shared picture of your fictional patients and the work ahead.</p>
        </div>
        <div className="banner-mark" aria-hidden="true">
          <Icon name="pulse" size={70} />
        </div>
      </div>
      <SummaryCards data={data} />
      <div className="dashboard-grid">
        <div className="page-stack">
          <section className="surface">
            <div className="section-heading">
              <div>
                <h2>Work requiring attention</h2>
                <p>Pending tasks, organized by priority</p>
              </div>
              <a href="#/tasks?status=pending" className="text-link">
                All tasks <Icon name="arrow" size={16} />
              </a>
            </div>
            {pending.length ? (
              <div className="priority-groups">
                {(["high", "normal", "low"] as const).map((priority) => {
                  const group = pending.filter(
                    (task) => task.priority === priority,
                  );
                  if (!group.length) return null;
                  return (
                    <div className="priority-group" key={priority}>
                      <h3>
                        <span className={`priority ${priority}`}>
                          <span />
                          {priority} priority
                        </span>
                        <span className="count-pill">{group.length}</span>
                      </h3>
                      {group.slice(0, 2).map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          patientName={
                            data.patients.find(
                              (patient) => patient.id === task.patientId,
                            )?.name
                          }
                          onOpen={onOpenTask}
                        />
                      ))}
                      {group.length > 2 && (
                        <a
                          className="more-link"
                          href={`#/tasks?status=pending&priority=${priority}`}
                        >
                          View all {group.length} {priority} priority tasks{" "}
                          <Icon name="arrow" size={14} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="You're all caught up"
                description="There are no pending tasks in your workspace."
              />
            )}
          </section>
          <PatientList data={data} compact />
        </div>
        <div className="page-stack">
          <section className="surface progress-panel">
            <div className="section-heading">
              <div>
                <h2>Workspace progress</h2>
                <p>All tasks in this local demo</p>
              </div>
              <Icon name="tasks" />
            </div>
            <div className="progress-value">
              <strong>
                {progress}
                <span>%</span>
              </strong>
              <span>completed</span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Tasks completed"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-caption">
              <span>{completed} completed</span>
              <span>{data.tasks.length} total</span>
            </div>
          </section>
          <ActivityTimeline events={data.activity} compact />
          <section className="quick-start">
            <span className="summary-icon teal">
              <Icon name="people" />
            </span>
            <h3>Make room for your next patient</h3>
            <p>
              Add a fictional patient, create tasks and see your workspace come
              together.
            </p>
            <button className="button secondary" onClick={onAddPatient}>
              <Icon name="plus" size={17} />
              Add patient
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
