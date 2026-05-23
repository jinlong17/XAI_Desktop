/**
 * @internal — validate.ts
 *
 * Clamps a raw localStorage blob to the typed MeditationPrefs shape.
 * Unknown / corrupted fields fall back to DEFAULT_PREFS[field] without
 * throwing. Tested by AC-PERSIST-4..6 (docs/test.md §2.4).
 */

import type {
  AmbientSoundId,
  ClockVariant,
  Duration,
  MeditationPrefs,
  SceneId,
} from "../types.js";
import { DEFAULT_PREFS } from "../constants.js";

const SCENE_IDS: readonly SceneId[] = ["forest", "ocean", "night", "rain", "void"];
const CLOCK_VARIANTS: readonly ClockVariant[] = ["digital", "split", "analog", "minimal"];
const SOUND_IDS: readonly AmbientSoundId[] = ["none", "water", "rain", "waves", "forest"];
const DURATIONS: readonly Duration[] = [5, 10, 15, 25, 45];

function pick<T>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * Validate a raw value (from localStorage / usePref) and return a typed
 * MeditationPrefs. Unknown fields are clamped to defaults. Returns a
 * fresh object — never mutates `raw`.
 */
export function validatePrefs(raw: unknown): MeditationPrefs {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PREFS };
  }
  const r = raw as Partial<MeditationPrefs>;
  return {
    schemaVersion: 1,
    scene: pick(r.scene, SCENE_IDS, DEFAULT_PREFS.scene),
    clock: pick(r.clock, CLOCK_VARIANTS, DEFAULT_PREFS.clock),
    sound: pick(r.sound, SOUND_IDS, DEFAULT_PREFS.sound),
    duration: pick(r.duration, DURATIONS, DEFAULT_PREFS.duration),
  };
}
