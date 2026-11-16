import type { View } from "../types/Navigation";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

const items: { view: View; label: string; icon: IconName }[] = [
  { view: "overview", label: "Overview", icon: "grid" },
  { view: "patients", label: "Patients", icon: "people" },
  { view: "tasks", label: "Tasks", icon: "tasks" },
  { view: "observations", label: "Observations", icon: "pulse" },
  { view: "activity", label: "Activity", icon: "clock" },
];

export function Sidebar({ view, pending }: { view: View; pending: number }) {
  return (
    <aside className="sidebar">
      <a href="#/overview" className="brand">
        <span className="brand-symbol" aria-hidden="true">
          +
        </span>
        <span>
          CareFlow
          <span className="brand-caption" aria-hidden="true">
            CARE, COORDINATED.
          </span>
        </span>
      </a>
      <div className="workspace-label">
        <span className="ward-dot" />
        <div>
          Demo workspace<small>Fictional wards</small>
        </div>
        <span className="demo-pill">DEMO</span>
      </div>
      <p className="nav-caption">WORKSPACE</p>
      <nav aria-label="Main navigation">
        {items.map((item) => (
          <a
            key={item.view}
            href={`#/${item.view}`}

            className={`nav-item ${view === item.view ? "selected" : ""}`}
            aria-current={view === item.view ? "page" : undefined}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.view === "tasks" && pending > 0 && (
              <span className="nav-count" aria-hidden="true">
                {pending}
              </span>
            )}
          </a>
        ))}
      </nav>
      <div className="sidebar-note">
        <Icon name="shield" />
        <strong>A space to explore</strong>
        <p>
          Fictional patients. Simulated care.
          <br />
          Built for learning, never clinical use.
        </p>
      </div>
      <div className="sidebar-footer">
        <span className="avatar small">CF</span>
        <div>
          Portfolio workspace<small>Local demonstration</small>
        </div>
      </div>
    </aside>
  );
}
