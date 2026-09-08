/**
 * @repo/plugin-web-settings-appearance — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/.
 *
 * Roadmap row #22 · W4b — Settings → Appearance pane (7-dim live-bound + bilingual).
 * API contract: packages/xai-web-settings-appearance/docs/api.md
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 */

// Side-effect CSS — applied once globally when this package is first imported.
import "./styles.css";

// ---- Types -----------------------------------------------------------------
export type {
  AppearancePaneProps,
  BgToneOption,
  HuePreset,
  RailPosOption,
  AppearanceDefaults,
  Lang,
  Theme,
  Density,
  BgTone,
  RailPos,
} from "./types.js";

// ---- Constants -------------------------------------------------------------
export { BG_TONES, HUE_PRESETS, RAIL_POSITIONS } from "./constants.js";
export { appearanceDefaults } from "./appearanceDefaults.js";

// ---- Components ------------------------------------------------------------
export { AppearancePane } from "./AppearancePane.js";

// ---- Registry entry --------------------------------------------------------
export { appearancePane } from "./internal/appearancePane.js";
