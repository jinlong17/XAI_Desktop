/**
 * @internal — readModuleStates.ts
 *
 * Reads the current state of all 12 searchable modules from localStorage
 * via the SHIPPED getPref / getPrefAutosave API. Returns a frozen Record
 * mapping each WebModuleId to its state (unknown-typed; each adapter is
 * responsible for runtime shape validation).
 *
 * Called ONCE at palette open time. Module updates while the palette is open
 * are intentionally NOT reflected (acceptable v1 tradeoff — user closes &
 * reopens to refresh).
 *
 * HC2: No new storage keys are introduced. All keys come from PREF_REGISTRY.
 *
 * api.md §5
 */

import { getPref } from "@repo/plugin-web-storage";
import { paneRegistry } from "@repo/plugin-web-settings-shell";
import type { WebModuleId } from "@repo/core/types";

/**
 * Returns a frozen Record<WebModuleId, unknown> of each module's current state.
 * Keys with no localStorage entry resolve to the registry default per getPref contract.
 */
export function readModuleStates(): Readonly<Record<WebModuleId, unknown>> {
  // Board: tuple of [boards, active, panels, inbox] — deterministic order (O4)
  const boardState = {
    boards: getPref("xai_boards_v2"),
    active: getPref("xai_active_board"),
    panels: getPref("xai_board_panels"),
    inbox: getPref("xai_board_inbox"),
  };

  // Dashboard: combined state for widget + clock + tz + zones
  const dashState = {
    dashOrder: getPref("xai_dash_order"),
    clockStyle: getPref("xai_clock_style"),
    clockTz: getPref("xai_clock_tz"),
    zones: getPref("xai_zones"),
  };

  // Settings: paneRegistry is a typed const array — no localStorage read
  const settingsState = paneRegistry;

  return Object.freeze({
    tasks: getPref("xai_task_cols"),
    board: boardState,
    dashboard: dashState,
    calendar: {},
    matrix: getPref("xai_matrix_state"),
    pomodoro: getPref("xai_pomodoro_sessions"),
    habits: getPref("xai_habits_state"),
    meditation: getPref("xai_meditation_prefs"),
    countdown: getPref("xai_countdowns"),
    statistics: {},
    timetrack: {},
    metrics: {},
    settings: settingsState,
    // These WebModuleIds exist but have no adapter in v1:
    ai: {},
    search: {},
  } satisfies Record<WebModuleId, unknown>);
}
