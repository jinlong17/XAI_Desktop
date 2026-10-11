/**
 * Pure session array mutators.
 *
 * All functions return new arrays — never mutate in place.
 * usePref's setter performs stable JSON-equality check before writing to localStorage.
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §4
 * API contract: packages/xai-web-pomodoro/docs/api.md §5.2 + §5.3
 */

import type { PomodoroSession } from "../types.js";

/**
 * Generate a stable-enough session id.
 * Format: "pomo_<8 base-36 chars>".
 * Collision probability is negligible at human-scale session counts.
 */
export function newSessionId(): string {
  return "pomo_" + Math.floor(Math.random() * 36 ** 8).toString(36).padStart(8, "0");
}

/**
 * Append a new session record to the existing sessions array.
 * Returns a new array (pure — does not mutate `prev`).
 */
export function appendSession(
  prev: PomodoroSession[],
  session: PomodoroSession,
): PomodoroSession[] {
  return prev.some(row => row.id === session.id) ? prev : [...prev, session];
}
