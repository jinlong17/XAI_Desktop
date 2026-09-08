/**
 * Pure derivation functions for the 4 overview cards + streak.
 *
 * All functions accept `sessions: PomodoroSession[]` + `todayLocal: string` (YYYY-MM-DD)
 * and return numbers/strings — no side effects, no external calls.
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §11 (Frozen Assumption 11)
 * API contract: packages/xai-web-pomodoro/docs/api.md §2.1
 */

import type { PomodoroSession } from "../types.js";
import { localDateKey } from "./formatRecordDate.js";

/** Count of completed focus sessions whose finishedAt falls on `todayLocal`. */
export function countTodaysPomos(sessions: PomodoroSession[], todayLocal: string): number {
  return sessions.filter(
    (s) => s.mode === "focus" && s.completed && localDateKey(new Date(s.finishedAt)) === todayLocal,
  ).length;
}

/** Sum of elapsedMs (in ms) for completed focus sessions finishing today. */
export function sumTodaysFocusMs(sessions: PomodoroSession[], todayLocal: string): number {
  return sessions
    .filter(
      (s) =>
        s.mode === "focus" && s.completed && localDateKey(new Date(s.finishedAt)) === todayLocal,
    )
    .reduce((acc, s) => acc + s.elapsedMs, 0);
}

/** Count of all completed focus sessions (regardless of date). */
export function countTotalPomos(sessions: PomodoroSession[]): number {
  return sessions.filter((s) => s.mode === "focus" && s.completed).length;
}

/** Sum of elapsedMs (in ms) for all completed focus sessions (regardless of date). */
export function sumTotalFocusMs(sessions: PomodoroSession[]): number {
  return sessions
    .filter((s) => s.mode === "focus" && s.completed)
    .reduce((acc, s) => acc + s.elapsedMs, 0);
}

/**
 * Number of consecutive past local days (back from today, or from yesterday if
 * today has no completed focus sessions yet) with ≥1 completed focus session.
 *
 * Algorithm:
 * 1. Collect the set of distinct local date keys with ≥1 completed focus session.
 * 2. Walk backwards from today:
 *    - If today has sessions → start streak from today.
 *    - Else if yesterday has sessions → start streak from yesterday.
 *    - Else → streak = 0.
 * 3. Count consecutive days back from the start point.
 */
export function computeStreak(sessions: PomodoroSession[], todayLocal: string): number {
  const focusDates = new Set(
    sessions
      .filter((s) => s.mode === "focus" && s.completed)
      .map((s) => localDateKey(new Date(s.finishedAt))),
  );

  if (focusDates.size === 0) return 0;

  // Determine start date for streak walk
  const today = new Date(
    parseInt(todayLocal.slice(0, 4), 10),
    parseInt(todayLocal.slice(5, 7), 10) - 1,
    parseInt(todayLocal.slice(8, 10), 10),
  );

  const todayKey = localDateKey(today);
  const yesterdayKey = localDateKey(new Date(today.getTime() - 24 * 60 * 60 * 1000));

  let startDate: Date;
  if (focusDates.has(todayKey)) {
    startDate = today;
  } else if (focusDates.has(yesterdayKey)) {
    startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  } else {
    return 0;
  }

  let streak = 0;
  let cursor = new Date(startDate);
  while (focusDates.has(localDateKey(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }
  return streak;
}
