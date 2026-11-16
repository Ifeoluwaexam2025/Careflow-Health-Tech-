import type { Task } from "../types/Task";

export type TaskFilters = {
  query: string;
  status: "all" | Task["status"];
  category: "all" | Task["category"];
  sort: "priority" | "due" | "newest";
  patientId?: string;
  priority?: "all" | Task["priority"];
  due?: "all" | "today" | "overdue";
};

export function filterTasks(
  tasks: Task[],
  filters: TaskFilters,
  now = new Date(),
): Task[] {
  const ranks = { high: 0, normal: 1, low: 2 };
  const query = filters.query.trim().toLocaleLowerCase();
  return tasks
    .filter(
      (task) =>
        (!filters.patientId || task.patientId === filters.patientId) &&
        (filters.status === "all" || task.status === filters.status) &&
        (filters.category === "all" || task.category === filters.category) &&
        (!filters.priority ||
          filters.priority === "all" ||
          task.priority === filters.priority) &&
        (!filters.due ||
          filters.due === "all" ||
          (task.dueAt &&
            task.status === "pending" &&
            (filters.due === "today"
              ? new Date(task.dueAt).toDateString() === now.toDateString()
              : Date.parse(task.dueAt) < now.getTime()))) &&
        `${task.title} ${task.description}`.toLocaleLowerCase().includes(query),
    )
    .sort((a, b) => {
      if (filters.sort === "priority")
        return (
          ranks[a.priority] - ranks[b.priority] ||
          a.createdAt.localeCompare(b.createdAt)
        );
      if (filters.sort === "due")
        return (
          (a.dueAt ? Date.parse(a.dueAt) : Infinity) -
            (b.dueAt ? Date.parse(b.dueAt) : Infinity) ||
          a.createdAt.localeCompare(b.createdAt)
        );
      return b.createdAt.localeCompare(a.createdAt);
    });
}
