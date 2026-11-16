import { useState } from "react";
import type { CareFlowData } from "../types/CareFlowData";
import { formatDate } from "../logic/formatDate";
import { EmptyState } from "./EmptyState";
import { Icon } from "./Icon";

export function ObservationHistory({
  data,
  patientId,
  onDelete,
}: {
  data: CareFlowData;
  patientId?: string;
  onDelete: (id: string) => void;
}) {
  const [patientFilter, setPatientFilter] = useState("all");
  const observations = data.observations
    .filter((item) =>
      patientId
        ? item.patientId === patientId
        : patientFilter === "all" || item.patientId === patientFilter,
    )
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  return (
    <section className="surface">
      <div className="section-heading">
        <div>
          <h2>
            Observation history{" "}
            <span className="count-pill">{observations.length}</span>
          </h2>
          <p>Simulated values · no clinical interpretation</p>
        </div>
        {!patientId && (
          <label>
            <span className="sr-only">Filter observations by patient</span>
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
            >
              <option value="all">All patients</option>
              {data.patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {observations.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {!patientId && <th>Patient</th>}
                <th>Observation</th>
                <th>Value</th>
                <th>Recorded</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {observations.map((observation) => (
                <tr key={observation.id}>
                  {!patientId && (
                    <td>
                      <a
                        className="text-link"
                        href={`#/patients/${observation.patientId}`}
                      >
                        {
                          data.patients.find(
                            (patient) => patient.id === observation.patientId,
                          )?.name
                        }
                      </a>
                    </td>
                  )}
                  <td>
                    <span className="observation-kind">
                      <Icon name="pulse" size={17} />
                      {observation.kind === "temperature"
                        ? "Temperature"
                        : "Heart rate"}
                    </span>
                  </td>
                  <td>
                    <strong className="observation-value">
                      {observation.value}
                    </strong>{" "}
                    <span className="muted">
                      {observation.kind === "temperature" ? "°C" : "bpm"}
                    </span>
                  </td>
                  <td>
                    <time dateTime={observation.recordedAt}>
                      {formatDate(observation.recordedAt)}
                    </time>
                  </td>
                  <td>
                    <button
                      className="icon-button danger-quiet"
                      onClick={() => onDelete(observation.id)}
                      aria-label={`Remove ${observation.kind === "temperature" ? "temperature" : "heart rate"} observation ${observation.value}`}
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="pulse"
          title="No observations yet"
          description="Record a fictional temperature or heart rate. Saved entries will appear here."
        />
      )}
    </section>
  );
}
