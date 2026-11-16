import type { CareFlowData } from "../types/CareFlowData";
import { isCareFlowData } from "./isCareFlowData";
import { isRecord } from "./isRecord";
import { migrateStoredData } from "./migrateStoredData";
import {
  STORAGE_KEY,
  LEGACY_STATUS_KEY,
  LEGACY_TASKS_KEY,
  SCHEMA_VERSION,
} from "./storageKeys";

export type LoadedData = {
  data: CareFlowData | null;
  revision: string | null;
  message: string;
};

export function loadCareFlowData(): LoadedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const stored: unknown = JSON.parse(raw);
      if (
        !isRecord(stored) ||
        stored.version !== SCHEMA_VERSION ||
        typeof stored.revision !== "string" ||
        !stored.revision ||
        !isCareFlowData(stored.data)
      ) {
        throw new Error("Stored data has an unsupported or invalid format.");
      }
      return {
        data: stored.data,
        revision: stored.revision,
        message: "Restored from this device",
      };
    }
    const status = localStorage.getItem(LEGACY_STATUS_KEY);
    const tasks = localStorage.getItem(LEGACY_TASKS_KEY);
    return {
      data: migrateStoredData(status, tasks),
      revision: null,
      message:
        status !== null || tasks !== null
          ? "Legacy data recovered. Your next change saves the new format; originals are retained."
          : "Demo ready. Changes save on this device.",
    };
  } catch (error) {
    return {
      data: null,
      revision: null,
      message:
        error instanceof Error ? error.message : "Could not read local data.",
    };
  }
}
