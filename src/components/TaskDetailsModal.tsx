import type { Task } from "../types/Task";
import { Modal } from "./Modal";
import { formatDate } from "../logic/formatDate";
import { useFormSubmit } from "../hooks/useFormSubmit";
import { Icon } from "./Icon";

export function TaskDetailsModal({
  task,
  patientName,
  onToggle,
  onEdit,
  onDelete,
  onClose,
}: {
  task: Task;
  patientName: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { submit, submitting, error } = useFormSubmit(onToggle);
  return (
    <Modal title={task.title} onClose={onClose}>
      <div className="detail-badges">
        <span className={`badge ${task.status}`}>{task.status}</span>
        <span className="badge neutral">{task.category}</span>
        <span className={`priority ${task.priority}`}>
          <span />
          {task.priority} priority
        </span>
      </div>
      <p className="muted">{patientName}</p>
      <div className="description-block">
        {task.description || "No description provided."}
      </div>
      <dl className="detail-grid">
        <div>
          <dt>Created</dt>
          <dd>{formatDate(task.createdAt)}</dd>
        </div>
        <div>
          <dt>Due</dt>
          <dd>{formatDate(task.dueAt)}</dd>
        </div>
        {task.completedAt && (
          <div>
            <dt>Completed</dt>
            <dd>{formatDate(task.completedAt)}</dd>
          </div>
        )}
      </dl>
      <form onSubmit={submit}>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <div className="detail-actions">
          <button type="button" className="button secondary" onClick={onEdit}>
            <Icon name="edit" size={16} />
            Edit task
          </button>
          <button
            type="button"
            className="button danger-quiet"
            onClick={onDelete}
          >
            <Icon name="trash" size={16} />
            Delete task
          </button>
          <button className="button primary" disabled={submitting}>
            <Icon name="check" size={16} />
            {task.status === "pending"
              ? "Mark as completed"
              : "Mark as pending"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
