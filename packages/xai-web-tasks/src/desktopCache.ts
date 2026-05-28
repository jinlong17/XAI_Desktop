import { isTaskColsArray } from "./internal/validate.js";

export const TASK_CACHE_STORAGE_KEY = "xai_task_cols" as const;

export type DesktopTaskCacheStatus = "absent" | "readable" | "unreadable";

export function isReadableTaskCachePayload(value: unknown): boolean {
  return isTaskColsArray(value);
}

export function readDesktopTaskCacheStatusFromRaw(
  raw: string | null,
): DesktopTaskCacheStatus {
  if (raw === null) {
    return "absent";
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isReadableTaskCachePayload(parsed) ? "readable" : "unreadable";
  } catch {
    return "unreadable";
  }
}

export function readDesktopTaskCacheStatusFromStorage(
  storage: Pick<Storage, "getItem"> | null | undefined = typeof window === "undefined"
    ? null
    : window.localStorage,
): DesktopTaskCacheStatus {
  if (!storage) {
    return "absent";
  }

  try {
    return readDesktopTaskCacheStatusFromRaw(storage.getItem(TASK_CACHE_STORAGE_KEY));
  } catch {
    return "absent";
  }
}
