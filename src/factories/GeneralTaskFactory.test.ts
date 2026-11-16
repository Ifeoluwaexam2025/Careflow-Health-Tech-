import { describe, expect, it } from "vitest";
import { GeneralTaskFactory } from "./GeneralTaskFactory";

describe("GeneralTaskFactory", () => {
  it("creates a pending general task", () => {
    const factory = new GeneralTaskFactory();

    const task = factory.createTask({
      patientId: "p-101",
      title: "Review checklist",
      description: "Complete the simulated checklist",
    });

    expect(task.patientId).toBe("p-101");
    expect(task.category).toBe("general");
    expect(task.status).toBe("pending");
    expect(task.completedAt).toBeNull();
    expect(task.id).toBeTruthy();
    expect(task.createdAt).toBeTruthy();
  });
});
