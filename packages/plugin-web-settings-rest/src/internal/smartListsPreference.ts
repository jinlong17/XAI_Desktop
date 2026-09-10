import type { SmartListId, SmartListVisibility } from "../types.js";

/** A stored Smart Lists map may be empty, sparse, and contain future string keys. */
export type SmartListsMap = Readonly<Record<string, string>>;

export const SMART_LIST_IDS: readonly SmartListId[] = [
  "all", "today", "tomorrow", "next7", "assigned", "inbox", "summary",
  "tags", "filters", "completed", "wont_do", "trash",
] as const;

export const SMART_LIST_VISIBILITIES: readonly SmartListVisibility[] = [
  "show", "if-not-empty", "hide",
] as const;

export function isSmartListVisibility(value: unknown): value is SmartListVisibility {
  return typeof value === "string" && (SMART_LIST_VISIBILITIES as readonly string[]).includes(value);
}

export function isSmartListsMap(value: unknown): value is SmartListsMap {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const map = value as Record<string, unknown>;
  for (const [key, entry] of Object.entries(map)) {
    if (typeof entry !== "string") return false;
    if ((SMART_LIST_IDS as readonly string[]).includes(key) && !isSmartListVisibility(entry)) return false;
  }
  return true;
}

/** Missing built-in entries retain the established UI fallback without seeding storage. */
export function smartListVisibilityFor(map: SmartListsMap, id: SmartListId): SmartListVisibility {
  const entry = Object.hasOwn(map, id) ? map[id] : undefined;
  return isSmartListVisibility(entry) ? entry : "show";
}

/**
 * Copies only own JSON data into a null-prototype map so extension keys such as
 * "__proto__" stay data while a known-row edit preserves every other field.
 */
export function withSmartListVisibility(map: SmartListsMap, id: SmartListId, value: SmartListVisibility): SmartListsMap {
  const next: Record<string, string> = Object.create(null);
  for (const [key, entry] of Object.entries(map)) {
    Object.defineProperty(next, key, { value: entry, enumerable: true, configurable: true, writable: true });
  }
  Object.defineProperty(next, id, { value, enumerable: true, configurable: true, writable: true });
  return next;
}
