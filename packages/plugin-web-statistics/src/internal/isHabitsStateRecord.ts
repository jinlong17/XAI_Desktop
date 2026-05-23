/**
 * @internal — isHabitsStateRecord predicate.
 *
 * Narrows an `unknown` (registry storage type `HabitsStateBlob = unknown`)
 * into the canonical habits state shape.
 *
 * api.md §2 boundary widening predicates.
 */

import { isHabit, type HabitRecord } from "./isHabit.js";

export interface HabitsStateRecord {
  habits: HabitRecord[];
  /** Sparse: only checked (habit, day) pairs appear. */
  checkIns: Record<string, Record<string, boolean>>;
  diaries: Record<string, unknown>;
}

export function isHabitsStateRecord(v: unknown): v is HabitsStateRecord {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  if (!Array.isArray(obj.habits)) return false;
  if (typeof obj.checkIns !== "object" || obj.checkIns === null) return false;
  if (typeof obj.diaries !== "object" || obj.diaries === null) return false;
  // All habits must pass the per-habit predicate; non-conforming = false.
  for (const h of obj.habits) {
    if (!isHabit(h)) return false;
  }
  return true;
}

/**
 * Empty / default state used when the persisted value is unrecognized
 * or missing.
 */
export const EMPTY_HABITS_STATE: HabitsStateRecord = {
  habits: [],
  checkIns: {},
  diaries: {},
};
