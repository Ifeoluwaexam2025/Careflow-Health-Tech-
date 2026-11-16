import {
  STORAGE_KEY,
  LEGACY_STATUS_KEY,
  LEGACY_TASKS_KEY,
} from "../storage/storageKeys";

export function downloadBackup(): void {
  const backup = Object.fromEntries(
    [STORAGE_KEY, LEGACY_STATUS_KEY, LEGACY_TASKS_KEY].map((key) => [
      key,
      localStorage.getItem(key),
    ]),
  );
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "careflow-local-backup.json";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
