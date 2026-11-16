import { useState } from "react";
import type { CareFlowData } from "../types/CareFlowData";
import { SearchField } from "./SearchField";
import { EmptyState } from "./EmptyState";
import { Icon } from "./Icon";

export function PatientList({
  data,
  compact = false,
}: {
  data: CareFlowData;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const patients = data.patients.filter((patient) =>
    `${patient.name} ${patient.room} ${patient.ward}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  );
  return (
    <section className="surface">
      <div className="section-heading">
        <div>
          <h2>
            {compact ? "Your patients" : "Patient directory"}
            <span className="count-pill">{data.patients.length}</span>
          </h2>
          <p>Fictional records across your demo workspace</p>
        </div>
        {compact ? (
          <a className="text-link" href="#/patients">
            View all <Icon name="arrow" size={16} />
          </a>
        ) : (
          <SearchField
            label="Search patients or rooms"
            value={query}
            onChange={setQuery}
          />
        )}
      </div>
      {patients.length === 0 ? (
        <EmptyState
          icon="people"
          title={query ? "No patients found" : "Your workspace is ready"}
          description={
            query
              ? "Try another name, room or ward."
              : "Add your first fictional patient to start organizing tasks."
          }
        />
      ) : (
        <div className="table-scroll">
          <table className="patient-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Room / ward</th>
                <th>Pending</th>
                <th>Completed</th>
                <th>
                  <span className="sr-only">Open profile</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {(compact ? patients.slice(0, 5) : patients).map((patient) => {
                const tasks = data.tasks.filter(
                  (task) => task.patientId === patient.id,
                );
                const completed = tasks.filter(
                  (task) => task.status === "completed",
                ).length;
                return (
                  <tr key={patient.id}>
                    <td>
                      <a
                        className="patient-link"
                        href={`#/patients/${patient.id}`}
                      >
                        <span className="avatar">
                          {patient.name
                            .split(" ")
                            .slice(0, 2)
                            .map((word) => word[0])
                            .join("")}
                        </span>
                        <span>
                          <strong>{patient.name}</strong>
                          <small>Fictional patient</small>
                        </span>
                      </a>
                    </td>
                    <td>
                      <strong>{patient.room}</strong>
                      <small>{patient.ward}</small>
                    </td>
                    <td>
                      <span className="number-badge">
                        {tasks.length - completed}
                      </span>
                    </td>
                    <td>
                      <span className="completed-number">{completed}</span>
                    </td>
                    <td>
                      <a
                        className="icon-button"
                        href={`#/patients/${patient.id}`}
                        aria-label={`Open ${patient.name}`}
                      >
                        <Icon name="chevron" size={18} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
