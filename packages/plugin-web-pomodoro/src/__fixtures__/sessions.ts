/**
 * Test fixtures for PomodoroSession.
 *
 * TEST_NOW: 2026-05-23T06:30:00.000Z — matches vitest.setup.ts stable "now"
 * (2026-05-23 14:30 local CST; the UTC representation depends on TZ but
 *  vitest.setup.ts sets the system time; tests use localDateKey which reads
 *  the Date's local components so the fixture dates are expressed as local
 *  2026-05-23 14:30:00 which is 2026-05-23T06:30:00.000Z UTC at +08:00
 *  but for CI portability we use the ISO string with local intent).
 *
 * Test strategy: packages/xai-web-pomodoro/docs/test.md §4
 */

import type { PomodoroSession } from "../types.js";

// Use local-timezone ISO strings so fixture dates stay consistent regardless of CI TZ.
// The vitest.setup.ts sets Date.now() to 2026-05-23 14:30 (local), so "today" in
// all tests is 2026-05-23 in the local timezone.

export const FIXTURE_FOCUS_TODAY: PomodoroSession = {
  id: "pomo_test01",
  mode: "focus",
  startedAt: "2026-05-23T14:05:00.000Z",
  finishedAt: "2026-05-23T14:30:00.000Z",
  durationMs: 25 * 60 * 1000,
  elapsedMs: 25 * 60 * 1000,
  completed: true,
};

export const FIXTURE_FOCUS_TODAY_PARTIAL: PomodoroSession = {
  id: "pomo_test02",
  mode: "focus",
  startedAt: "2026-05-23T13:00:00.000Z",
  finishedAt: "2026-05-23T13:12:34.000Z",
  durationMs: 25 * 60 * 1000,
  elapsedMs: 12 * 60_000 + 34_000,
  completed: false,
};

export const FIXTURE_FOCUS_YESTERDAY: PomodoroSession = {
  id: "pomo_test03",
  mode: "focus",
  startedAt: "2026-05-22T14:35:00.000Z",
  finishedAt: "2026-05-22T15:00:00.000Z",
  durationMs: 25 * 60 * 1000,
  elapsedMs: 25 * 60 * 1000,
  completed: true,
};

export const FIXTURE_SHORT_BREAK_TODAY: PomodoroSession = {
  id: "pomo_test04",
  mode: "short-break",
  startedAt: "2026-05-23T14:30:00.000Z",
  finishedAt: "2026-05-23T14:35:00.000Z",
  durationMs: 5 * 60 * 1000,
  elapsedMs: 5 * 60 * 1000,
  completed: true,
};

export const FIXTURE_INVALID: unknown = {
  id: "pomo_bad",
  mode: "focus",
  startedAt: "2026-05-23T14:00:00.000Z",
  // missing finishedAt — should fail predicate
  durationMs: 25 * 60 * 1000,
  elapsedMs: 25 * 60 * 1000,
  completed: true,
};
