/**
 * @repo/plugin-web-settings-shell — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/.
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §0
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4 (port map "module-settings.jsx")
 *
 * P2 surface (this commit): types + paneRegistry + resetAllPrefs +
 * SettingsModule + atomic components (Toggle/SettingRow/SectionBlock/SettingsFooter).
 * Slot registration (settingsShellWebModuleRegistration) lands in P3.
 */

// Side-effect CSS — applied once globally when this package is first imported.
import "./styles.css";

// ---- Components ------------------------------------------------------------
export { SettingsModule } from "./SettingsModule.js";
export { Toggle }         from "./Toggle.js";
export { SettingRow }     from "./SettingRow.js";
export { SectionBlock }   from "./SectionBlock.js";
export { SettingsFooter } from "./SettingsFooter.js";

// ---- Slot registration (consumed by apps/web shellRegistrations.tsx) -------
export { settingsShellWebModuleRegistration } from "./registration.js";

// ---- Public utilities ------------------------------------------------------
export { resetAllPrefs } from "./internal/resetAllPrefs.js";
export { paneRegistry }  from "./internal/paneRegistry.js";

// ---- Public types ----------------------------------------------------------
export type {
  SettingsPaneId,
  Pane,
  PaneRenderProps,
  PaneDepartureGuard,
  PaneDepartureGuardRegistration,
  SettingsModuleProps,
  ToggleProps,
  SettingRowProps,
  SectionBlockProps,
  SettingsFooterProps,
} from "./types.js";
