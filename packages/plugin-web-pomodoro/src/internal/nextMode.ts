/**
 * Pure function: compute the next Pomodoro mode after a session completes.
 *
 * Mode cycle: focus → short-break × 3 → focus → short-break × 3 → focus → long-break …
 * Every 4th completed focus session triggers a long-break (not a short-break).
 * End-early sessions do NOT advance `focusCountInSession` (caller's responsibility).
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §5 (mode cycle)
 * API contract: packages/xai-web-pomodoro/docs/api.md §6.4
 *
 * @param prev                - The mode that just finished.
 * @param focusCountInSession - Total number of completed focus sessions (AFTER recording the
 *                              just-finished one, if it was a completed focus).
 * @returns The mode that should run next.
 */
import type { PomodoroMode } from "../types.js";

export function nextMode(prev: PomodoroMode, focusCountInSession: number): PomodoroMode {
  if (prev !== "focus") return "focus";
  if (focusCountInSession % 4 === 0) return "long-break";
  return "short-break";
}
