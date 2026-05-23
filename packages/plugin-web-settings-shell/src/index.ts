/**
 * @repo/plugin-web-settings-shell — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/.
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §0
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4 (port map "module-settings.jsx")
 *
 * P1 surface (this commit): types + paneRegistry + resetAllPrefs only.
 * Components + registration land in P2 / P3 of the build plan.
 */

// ---- Public utilities (P1 phase) -------------------------------------------
export { resetAllPrefs } from "./internal/resetAllPrefs.js";
export { paneRegistry }  from "./internal/paneRegistry.js";

// ---- Public types ----------------------------------------------------------
export type {
  SettingsPaneId,
  Pane,
  PaneRenderProps,
  SettingsModuleProps,
  ToggleProps,
  SettingRowProps,
  SectionBlockProps,
  SettingsFooterProps,
} from "./types.js";
