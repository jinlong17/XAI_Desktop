import { isReadableHabitsCachePayload } from "./internal/validate.js";
import { HABITS_STORAGE_KEY } from "./constants.js";

export type DesktopHabitsCacheStatus = "absent" | "readable" | "unreadable";

export function readDesktopHabitsCacheStatusFromRaw(
  raw: string | null,
): DesktopHabitsCacheStatus {
  if (raw === null) {
    return "absent";
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isReadableHabitsCachePayload(parsed) ? "readable" : "unreadable";
  } catch {
    return "unreadable";
  }
}

export function readDesktopHabitsCacheStatusFromStorage(
  storage: Pick<Storage, "getItem"> | null | undefined = typeof window === "undefined"
    ? null
    : window.localStorage,
): DesktopHabitsCacheStatus {
  if (!storage) {
    return "absent";
  }

  try {
    return readDesktopHabitsCacheStatusFromRaw(storage.getItem(HABITS_STORAGE_KEY));
  } catch {
    return "absent";
  }
}
