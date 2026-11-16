import { useState } from "react";
import { downloadBackup } from "../logic/downloadBackup";
import { Icon } from "./Icon";

export function RecoveryScreen({ message }: { message: string }) {
  const [error, setError] = useState("");
  return (
    <main className="recovery-screen">
      <section className="surface">
        <span className="summary-icon amber">
          <Icon name="shield" size={28} />
        </span>
        <p className="eyebrow">LOCAL DATA RECOVERY</p>
        <h1>Your existing data is protected</h1>
        <p role="alert" className="error-message">
          {message}
        </p>
        <p>
          CareFlow could not safely load this browser's data. No saved records
          have been replaced. Editing is paused to avoid losing your work.
        </p>
        <p>
          Export a backup before repairing stored data. If storage is blocked,
          enable it in your browser and reload. An unsupported schema may need
          the app version that created it.
        </p>
        <div className="button-row">
          <button
            className="button secondary"
            onClick={() => {
              try {
                downloadBackup();
              } catch {
                setError(
                  "Browser storage is unavailable, so a backup could not be read.",
                );
              }
            }}
          >
            <Icon name="download" size={17} />
            Export original data
          </button>
          <button
            className="button primary"
            onClick={() => window.location.reload()}
          >
            Retry loading
          </button>
        </div>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <small className="muted">
          Fictional demo only · Local storage · No backend synchronization
        </small>
      </section>
    </main>
  );
}
