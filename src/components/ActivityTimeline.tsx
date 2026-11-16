import type { ActivityEvent } from "../types/ActivityEvent";
import { formatDate } from "../logic/formatDate";
import { EmptyState } from "./EmptyState";
import { Icon } from "./Icon";

export function ActivityTimeline({
  events,
  compact = false,
}: {
  events: ActivityEvent[];
  compact?: boolean;
}) {
  const sorted = [...events].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  return (
    <section className="surface">
      <div className="section-heading">
        <div>
          <h2>{compact ? "Recent activity" : "Activity timeline"}</h2>
          <p>Changes made in this local workspace</p>
        </div>
        {compact && (
          <a href="#/activity" className="text-link">
            View all <Icon name="arrow" size={16} />
          </a>
        )}
      </div>
      {sorted.length ? (
        <ol className="timeline">
          {(compact ? sorted.slice(0, 5) : sorted).map((event) => (
            <li key={event.id}>
              <span className="timeline-dot">
                <Icon name="check" size={13} />
              </span>
              <div>
                <p>{event.description}</p>
                <time dateTime={event.createdAt}>
                  {formatDate(event.createdAt)}
                </time>
                {event.patientId && !compact && (
                  <a
                    href={`#/patients/${event.patientId}`}
                    className="text-link small-text"
                  >
                    Open patient <Icon name="arrow" size={13} />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState
          icon="clock"
          title="Your story starts here"
          description="Patient updates, tasks and observations will appear here as you work."
        />
      )}
    </section>
  );
}
