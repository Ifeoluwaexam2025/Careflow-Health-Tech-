import { Modal } from "./Modal";
import { useFormSubmit } from "../hooks/useFormSubmit";
import { Icon } from "./Icon";

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { submit, submitting, error } = useFormSubmit(onConfirm);
  return (
    <Modal title={title} onClose={onClose}>
      <div className="confirmation-icon">
        <Icon name="trash" size={28} />
      </div>
      <p className="confirmation-copy">{description}</p>
      <form onSubmit={submit}>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Keep record
          </button>
          <button className="button danger" disabled={submitting}>
            {submitting ? "Removing…" : "Confirm removal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
