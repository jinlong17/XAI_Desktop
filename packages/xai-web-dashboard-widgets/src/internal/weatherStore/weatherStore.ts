/**
 * @internal — Pure SINGLETON Weather store helpers.
 *
 * All functions are PURE: they never call usePref or access localStorage.
 * The React hook wrapper (useWeather) commits via setPref.
 *
 * SINGLETON (not a record): Weather stores ONE UserWeather | null value.
 * Contrast §E stickiesStore (Record<id, UserSticky>).
 *
 * Invariants:
 *   - getWeather: defensive narrow — null/malformed → null; never throws (RG3).
 *   - setWeather: trims city; stamps updatedAt as ISO 8601 now. Always succeeds.
 *   - clearWeather: returns null (the "unset" state).
 *   - Singleton: a second setWeather call OVERWRITES (no accumulation — RW1).
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §G
 * API:    packages/xai-web-dashboard-widgets/docs/api.md §G.3.2
 */

import type { UserWeather, NewWeatherDraft, WeatherCondition } from "./types.js";

const VALID_CONDITIONS: ReadonlySet<string> = new Set<WeatherCondition>([
  "sunny",
  "cloudy",
  "rainy",
]);

/** Defensive narrow: checks that v looks like a valid UserWeather object. */
function isValidUserWeather(v: unknown): v is UserWeather {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const obj = v as Record<string, unknown>;
  if (typeof obj.city !== "string" || obj.city.length === 0) return false;
  if (typeof obj.temp !== "number") return false;
  if (typeof obj.condition !== "string" || !VALID_CONDITIONS.has(obj.condition)) return false;
  if (typeof obj.updatedAt !== "string") return false;
  // hi/lo are optional; if present they must be numbers
  if (obj.hi !== undefined && typeof obj.hi !== "number") return false;
  if (obj.lo !== undefined && typeof obj.lo !== "number") return false;
  return true;
}

/**
 * Narrow `store` (the registry default `unknown`/`null`) to `UserWeather | null`.
 *
 * Returns `null` for null / malformed / missing values (RG3 — never throws).
 */
export function getWeather(store: unknown): UserWeather | null {
  if (store === null || store === undefined) return null;
  if (!isValidUserWeather(store)) return null;
  return store;
}

/**
 * Produce a new singleton snapshot from the draft.
 *
 * Trims city; carries temp/condition/hi?/lo?; stamps updatedAt = now ISO.
 * Field validation is the editor's job — this always succeeds.
 * Returns a new object (the 2nd call overwrites the 1st — RW1).
 */
export function setWeather(draft: NewWeatherDraft): UserWeather {
  const result: UserWeather = {
    city: draft.city.trim(),
    temp: draft.temp,
    condition: draft.condition,
    updatedAt: new Date().toISOString(),
  };
  if (draft.hi !== undefined) result.hi = draft.hi;
  if (draft.lo !== undefined) result.lo = draft.lo;
  return result;
}

/**
 * The "unset" state — returns null (for persisting via the usePref setter).
 */
export function clearWeather(): null {
  return null;
}
