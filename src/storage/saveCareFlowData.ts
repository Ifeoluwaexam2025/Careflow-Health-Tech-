import type { CareFlowData } from "../types/CareFlowData";
import { isCareFlowData } from "./isCareFlowData";
import { isRecord } from "./isRecord";
import { SCHEMA_VERSION, STORAGE_KEY } from "./storageKeys";

export function saveCareFlowData(
  data: CareFlowData,
  expectedRevision: string | null,
): string {
  if (!isCareFlowData(data)) throw new Error("Invalid data was not saved.");
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const current: unknown = raw === null ? null : JSON.parse(raw);
    if (
      (raw !== null &&
        (!isRecord(current) ||
          current.version !== SCHEMA_VERSION ||
          !isCareFlowData(current.data) ||
          current.revision !== expectedRevision)) ||
      (current === null && expectedRevision !== null)
    ) {
      throw new Error(
        "Data changed in another tab. Reload before making changes.",
      );
    }
    const revision = crypto.randomUUID();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, revision, data }),
    );
    return revision;
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message.includes("another tab")
        ? error.message
        : "Could not save on this device. No changes were applied. Check browser storage availability.",
      { cause: error },
    );
  }
}
