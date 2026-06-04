/**
 * Public constants for @repo/plugin-web-meditation.
 *
 * Frozen contracts (see docs/design.md §1):
 * - MEDITATION_STORAGE_KEY = "xai_meditation_prefs" — the registry key
 *   declared in @repo/plugin-web-storage/internal/registry.ts.
 * - DEFAULT_PREFS — used by validatePrefs as the fallback target.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S8
 */

import type { ClockColorPalette, MeditationPrefs } from "./types.js";

/** localStorage key. Must match the entry in PREF_REGISTRY. */
export const MEDITATION_STORAGE_KEY = "xai_meditation_prefs" as const;

export const DEFAULT_CLOCK_COLORS: ClockColorPalette = {
  digits: "#f8fafc",
  hands: "#e5edf4",
  ring: "#c7d2dd",
  background: "#0f1720",
  highlight: "#9bd8f0",
};

/** Default preferences blob — applied on cold mount or corrupted blob. */
export const DEFAULT_PREFS: MeditationPrefs = {
  schemaVersion: 2,
  scene: "ocean",
  clock: "split",
  sound: "water",
  volume: 0.55,
  duration: 15,
  durationMode: "preset",
  customDuration: 20,
  clockScale: "normal",
  clockColors: DEFAULT_CLOCK_COLORS,
  customScenes: [],
};
