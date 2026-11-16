import { describe, expect, it, vi } from "vitest";
import { createPatient } from "./createPatient";
import { updatePatient } from "./updatePatient";
import { GeneralTaskFactory } from "../factories/GeneralTaskFactory";
import { ObservationTaskFactory } from "../factories/ObservationTaskFactory";
import { selectTaskFactory } from "./selectTaskFactory";
import { createTask } from "./createTask";
import { toggleTaskStatus } from "./toggleTaskStatus";
import { updateTask } from "./updateTask";
import { deleteTask } from "./deleteTask";
import { filterTasks } from "./filterTasks";
import { createObservation } from "./createObservation";
import { createSeedData } from "../data/createSeedData";
import { applyAction } from "./applyAction";
import { getDashboardSummary } from "./getDashboardSummary";
import { parseRoute } from "./parseRoute";

const patientInput = {
  name: "  Casey Rivers  ",
  room: " 104 ",
  ward: " North Ward ",
  notes: " Fictional only ",
};
const taskInput = {
  patientId: "p-101",
  title: "  Review checklist  ",
  description: " Fictional details ",
};

describe("patients", () => {
  it("trims fields and creates stable unique identities and timestamps", () => {
    const patient = createPatient(patientInput);
    expect(patient).toMatchObject({
      name: "Casey Rivers",
      room: "104",
      ward: "North Ward",
      notes: "Fictional only",
    });
    expect(patient.id).not.toBe(createPatient(patientInput).id);
    expect(Number.isFinite(Date.parse(patient.createdAt))).toBe(true);
  });
  it.each(["name", "room", "ward"])("rejects empty %s", (field) => {
    expect(() => createPatient({ ...patientInput, [field]: "  " })).toThrow();
  });
  it("rejects excessive field lengths", () => {
    expect(() =>
      createPatient({ ...patientInput, notes: "x".repeat(1001) }),
    ).toThrow();
  });
  it("editing preserves identity and original creation time", () => {
    const patient = createPatient(patientInput);
    const updated = updatePatient(patient, {
      ...patientInput,
      name: "New fictional name",
    });
    expect(updated).toMatchObject({
      id: patient.id,
      createdAt: patient.createdAt,
      name: "New fictional name",
    });
    expect(patient.name).toBe("Casey Rivers");
  });
});

describe("Factory Method and tasks", () => {
  it.each(["general", "observation"] as const)(
    "selects the %s creator and creates a complete record",
    (category) => {
      const factory = selectTaskFactory(category);
      expect(factory).toBeInstanceOf(
        category === "general" ? GeneralTaskFactory : ObservationTaskFactory,
      );
      const task = factory.createTask(taskInput);
      expect(task).toMatchObject({
        title: "Review checklist",
        description: "Fictional details",
        patientId: "p-101",
        category,
        priority: "normal",
        dueAt: null,
        status: "pending",
        completedAt: null,
      });
    },
  );
  it("rejects unsupported categories at runtime", () => {
    // @ts-expect-error Deliberate untrusted runtime value.
    expect(() => selectTaskFactory("medication")).toThrow("Unsupported");
  });
  it.each(["patientId", "title"])("rejects empty %s", (field) => {
    expect(() => createTask({ ...taskInput, [field]: " " })).toThrow();
  });
  it("validates due dates and descriptions", () => {
    expect(() => createTask({ ...taskInput, dueAt: "invalid" })).toThrow();
    expect(() =>
      createTask({ ...taskInput, description: "x".repeat(2001) }),
    ).toThrow();
  });
  it("converts due dates to ISO without changing the instant", () => {
    expect(
      createTask({ ...taskInput, dueAt: "2026-11-16T14:00:00+02:00" }).dueAt,
    ).toBe("2026-11-16T12:00:00.000Z");
  });
  it("records completion time and clears it when reopened", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T10:00:00Z"));
    const original = createTask(taskInput);
    vi.setSystemTime(new Date("2026-11-16T11:00:00Z"));
    const complete = toggleTaskStatus(original);
    expect(complete).toMatchObject({
      status: "completed",
      completedAt: "2026-11-16T11:00:00.000Z",
    });
    expect(toggleTaskStatus(complete)).toMatchObject({
      status: "pending",
      completedAt: null,
    });
    expect(original.status).toBe("pending");
  });
  it("editing category preserves IDs, creation and completion timestamps", () => {
    const task = toggleTaskStatus(createTask(taskInput));
    const edited = updateTask(task, {
      ...taskInput,
      title: "New title",
      category: "observation",
      priority: "high",
    });
    expect(edited).toMatchObject({
      id: task.id,
      patientId: task.patientId,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      category: "observation",
      title: "New title",
      priority: "high",
    });
    expect(() =>
      updateTask(task, {
        ...taskInput,
        category: "general",
        patientId: "other",
      }),
    ).toThrow();
  });
  it("deletes only the selected task without mutating the source", () => {
    const tasks = [createTask(taskInput), createTask(taskInput)];
    expect(deleteTask(tasks, tasks[0].id)).toEqual([tasks[1]]);
    expect(tasks).toHaveLength(2);
  });
  it("combines search, status, category and patient filters and sorts priorities", () => {
    const low = createTask({ ...taskInput, priority: "low" });
    const high = createTask({ ...taskInput, priority: "high" }, "observation");
    const tasks = [low, high];
    const base = {
      query: "  FICTIONAL  ",
      status: "pending" as const,
      category: "all" as const,
      sort: "priority" as const,
    };
    expect(filterTasks(tasks, base)).toEqual([high, low]);
    expect(filterTasks(tasks, { ...base, category: "observation" })).toEqual([
      high,
    ]);
    expect(filterTasks(tasks, { ...base, patientId: "other" })).toEqual([]);
    expect(filterTasks(tasks, { ...base, status: "completed" })).toEqual([]);
    expect(tasks).toEqual([low, high]);
  });
  it("sorts dated tasks before undated tasks", () => {
    const undated = createTask(taskInput);
    const later = createTask({ ...taskInput, dueAt: "2026-11-18T00:00:00Z" });
    const earlier = createTask({ ...taskInput, dueAt: "2026-11-16T00:00:00Z" });
    expect(
      filterTasks([undated, later, earlier], {
        query: "",
        status: "all",
        category: "all",
        sort: "due",
      }),
    ).toEqual([earlier, later, undated]);
  });
});

describe("observations and application actions", () => {
  it("routes dashboard shortcuts to validated task filters", () => {
    expect(
      parseRoute("#/tasks?status=completed&priority=high&due=today"),
    ).toMatchObject({
      view: "tasks",
      taskFilters: { status: "completed", priority: "high", due: "today" },
    });
    expect(
      parseRoute("#/tasks?status=bad&priority=bad&due=bad").taskFilters,
    ).toEqual({ status: "all", priority: "all", due: "all" });
    expect(parseRoute("#/patients/p-101")).toMatchObject({
      view: "patients",
      patientId: "p-101",
    });
  });
  it("filters due-today and overdue work without including completed records", () => {
    const now = new Date("2026-11-16T12:00:00");
    const due = createTask({
      ...taskInput,
      dueAt: new Date("2026-11-16T10:00:00").toISOString(),
      priority: "high",
    });
    const completed = toggleTaskStatus(
      createTask({ ...taskInput, dueAt: due.dueAt }),
    );
    const filters = {
      query: "",
      status: "all" as const,
      category: "all" as const,
      sort: "priority" as const,
      due: "today" as const,
      priority: "high" as const,
    };
    expect(filterTasks([due, completed], filters, now)).toEqual([due]);
    expect(
      filterTasks([due, completed], { ...filters, due: "overdue" }, now),
    ).toEqual([due]);
    expect(filterTasks([due], { ...filters, priority: "low" }, now)).toEqual(
      [],
    );
  });
  it.each([NaN, Infinity, -1, 61])(
    "rejects invalid temperatures %s",
    (value) => {
      expect(() => createObservation("p-101", "temperature", value)).toThrow();
    },
  );
  it.each([0, 301, 80.5])("rejects invalid heart rates %s", (value) => {
    expect(() => createObservation("p-101", "heartRate", value)).toThrow();
  });
  it("records a measurement and real activity atomically", () => {
    const data = createSeedData();
    const next = applyAction(data, {
      type: "observation.create",
      patientId: "p-101",
      kind: "temperature",
      value: 36.8,
    }).data;
    expect(next.observations[0]).toMatchObject({
      patientId: "p-101",
      kind: "temperature",
      value: 36.8,
    });
    expect(next.activity[0].description).toContain("Observation recorded");
    expect(data.observations).toEqual([]);
    expect(
      applyAction(next, {
        type: "observation.delete",
        id: next.observations[0].id,
      }).data.observations,
    ).toEqual([]);
  });
  it("rejects orphan task and observation creation", () => {
    const data = createSeedData();
    expect(() =>
      applyAction(data, {
        type: "task.create",
        input: { ...taskInput, category: "general", patientId: "missing" },
      }),
    ).toThrow();
    expect(() =>
      applyAction(data, {
        type: "observation.create",
        patientId: "missing",
        kind: "heartRate",
        value: 70,
      }),
    ).toThrow();
  });
  it("patient deletion cascades only that patient's records and keeps a workspace event", () => {
    const initial = createSeedData();
    const data = applyAction(initial, {
      type: "observation.create",
      patientId: "p-101",
      kind: "heartRate",
      value: 70,
    }).data;
    const removed = applyAction(data, {
      type: "patient.delete",
      id: "p-101",
    }).data;
    expect(removed.patients).toHaveLength(2);
    expect(removed.tasks.every((task) => task.patientId !== "p-101")).toBe(
      true,
    );
    expect(removed.tasks).toHaveLength(3);
    expect(removed.observations).toEqual([]);
    expect(removed.activity).toHaveLength(1);
    expect(removed.activity[0]).toMatchObject({ patientId: null });
    expect(removed.activity[0].description).toContain("Patient removed");
    expect(data.patients).toHaveLength(3);
  });
  it("derives dashboard counts from actual tasks and dates", () => {
    const data = createSeedData();
    data.tasks = [
      createTask({ ...taskInput, dueAt: "2026-11-16T08:00:00Z" }),
      toggleTaskStatus(createTask(taskInput)),
      createTask({ ...taskInput, dueAt: "2026-11-15T10:00:00Z" }),
    ];
    expect(getDashboardSummary(data, new Date("2026-11-16T12:00:00Z"))).toEqual(
      { patients: 3, pending: 2, completed: 1, dueToday: 1, overdue: 2 },
    );
  });
});
