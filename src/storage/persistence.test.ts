import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSeedData } from "../data/createSeedData";
import { createTask } from "../logic/createTask";
import { applyAction } from "../logic/applyAction";
import { loadCareFlowData } from "./loadCareFlowData";
import { saveCareFlowData } from "./saveCareFlowData";
import { migrateStoredData } from "./migrateStoredData";
import { isCareFlowData } from "./isCareFlowData";
import {
  STORAGE_KEY,
  LEGACY_STATUS_KEY,
  LEGACY_TASKS_KEY,
} from "./storageKeys";

beforeEach(() => localStorage.clear());

describe("versioned storage", () => {
  it("loads seed records without writing or fabricating activity", () => {
    const result = loadCareFlowData();
    expect(result.data?.patients).toHaveLength(3);
    expect(result.data?.tasks).toHaveLength(5);
    expect(result.data?.activity).toEqual([]);
    expect(localStorage.length).toBe(0);
  });
  it("round trips all entities and actions", () => {
    const seed = createSeedData();
    const next = applyAction(seed, {
      type: "observation.create",
      patientId: "p-101",
      kind: "temperature",
      value: 37,
    }).data;
    const revision = saveCareFlowData(next, null);
    expect(loadCareFlowData()).toMatchObject({ data: next, revision });
    const completed = applyAction(next, {
      type: "task.toggle",
      id: "t-1",
    }).data;
    saveCareFlowData(completed, revision);
    expect(loadCareFlowData().data?.tasks[0].status).toBe("completed");
  });
  it.each([
    "{broken",
    "null",
    '{"version":999}',
    '{"version":2,"revision":"r","data":{}}',
  ])(
    "blocks malformed or unsupported data without overwriting it: %s",
    (raw) => {
      localStorage.setItem(STORAGE_KEY, raw);
      expect(loadCareFlowData().data).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
    },
  );
  it("rejects duplicates and orphaned associations", () => {
    const data = createSeedData();
    expect(
      isCareFlowData({
        ...data,
        patients: [...data.patients, data.patients[0]],
      }),
    ).toBe(false);
    expect(
      isCareFlowData({
        ...data,
        tasks: [{ ...data.tasks[0], patientId: "missing" }],
      }),
    ).toBe(false);
    expect(
      isCareFlowData({
        ...data,
        observations: [
          {
            id: "o",
            patientId: "missing",
            kind: "heartRate",
            value: 70,
            recordedAt: new Date().toISOString(),
          },
        ],
      }),
    ).toBe(false);
    expect(
      isCareFlowData({
        ...data,
        tasks: [{ ...data.tasks[0], status: "completed", completedAt: null }],
      }),
    ).toBe(false);
  });
  it("rejects invalid values, timestamps and referentially invalid activity", () => {
    const data = createSeedData();
    expect(
      isCareFlowData({
        ...data,
        patients: [{ ...data.patients[0], createdAt: "bad" }],
      }),
    ).toBe(false);
    expect(
      isCareFlowData({
        ...data,
        activity: [
          {
            id: "a",
            patientId: "missing",
            description: "event",
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    ).toBe(false);
  });
  it("reports read and write failures", () => {
    const data = createSeedData();
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("Blocked storage");
      },
    });
    expect(loadCareFlowData().data).toBeNull();
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {
        throw new Error("Quota exceeded");
      },
    });
    expect(() => saveCareFlowData(data, null)).toThrow(
      "No changes were applied",
    );
  });
  it("protects newer changes made in another tab", () => {
    const data = createSeedData();
    const first = saveCareFlowData(data, null);
    const second = saveCareFlowData(data, first);
    expect(() => saveCareFlowData(data, first)).toThrow("another tab");
    expect(() => saveCareFlowData(data, null)).toThrow("another tab");
    expect(loadCareFlowData().revision).toBe(second);
  });
  it("does not overwrite a corrupt envelope introduced after initial load", () => {
    const data = createSeedData();
    localStorage.setItem(STORAGE_KEY, "null");
    expect(() => saveCareFlowData(data, null)).toThrow();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("null");
  });
});

describe("legacy migration", () => {
  it("preserves checkbox IDs/status, created tasks and original keys", () => {
    const task = createTask({
      patientId: "p-101",
      title: "Legacy task",
      description: "Original details",
    });
    const raw = JSON.stringify([task]);
    localStorage.setItem(LEGACY_TASKS_KEY, raw);
    localStorage.setItem(LEGACY_STATUS_KEY, JSON.stringify({ "t-1": true }));
    const loaded = loadCareFlowData();
    expect(loaded.data?.tasks).toHaveLength(6);
    expect(loaded.data?.tasks.find((item) => item.id === "t-1")?.status).toBe(
      "completed",
    );
    expect(loaded.data?.tasks.find((item) => item.id === task.id)).toEqual(
      task,
    );
    saveCareFlowData(loaded.data!, null);
    expect(localStorage.getItem(LEGACY_TASKS_KEY)).toBe(raw);
    expect(loadCareFlowData().data?.tasks).toHaveLength(6);
  });
  it("recovers tasks from before category, priority and due date existed", () => {
    const legacy = {
      id: "old-task",
      patientId: "p-102",
      title: "Old task",
      description: "Preserved",
      status: "pending",
      createdAt: "2025-01-01T00:00:00Z",
      completedAt: null,
    };
    const migrated = migrateStoredData(null, JSON.stringify([legacy]));
    expect(migrated.tasks.find((task) => task.id === "old-task")).toEqual({
      ...legacy,
      category: "general",
      priority: "normal",
      dueAt: null,
    });
    expect(migrated.activity[0].description).toContain("import time");
  });
  it.each(['{"t-1":"yes"}', '{"unknown":true}', "[]"])(
    "does not silently discard invalid legacy status %s",
    (raw) => {
      expect(() => migrateStoredData(raw, null)).toThrow();
    },
  );
  it("blocks malformed or partially invalid legacy arrays without writing v2", () => {
    localStorage.setItem(LEGACY_TASKS_KEY, JSON.stringify([{ id: "broken" }]));
    expect(loadCareFlowData().data).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_TASKS_KEY)).toContain("broken");
  });
});
