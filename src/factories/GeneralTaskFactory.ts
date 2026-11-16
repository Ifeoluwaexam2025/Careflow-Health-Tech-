import { TaskFactory } from "./TaskFactory";
import type { Task } from "../types/Task";
import type { CreateTaskInput } from "../types/CreateTaskInput";
import { createTask } from "../logic/createTask";

export class GeneralTaskFactory extends TaskFactory {
  createTask(input: CreateTaskInput): Task {
    return createTask(input, "general");
  }
}
