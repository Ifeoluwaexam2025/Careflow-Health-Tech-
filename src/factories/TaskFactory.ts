import type { Task } from "../types/Task";
import type { CreateTaskInput } from "../types/CreateTaskInput";

export abstract class TaskFactory {
  abstract createTask(input: CreateTaskInput): Task;
}
