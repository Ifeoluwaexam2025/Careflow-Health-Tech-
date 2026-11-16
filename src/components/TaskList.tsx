import { useState } from "react";
import type { CareFlowData } from "../types/CareFlowData";
import { filterTasks } from "../logic/filterTasks";
import type { TaskFilters } from "../logic/filterTasks";
import { TaskCard } from "./TaskCard";
import { SearchField } from "./SearchField";
import { EmptyState } from "./EmptyState";

export function TaskList({
  data,
  patientId,
  onOpen,
  initialFilters,
}: {
  data: CareFlowData;
  patientId?: string;
  onOpen: (id: string) => void;
  initialFilters?: Partial<TaskFilters>;
}) {
  const [filters, setFilters] = useState<TaskFilters>({
    query: "",
    status: "all",
    category: "all",
    sort: "priority",
    patientId,
    priority: "all",
    due: "all",
    ...initialFilters,
  });
  const scoped = data.tasks.filter(
    (task) => !patientId || task.patientId === patientId,
  );
  const tasks = filterTasks(data.tasks, { ...filters, patientId });
  return (
    <section className="surface">
      <div className="section-heading">
        <div>
          <h2>
            Tasks <span className="count-pill">{scoped.length}</span>
          </h2>
          <p>A clear view of work, from pending to complete</p>
        </div>
        <SearchField
          label="Search tasks"
          value={filters.query}
          onChange={(query) => setFilters({ ...filters, query })}
        />
      </div>
      <div className="task-toolbar">
        <div className="segmented" aria-label="Filter tasks by status">
          {(["all", "pending", "completed"] as const).map((status) => (
            <button
              key={status}
              className={filters.status === status ? "active" : ""}
              aria-pressed={filters.status === status}
              onClick={() => setFilters({ ...filters, status })}
            >
              {status === "all"
                ? "All tasks"
                : status === "pending"
                  ? "Pending"
                  : "Completed"}
              <span>
                {
                  scoped.filter(
                    (task) => status === "all" || task.status === status,
                  ).length
                }
              </span>
            </button>
          ))}
        </div>
        <div className="filter-selects">
          <label>
            <span className="sr-only">Filter by priority</span>
            <select
              value={filters.priority}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  priority:
                    event.target.value === "high"
                      ? "high"
                      : event.target.value === "normal"
                        ? "normal"
                        : event.target.value === "low"
                          ? "low"
                          : "all",
                })
              }
            >
              <option value="all">All priorities</option>
              <option value="high">High priority</option>
              <option value="normal">Normal priority</option>
              <option value="low">Low priority</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by due date</span>
            <select
              value={filters.due}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  due:
                    event.target.value === "today"
                      ? "today"
                      : event.target.value === "overdue"
                        ? "overdue"
                        : "all",
                })
              }
            >
              <option value="all">Any due date</option>
              <option value="today">Due today</option>
              <option value="overdue">Overdue</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  category:
                    e.target.value === "general"
                      ? "general"
                      : e.target.value === "observation"
                        ? "observation"
                        : "all",
                })
              }
            >
              <option value="all">All categories</option>
              <option value="general">General</option>
              <option value="observation">Observation</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Sort tasks</span>
            <select
              value={filters.sort}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sort:
                    e.target.value === "due"
                      ? "due"
                      : e.target.value === "newest"
                        ? "newest"
                        : "priority",
                })
              }
            >
              <option value="priority">Priority first</option>
              <option value="due">Due date first</option>
              <option value="newest">Newest first</option>
            </select>
          </label>
        </div>
      </div>
      <div className="task-list">
        {tasks.length ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              patientName={
                patientId
                  ? undefined
                  : data.patients.find(
                      (patient) => patient.id === task.patientId,
                    )?.name
              }
              onOpen={onOpen}
            />
          ))
        ) : (
          <EmptyState
            title={
              scoped.length ? "No matching tasks" : "A little breathing room"
            }
            description={
              scoped.length
                ? "Adjust your search or filters to find more tasks."
                : "Create a task to begin planning work for this patient."
            }
          />
        )}
      </div>
    </section>
  );
}
