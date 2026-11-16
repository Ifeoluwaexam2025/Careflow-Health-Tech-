import { GeneralTaskFactory } from "../factories/GeneralTaskFactory";
import { ObservationTaskFactory } from "../factories/ObservationTaskFactory";
import type { TaskFactory } from "../factories/TaskFactory";
import type { Task } from "../types/Task";

export function selectTaskFactory(category: Task["category"]): TaskFactory {
  switch (category) {
    case "general":
      return new GeneralTaskFactory();
    case "observation":
      return new ObservationTaskFactory();
    default:
      throw new Error("Unsupported task category.");
  }
}
