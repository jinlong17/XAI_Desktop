/**
 * Public types for @repo/plugin-web-pomodoro.
 *
 * API contract: packages/xai-web-pomodoro/docs/api.md §1
 * Design: packages/xai-web-pomodoro/docs/design.md §3
 */

/** The three modes of a Pomodoro session. */
export type PomodoroMode = "focus" | "short-break" | "long-break";

/** Optional host capability for protecting submitted preference drafts. */
export interface PomodoroDepartureGuard {
  readonly token: object;
  readonly label?: string;
  readonly isBlocking: () => boolean;
  readonly isCurrent: () => boolean;
  readonly exportDraft: () => void;
  readonly discardDraft: () => void;
}

export type PomodoroDepartureGuardRegistration = (
  guard: PomodoroDepartureGuard,
) => () => void;

/**
 * A completed or partial Pomodoro session record.
 *
 * Stored as `PomodoroSession[]` in localStorage under key
 * `xai_pomodoro_sessions` (via `usePref`).
 *
 * Storage schema version: 1 (declared in plugin-web-storage registry.ts line 302–310).
 */
export interface PomodoroSession {
  /** Present for durable v2 settlements; absent on legacy rows. */
  schemaVersion?: 2;
  deadline?: string;
  recordedAt?: string;
  /** Stable id. Generated via `pomo_<base36(rand)>` at session start. */
  id: string;
  /** Mode of the session. */
  mode: PomodoroMode;
  /** ISO 8601 instant — when the user pressed Start. */
  startedAt: string;
  /** ISO 8601 instant — when the session ended (ran to zero or End was pressed). */
  finishedAt: string;
  /**
   * Configured duration in ms (e.g. 25*60_000 for focus).
   * Pulled from `DEFAULT_DURATIONS_MS[mode]` at session start.
   */
  durationMs: number;
  /**
   * Actual elapsed timer time across one or more run-pause-resume cycles.
   * For a session that ran to zero: elapsedMs === durationMs.
   * For a session ended early: elapsedMs ∈ [0, durationMs).
   * Pauses are NOT counted in elapsedMs.
   */
  elapsedMs: number;
  /**
   * true → ran to zero (countdown reached 0).
   * false → user pressed End before reaching zero.
   */
  completed: boolean;
}
