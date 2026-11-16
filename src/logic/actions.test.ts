import { describe, expect, it } from "vitest";
import { createSeedData } from "../data/createSeedData";
import type { Action } from "../types/Action";
import { applyAction } from "./applyAction";

describe("action coordination", () => {
  it("creates and edits a patient with exactly one event per action", () => {
    const original = createSeedData();
    const input = {
      name: "Casey (fictional)",
      room: "104",
      ward: "North Ward",
      notes: "",
    };
    const created = applyAction(original, { type: "patient.create", input });
    const id = created.entityId!;
    const updated = applyAction(created.data, {
      type: "patient.update",
      id,
      input: { ...input, room: "105" },
    });

    expect(updated.entityId).toBe(id);
    expect(
      updated.data.patients.find((patient) => patient.id === id)?.room,
    ).toBe("105");
    expect(updated.data.activity).toHaveLength(2);
    expect(updated.data.activity.map((event) => event.description)).toEqual([
      "Patient added: Casey (fictional)",
      "Patient updated: Casey (fictional)",
    ]);
    expect(updated.data.activity.every((event) => event.patientId === id)).toBe(
      true,
    );
    expect(original.patients).toHaveLength(3);
    expect(original.activity).toEqual([]);
  });

  it("coordinates the full task lifecycle without changing identity or duplicating activity", () => {
    const original = createSeedData();
    const input = {
      patientId: "p-101",
      title: "Original task",
      description: "Fictional details",
      category: "observation" as const,
    };
    const created = applyAction(original, { type: "task.create", input });
    const id = created.entityId!;
    expect(created.data.tasks.find((task) => task.id === id)?.category).toBe(
      "observation",
    );
    const updated = applyAction(created.data, {
      type: "task.update",
      id,
      input: { ...input, title: "Edited task" },
    });
    const completed = applyAction(updated.data, { type: "task.toggle", id });
    expect(
      completed.data.tasks.find((task) => task.id === id)?.completedAt,
    ).not.toBeNull();
    const reopened = applyAction(completed.data, { type: "task.toggle", id });
    expect(reopened.data.tasks.find((task) => task.id === id)).toMatchObject({
      status: "pending",
      completedAt: null,
    });
    const deleted = applyAction(reopened.data, { type: "task.delete", id });

    expect(deleted.entityId).toBe(id);
    expect(deleted.data.tasks).toEqual(original.tasks);
    expect(deleted.data.activity.map((event) => event.description)).toEqual([
      "Task created: Original task",
      "Task updated: Edited task",
      "Task completed: Edited task",
      "Task reopened: Edited task",
      "Task deleted: Edited task",
    ]);
    expect(
      deleted.data.activity.every((event) => event.patientId === "p-101"),
    ).toBe(true);
    expect(original.activity).toEqual([]);
  });

  it.each([
    {
      type: "patient.update",
      id: "missing",
      input: { name: "Fictional", room: "104", ward: "North", notes: "" },
    },
    { type: "patient.delete", id: "missing" },
    {
      type: "task.update",
      id: "missing",
      input: {
        patientId: "p-101",
        title: "Test",
        description: "",
        category: "general",
      },
    },
    { type: "task.toggle", id: "missing" },
    { type: "task.delete", id: "missing" },
    { type: "observation.delete", id: "missing" },
  ] satisfies Action[])(
    "rejects missing targets for $type without adding an event",
    (action) => {
      const data = createSeedData();
      const snapshot = structuredClone(data);
      expect(() => applyAction(data, action)).toThrow("no longer exists");
      expect(data).toEqual(snapshot);
    },
  );
});
