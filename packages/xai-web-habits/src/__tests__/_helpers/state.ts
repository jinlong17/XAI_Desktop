/**
 * State builder helpers for HabitsModule tests.
 */
import type { Habit, HabitId, DateKey, MonthKey, HabitsState } from "../../types.js";

export const makeHabit = (overrides: Partial<Habit> = {}): Habit => ({
  id: "h_test",
  emoji: "🌱",
  title: { en: "Test habit", zh: "测试习惯" },
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

export const makeState = (
  habits: Habit[],
  checkIns: Record<HabitId, Record<DateKey, true>> = {},
  diaries: Record<HabitId, Record<MonthKey, string>> = {},
): HabitsState => ({ schemaVersion: 1, habits, checkIns, diaries });
