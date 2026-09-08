/**
 * useFeaturePrefs — reads all 8 `xai_pref_features_*` booleans and returns a
 * snapshot as `FeaturePrefs` (Record<FeatureId, boolean>).
 *
 * Reactivity: each underlying usePref subscribes to same-tab + cross-tab
 * storage events, so the returned object updates when any of the 8 toggles
 * flips. Memoized so the returned reference only changes when one of the
 * 8 underlying values changes.
 *
 * API contract: packages/xai-web-settings-features-panel/docs/api.md §1 + §5
 */

import { useMemo } from "react";
import { usePref } from "@repo/plugin-web-storage";
import type { FeaturePrefs } from "./types.js";

export function useFeaturePrefs(): FeaturePrefs {
  const [tasks]      = usePref("xai_pref_features_tasks");
  const [board]      = usePref("xai_pref_features_board");
  const [dashboard]  = usePref("xai_pref_features_dashboard");
  const [calendar]   = usePref("xai_pref_features_calendar");
  const [matrix]     = usePref("xai_pref_features_matrix");
  const [pomodoro]   = usePref("xai_pref_features_pomodoro");
  const [habits]     = usePref("xai_pref_features_habits");
  const [meditation] = usePref("xai_pref_features_meditation");

  return useMemo<FeaturePrefs>(
    () => ({ tasks, board, dashboard, calendar, matrix, pomodoro, habits, meditation }),
    [tasks, board, dashboard, calendar, matrix, pomodoro, habits, meditation],
  );
}
