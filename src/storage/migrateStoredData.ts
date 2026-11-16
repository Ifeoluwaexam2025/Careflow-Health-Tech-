import { createSeedData } from "../data/createSeedData";
import { createActivityEvent } from "../logic/createActivityEvent";
import type { CareFlowData } from "../types/CareFlowData";
import { isCareFlowData } from "./isCareFlowData";
import { isRecord } from "./isRecord";
import { isTask } from "./isTask";

export function migrateStoredData(
  statusRaw: string | null,
  tasksRaw: string | null,
): CareFlowData {
  const data = createSeedData();
  const status: unknown = statusRaw === null ? {} : JSON.parse(statusRaw);
  const tasks: unknown = tasksRaw === null ? [] : JSON.parse(tasksRaw);
  if (
    !isRecord(status) ||
    !Object.values(status).every((value) => typeof value === "boolean") ||
    !Array.isArray(tasks)
  ) {
    throw new Error("Legacy data could not be safely imported.");
  }
  if (
    Object.keys(status).some((id) => !data.tasks.some((task) => task.id === id))
  ) {
    throw new Error(
      "Legacy checklist contains unknown task IDs. Original data has been kept.",
    );
  }
  data.tasks = data.tasks.map((task) =>
    status[task.id]
      ? { ...task, status: "completed", completedAt: task.createdAt }
      : task,
  );
  for (const candidate of tasks) {
    if (!isRecord(candidate)) throw new Error("A legacy task is invalid.");
    const task = {
      ...candidate,
      category: candidate.category ?? "general",
      priority: candidate.priority ?? "normal",
      dueAt: candidate.dueAt ?? null,
    };
    if (!isTask(task))
      throw new Error("A legacy task is invalid. Original data has been kept.");
    data.tasks.push(task);
  }
  if (statusRaw !== null || tasksRaw !== null) {
    data.activity.push(
      createActivityEvent(
        null,
        "Imported starter checklist and locally created tasks. Original storage retained; checklist dates reflect import time.",
      ),
    );
  }
  if (!isCareFlowData(data))
    throw new Error(
      "Imported data contains duplicate IDs or missing patients. Original data has been kept.",
    );
  return data;
}
