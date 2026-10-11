/**
 * @internal — isPomodoroSession predicate.
 *
 * Narrows an `unknown` (the registry boundary type for `xai_pomodoro_sessions`)
 * into a usable PomodoroSession-shaped record. Statistics only reads three
 * fields, so the predicate is intentionally narrower than `plugin-web-pomodoro`'s
 * full record interface.
 *
 * Non-conforming entries are silently dropped at the aggregation layer.
 *
 * api.md §2 boundary widening predicates.
 */

export interface PomodoroSessionRecord {
  mode: "focus" | "short-break" | "long-break";
  durationMs: number;
  /** Optional only for legacy records; missing/invalid values are unmeasured. */
  elapsedMs?: number;
  /** ISO 8601 instant when the session ended. */
  finishedAt: string;
}

export function isPomodoroSession(v: unknown): v is PomodoroSessionRecord {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  const modeOk =
    obj.mode === "focus" || obj.mode === "short-break" || obj.mode === "long-break";
  return (
    modeOk &&
    typeof obj.durationMs === "number" &&
    Number.isFinite(obj.durationMs) &&
    typeof obj.finishedAt === "string" &&
    obj.finishedAt.length > 0
  );
}
