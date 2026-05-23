/**
 * Test fixtures — pomodoro sessions. Construct from generic helpers so
 * tests stay readable.
 */

export const SESSIONS_EMPTY: unknown[] = [];

export function makeFocusSession(finishedAt: string, minutes = 25): unknown {
  return {
    mode: "focus",
    durationMs: minutes * 60 * 1000,
    finishedAt,
  };
}

export function makeBreakSession(finishedAt: string, minutes = 5): unknown {
  return {
    mode: "short-break",
    durationMs: minutes * 60 * 1000,
    finishedAt,
  };
}

export function makeLongBreakSession(finishedAt: string, minutes = 15): unknown {
  return {
    mode: "long-break",
    durationMs: minutes * 60 * 1000,
    finishedAt,
  };
}
