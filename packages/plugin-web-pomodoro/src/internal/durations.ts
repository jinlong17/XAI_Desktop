/**
 * Hard-coded Pomodoro session durations.
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §9 (Frozen Assumption D-A)
 * API contract: packages/xai-web-pomodoro/docs/api.md §1.3
 *
 * Settings W4 may replace these with usePref reads in a future row.
 * Until then, these constants are frozen and exported from the public surface.
 */

import type { PomodoroMode } from "../types.js";

export const DEFAULT_DURATIONS_MS: Readonly<Record<PomodoroMode, number>> = Object.freeze({
  focus:          25 * 60 * 1000,  // 25 minutes (canonical Pomodoro)
  "short-break":   5 * 60 * 1000,  //  5 minutes
  "long-break":   15 * 60 * 1000,  // 15 minutes (every 4th focus)
});
