/**
 * Runtime boundary validator for PomodoroSession.
 *
 * Used at the usePref storage boundary to filter corrupt/missing entries.
 * Invalid entries are dropped with a DEV console.warn (silent in prod).
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §3 (Frozen Assumption 3)
 * API contract: packages/xai-web-pomodoro/docs/api.md §5.1
 */

import type { PomodoroSession } from "../types.js";

const VALID_MODES = new Set(["focus", "short-break", "long-break"]);

/**
 * Returns true if `x` is a valid PomodoroSession record.
 * Extra fields are tolerated (forward-compat).
 */
export function isPomodoroSession(x: unknown): x is PomodoroSession {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== "string" || !o.id) return false;
  if (!VALID_MODES.has(o.mode as string)) return false;
  if (typeof o.startedAt !== "string" || !Number.isFinite(Date.parse(o.startedAt))) return false;
  if (typeof o.finishedAt !== "string" || !Number.isFinite(Date.parse(o.finishedAt))) return false;
  if (typeof o.durationMs !== "number" || !Number.isFinite(o.durationMs) || o.durationMs <= 0) return false;
  if (typeof o.elapsedMs !== "number" || !Number.isFinite(o.elapsedMs) || o.elapsedMs < 0 || o.elapsedMs > o.durationMs) return false;
  if (typeof o.completed !== "boolean") return false;
  if (o.recordedAt !== undefined && (typeof o.recordedAt !== "string" || !Number.isFinite(Date.parse(o.recordedAt)))) return false;
  if (o.deadline !== undefined && (typeof o.deadline !== "string" || !Number.isFinite(Date.parse(o.deadline)))) return false;
  return true;
}
