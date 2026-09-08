/**
 * @internal — isPomodoroSession predicate (local copy for dashboard-widgets).
 *
 * Mirrors Statistics' `internal/isPomodoroSession.ts` but ALSO checks the
 * `completed: boolean` field because the StatPomos metric requires it.
 *
 * **Field = `finishedAt` (NOT `completedAt`).** The canonical
 * `PomodoroSession` type in `plugin-web-pomodoro/src/types.ts` has
 * `finishedAt: string` + `completed: boolean`. There is NO `completedAt`
 * field. Cmd-K's pomodoro adapter reads `session.completedAt` — that is
 * STALE/WRONG and always yields an empty date string. DO NOT copy it.
 * (RD1 guard; AC-RD-POMO-3 enforces.)
 *
 * Non-conforming entries are silently skipped (defensive — RD12).
 *
 * Authority: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #7
 * Discovery: docs/reviews/xai-web-dashboard-real-data/20260528-discovery-review.md §3.2
 */

export interface PomodoroSessionMinimal {
  mode: "focus" | "short-break" | "long-break";
  /** ISO 8601 instant when the session ended — USE THIS, not `completedAt`. */
  finishedAt: string;
  /** True when the session ran to completion (as opposed to being abandoned). */
  completed: boolean;
}

/**
 * Narrows an `unknown` value into a `PomodoroSessionMinimal`.
 * Uses ONLY the three fields required for StatPomos:
 *   `mode`, `finishedAt`, `completed`.
 */
export function isPomodoroSession(v: unknown): v is PomodoroSessionMinimal {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;

  const modeOk =
    obj.mode === "focus" ||
    obj.mode === "short-break" ||
    obj.mode === "long-break";

  return (
    modeOk &&
    typeof obj.finishedAt === "string" &&
    obj.finishedAt.length > 0 &&
    typeof obj.completed === "boolean"
    // NOTE: completedAt is NOT checked — it does not exist on the canonical type.
  );
}
