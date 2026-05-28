import { isBoardArray } from "@repo/plugin-web-board-core";

export const BOARD_CACHE_STORAGE_KEY = "xai_boards_v2" as const;

export type DesktopBoardCacheStatus = "absent" | "readable" | "unreadable";

export function isReadableBoardCachePayload(value: unknown): boolean {
  return isBoardArray(value);
}

export function readDesktopBoardCacheStatusFromRaw(
  raw: string | null,
): DesktopBoardCacheStatus {
  if (raw === null) {
    return "absent";
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isReadableBoardCachePayload(parsed) ? "readable" : "unreadable";
  } catch {
    return "unreadable";
  }
}

export function readDesktopBoardCacheStatusFromStorage(
  storage: Pick<Storage, "getItem"> | null | undefined = typeof window === "undefined"
    ? null
    : window.localStorage,
): DesktopBoardCacheStatus {
  if (!storage) {
    return "absent";
  }

  try {
    return readDesktopBoardCacheStatusFromRaw(storage.getItem(BOARD_CACHE_STORAGE_KEY));
  } catch {
    return "absent";
  }
}
