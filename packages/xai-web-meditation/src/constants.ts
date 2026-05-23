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

import type { MeditationPrefs } from "./types.js";

/** localStorage key. Must match the entry in PREF_REGISTRY. */
export const MEDITATION_STORAGE_KEY = "xai_meditation_prefs" as const;

/** Default preferences blob — applied on cold mount or corrupted blob. */
export const DEFAULT_PREFS: MeditationPrefs = {
  schemaVersion: 1,
  scene: "ocean",
  clock: "split",
  sound: "water",
  duration: 15,
};
