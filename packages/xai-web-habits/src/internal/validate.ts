/**
 * @internal — validate.ts
 * Runtime validation helpers for Habit and HabitsState shapes.
 *
 * Design: design.md §5.3
 */

import type { Habit, HabitsState } from "../types.js";

/** Default empty state returned when stored blob is invalid. */
const DEFAULT_HABITS_STATE: HabitsState = {
  schemaVersion: 1,
  habits: [],
  checkIns: {},
  diaries: {},
};

/**
 * Runtime type guard for a single Habit object.
 *
 * Checks:
 * - id: string
 * - emoji: string
 * - title: { en: string; zh: string }
 * - createdAt: string
 */
export function isHabit(x: unknown): x is Habit {
  if (x === null || typeof x !== "object") return false;
  const h = x as Record<string, unknown>;
  if (typeof h["id"] !== "string") return false;
  if (typeof h["emoji"] !== "string") return false;
  if (typeof h["createdAt"] !== "string") return false;
  const title = h["title"];
  if (title === null || typeof title !== "object") return false;
  const t = title as Record<string, unknown>;
  if (typeof t["en"] !== "string") return false;
  if (typeof t["zh"] !== "string") return false;
  return true;
}

/**
 * Validates a raw storage blob and returns a typed HabitsState.
 * Falls back to the default empty state when the blob is invalid.
 *
 * Design: design.md §10 (error semantics)
 */
export function validateHabitsState(raw: unknown): HabitsState {
  if (raw === null || typeof raw !== "object") return DEFAULT_HABITS_STATE;
  const r = raw as Record<string, unknown>;

  // schemaVersion must be exactly 1
  if (r["schemaVersion"] !== 1) return DEFAULT_HABITS_STATE;

  // habits must be an array
  if (!Array.isArray(r["habits"])) return DEFAULT_HABITS_STATE;

  // checkIns must be a non-array object (or absent)
  const checkIns = r["checkIns"];
  if (checkIns !== undefined && checkIns !== null) {
    if (typeof checkIns !== "object" || Array.isArray(checkIns)) return DEFAULT_HABITS_STATE;
  }

  // diaries must be a non-array object (or absent)
  const diaries = r["diaries"];
  if (diaries !== undefined && diaries !== null) {
    if (typeof diaries !== "object" || Array.isArray(diaries)) return DEFAULT_HABITS_STATE;
  }

  // All checks pass — cast
  return raw as HabitsState;
}
