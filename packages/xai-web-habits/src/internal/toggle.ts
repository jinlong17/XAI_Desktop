/**
 * @internal — toggle.ts
 * Pure check-toggle reducer.
 *
 * Design: design.md §6
 */

import type { HabitsState, HabitId, DateKey } from "../types.js";
import { computeStreak } from "./computeStreak.js";

/**
 * Toggles the check-in for `(habitId, dateKey)`.
 *
 * Properties:
 * - Pure: no I/O side effects.
 * - Idempotent at the value layer: toggling twice returns the original.
 * - Non-mutating: input `state` is never modified.
 * - Returns `postStreak` (post-toggle streak) for the event emit payload.
 *
 * @param state     Current HabitsState blob.
 * @param habitId   Habit whose check-in to toggle.
 * @param dateKey   local civil day key (YYYY-MM-DD) to toggle.
 */
export function toggleCheckIn(
  state: HabitsState,
  habitId: HabitId,
  dateKey: DateKey,
): { next: HabitsState; postStreak: number } {
  const habitCheckIns = state.checkIns[habitId] ?? {};
  const wasChecked = habitCheckIns[dateKey] === true;

  // Build new per-habit map: either remove the key or add `true`.
  const nextHabitCheckIns: Record<DateKey, true> = { ...habitCheckIns };
  if (wasChecked) {
    delete nextHabitCheckIns[dateKey];
  } else {
    nextHabitCheckIns[dateKey] = true;
  }

  const nextCheckIns: HabitsState["checkIns"] = {
    ...state.checkIns,
    [habitId]: nextHabitCheckIns,
  };

  const next: HabitsState = { ...state, checkIns: nextCheckIns };
  const postStreak = computeStreak(nextHabitCheckIns, new Date());

  return { next, postStreak };
}
