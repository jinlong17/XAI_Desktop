/**
 * Public type surface for @repo/plugin-web-meditation.
 *
 * Frozen contracts (see docs/design.md §1):
 * - 5 scene ids, 4 clock variants, 5 ambient sound ids, 5 duration values
 *   form exhaustive literal unions.
 * - MeditationPrefs is the persisted JSON blob shape (xai_meditation_prefs).
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 */

import type { Lang } from "@repo/plugin-web-tokens";

/** All scene ids — exhaustive enumeration. */
export type SceneId = "forest" | "ocean" | "night" | "rain" | "void";

/** All clock display variants — exhaustive enumeration. */
export type ClockVariant = "digital" | "split" | "analog" | "minimal";

/** All ambient sound ids — exhaustive enumeration. v1 ships UI only (no audio). */
export type AmbientSoundId = "none" | "water" | "rain" | "waves" | "forest";

/** All session durations in minutes — exhaustive enumeration. */
export type Duration = 5 | 10 | 15 | 25 | 45;

/** A scene descriptor — gradient + accent color (both oklch). */
export interface Scene {
  id: SceneId;
  /** Full CSS `background` value — `linear-gradient(160deg, oklch(...), oklch(...))`. */
  grad: string;
  /** Accent color used for clock + ring + progress + particles. CSS color string. */
  accent: string;
}

/**
 * Persisted user preferences blob — stored under
 * `xai_meditation_prefs` via @repo/plugin-web-storage usePref.
 */
export interface MeditationPrefs {
  schemaVersion: 1;
  scene: SceneId;
  clock: ClockVariant;
  sound: AmbientSoundId;
  duration: Duration;
}

/** Top-level component props for <MeditationModule>. */
export interface MeditationModuleProps {
  /** Active UI language. Drives `useI18n` lookups. */
  lang: Lang;
}
