/**
 * @internal — pomoStats selector.
 *
 * Counts today's completed focus pomodoro sessions.
 *
 * Metric for StatPomos:
 *   - `mode === "focus" && completed === true && localDay(finishedAt) === todayLocal`
 *
 * This mirrors the OWNER's `countTodaysPomos` from
 * `plugin-web-pomodoro/src/internal/derivedCounters.ts:15-19`.
 *
 * **Date basis = LOCAL day.** The pomodoro owner uses `localDateKey` (local clock,
 * NOT UTC). Habits use UTC; calendar uses local-clock ISO. DO NOT unify (RD3 guard).
 *
 * **AC-RD-POMO-3**: a session with `completedAt` but no `finishedAt` + `completed`
 * MUST NOT be counted — Cmd-K's stale pattern is explicitly rejected.
 * **AC-RD-POMO-4**: a session finishing at 23:59 local must be counted for that
 * LOCAL day (boundary guard).
 *
 * Authority: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #7 + #9
 */

import { isPomodoroSession } from "./isPomodoroSession.js";

/**
 * Produces "YYYY-MM-DD" in LOCAL time for a given Date.
 * Mirrors `plugin-web-pomodoro/src/internal/formatRecordDate.ts`'s `localDateKey`.
 */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Counts completed focus sessions that finished today (local clock).
 *
 * @param store   Raw value from `usePref("xai_pomodoro_sessions")`.
 * @param now     The current Date (injected for testability — no `Date.now()`).
 * @returns       Count of today's completed focus sessions (≥0).
 */
export function countTodaysFocus(store: unknown, now: Date): number {
  if (!Array.isArray(store)) return 0;

  const todayLocal = localDateKey(now);
  let count = 0;

  for (const item of store) {
    if (!isPomodoroSession(item)) continue;
    if (item.mode !== "focus") continue;
    if (!item.completed) continue;
    const t = Date.parse(item.finishedAt);
    if (!Number.isFinite(t)) continue;
    if (localDateKey(new Date(t)) === todayLocal) count += 1;
  }

  return count;
}
