import type { Task } from "../types/Task";
import { formatDate } from "../logic/formatDate";
import { Icon } from "./Icon";

export function TaskCard({
  task,
  patientName,
  onOpen,
}: {
  task: Task;
  patientName?: string;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={`task-card ${task.status}`}
      onClick={() => onOpen(task.id)}
    >
      <span className={`task-status-icon ${task.status}`}>
        <Icon
          name={
            task.status === "completed"
              ? "check"
              : task.category === "observation"
                ? "pulse"
                : "tasks"
          }
        />
      </span>
      <span className="task-card-body">
        <span className="task-card-title">{task.title}</span>
        {patientName && <span className="task-patient">{patientName}</span>}
        <span className="task-preview">
          {task.description || "No description provided."}
        </span>
        <span className="task-meta">
          <span className={`priority ${task.priority}`}>
            <span />
            {task.priority} priority
          </span>
          <span>
            {task.category === "observation" ? "Observation" : "General"}
          </span>
          {task.dueAt && (
            <span
              className={
                task.status === "pending" && Date.parse(task.dueAt) < Date.now()
                  ? "overdue"
                  : ""
              }
            >
              Due {formatDate(task.dueAt)}
            </span>
          )}
        </span>
      </span>
      <span className={`badge ${task.status}`}>
        {task.status === "completed" ? "Completed" : "Pending"}
      </span>
      <Icon name="chevron" size={18} />
    </button>
  );
}
