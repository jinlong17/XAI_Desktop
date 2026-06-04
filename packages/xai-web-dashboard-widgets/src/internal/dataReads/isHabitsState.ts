/**
 * @internal — isHabitsState predicate (local copy for dashboard-widgets).
 *
 * Mirrors Statistics' `internal/isHabitsStateRecord.ts` + `EMPTY_HABITS_STATE`.
 *
 * Used by StatStreak to narrow `usePref("xai_habits_state")` into a usable shape.
 *
 * Authority: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #8
 * Discovery: docs/reviews/xai-web-dashboard-real-data/20260528-discovery-review.md §3.3
 */

export interface HabitMinimal {
  id: string;
}

export interface HabitsStateMinimal {
  habits: HabitMinimal[];
  /** Sparse: { [habitId]: { [YYYY-MM-DD UTC]: true } } */
  checkIns: Record<string, Record<string, true>>;
}

export function isHabitsState(v: unknown): v is HabitsStateMinimal {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  if (!Array.isArray(obj.habits)) return false;
  if (typeof obj.checkIns !== "object" || obj.checkIns === null) return false;

  // Validate each habit has at least an `id` string
  for (const h of obj.habits as unknown[]) {
    if (typeof h !== "object" || h === null) return false;
    const habit = h as Record<string, unknown>;
    if (typeof habit.id !== "string" || habit.id.length === 0) return false;
  }

  return true;
}

export const EMPTY_HABITS_STATE: HabitsStateMinimal = {
  habits: [],
  checkIns: {},
};
