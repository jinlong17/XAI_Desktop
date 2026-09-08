/**
 * Public type surface for @repo/plugin-web-meditation.
 *
 * MeditationPrefs is the persisted JSON blob shape (xai_meditation_prefs).
 * Schema v3 keeps the original v1/v2 fields and adds custom fixed durations
 * plus richer clock styling choices.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 */

import type { Lang } from "@repo/plugin-web-tokens";

/** Built-in scene ids. */
export type BaseSceneId = "forest" | "ocean" | "night" | "rain" | "void";

/** User-created scene ids are namespaced so they never collide with built-ins. */
export type CustomSceneId = `custom:${string}`;

/** All selectable scene ids. */
export type SceneId = BaseSceneId | CustomSceneId;

/** All clock display variants — exhaustive enumeration. */
export type ClockVariant =
  | "digital"
  | "digitalSoft"
  | "digitalFocus"
  | "split"
  | "splitStack"
  | "analog"
  | "analogFine"
  | "analogBold"
  | "analogZen"
  | "minimal"
  | "minimalDots"
  | "breathRing";

/** Clock sizing presets used by both picker previews and the player. */
export type ClockScale = "compact" | "normal" | "large" | "larger";

/** Color slots exposed in the clock-style settings UI. */
export interface ClockColorPalette {
  digits: string;
  hands: string;
  ring: string;
  background: string;
  highlight: string;
}

/** Ambient sound ids. Non-none sounds are synthesized with Web Audio. */
export type AmbientSoundId =
  | "none"
  | "water"
  | "rain"
  | "waves"
  | "thunder"
  | "forest"
  | "whiteNoise";

/** Built-in fixed session durations in minutes. */
export type PresetDuration = 5 | 10 | 15 | 25 | 45;

/** Session duration in minutes. User-defined fixed durations are stored here too. */
export type Duration = number;

/** Duration selector mode. */
export type DurationMode = "preset" | "custom" | "infinite";

/** Scene animation presets. */
export type SceneAnimation = "particles" | "rain" | "waves" | "aurora" | "still";

/** A scene descriptor — gradient + accent color. */
export interface Scene {
  id: SceneId;
  name?: string;
  /** Full CSS `background` value. */
  grad: string;
  /** Accent color used for clock + ring + progress + particles. CSS color string. */
  accent: string;
  animation: SceneAnimation;
  defaultSound?: AmbientSoundId;
  defaultClock?: ClockVariant;
  defaultClockScale?: ClockScale;
  defaultClockColors?: ClockColorPalette;
  defaultDurationMode?: DurationMode;
  defaultDuration?: Duration;
  defaultCustomDuration?: number;
}

/** Persisted user-created scene. */
export interface CustomScene {
  id: CustomSceneId;
  name: string;
  background: string;
  gradientFrom: string;
  gradientTo: string;
  animation: SceneAnimation;
  sound: AmbientSoundId;
  clock: ClockVariant;
  clockScale: ClockScale;
  clockColors: ClockColorPalette;
  durationMode: DurationMode;
  duration: Duration;
  customDuration: number;
}

/**
 * Persisted user preferences blob — stored under
 * `xai_meditation_prefs` via @repo/plugin-web-storage usePref.
 */
export interface MeditationPrefs {
  schemaVersion: 3;
  scene: SceneId;
  clock: ClockVariant;
  sound: AmbientSoundId;
  volume: number;
  duration: Duration;
  customFixedDurations: Duration[];
  durationMode: DurationMode;
  customDuration: number;
  clockScale: ClockScale;
  clockColors: ClockColorPalette;
  customScenes: CustomScene[];
}

/** Top-level component props for <MeditationModule>. */
export interface MeditationModuleProps {
  /** Active UI language. Drives `useI18n` lookups. */
  lang: Lang;
}
