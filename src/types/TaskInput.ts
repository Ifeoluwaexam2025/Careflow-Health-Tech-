import type { CreateTaskInput } from "./CreateTaskInput";
import type { Task } from "./Task";

export type TaskInput = CreateTaskInput & { category: Task["category"] };
