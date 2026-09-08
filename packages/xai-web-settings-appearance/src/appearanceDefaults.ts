/**
 * Frozen defaults for the 6 appearance dims that per-pane Reset reverts.
 * lang is intentionally excluded — per-pane Reset does NOT touch language.
 *
 * Parity with chassis defaults.ts is enforced by the unit test
 * AC-DEF-1..AC-DEF-9 (test.md §A1) via the public resetAllPrefs() emit snapshot.
 *
 * API contract: packages/xai-web-settings-appearance/docs/api.md §2
 */

import type { AppearanceDefaults } from "./types.js";

export const appearanceDefaults: AppearanceDefaults = Object.freeze({
  theme:      "light",
  density:    "comfortable",
  fontScale:  1,
  accentHue:  165,
  railPos:    "left",
  bgTone:     "default",
} satisfies AppearanceDefaults);
