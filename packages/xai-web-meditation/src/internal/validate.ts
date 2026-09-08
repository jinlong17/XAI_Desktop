/**
 * @internal — validate.ts
 *
 * Clamps a raw localStorage blob to the typed MeditationPrefs shape.
 * Unknown / corrupted fields fall back to DEFAULT_PREFS[field] without
 * throwing. Tested by AC-PERSIST-4..6 (docs/test.md §2.4).
 */

import type {
  AmbientSoundId,
  ClockColorPalette,
  ClockScale,
  ClockVariant,
  CustomScene,
  DurationMode,
  MeditationPrefs,
  SceneAnimation,
  SceneId,
} from "../types.js";
import { DEFAULT_CLOCK_COLORS, DEFAULT_PREFS, PRESET_DURATIONS } from "../constants.js";
import { BASE_SCENE_IDS } from "./scenes.js";

const CLOCK_VARIANTS: readonly ClockVariant[] = [
  "digital",
  "digitalSoft",
  "digitalFocus",
  "split",
  "splitStack",
  "analog",
  "analogFine",
  "analogBold",
  "analogZen",
  "minimal",
  "minimalDots",
  "breathRing",
];
const CLOCK_SCALES: readonly ClockScale[] = ["compact", "normal", "large", "larger"];
const SOUND_IDS: readonly AmbientSoundId[] = [
  "none",
  "water",
  "rain",
  "waves",
  "thunder",
  "forest",
  "whiteNoise",
];
const DURATION_MODES: readonly DurationMode[] = ["preset", "custom", "infinite"];
const ANIMATIONS: readonly SceneAnimation[] = ["particles", "rain", "waves", "aurora", "still"];
const MAX_CUSTOM_SCENES = 24;
const MAX_CUSTOM_FIXED_DURATIONS = 12;

function pick<T>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function pickString(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 80) : fallback;
}

function pickCssColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 80) return fallback;
  return trimmed;
}

function pickVolume(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_PREFS.volume;
  return Math.min(1, Math.max(0, value));
}

function pickCustomDuration(value: unknown, fallback = DEFAULT_PREFS.customDuration): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(240, Math.max(1, Math.round(value)));
}

function pickDuration(value: unknown, fallback = DEFAULT_PREFS.duration): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(240, Math.max(1, Math.round(value)));
}

function pickCustomFixedDurations(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const builtIns = new Set<number>(PRESET_DURATIONS);
  const seen = new Set<number>();
  const custom: number[] = [];
  for (const item of value) {
    if (typeof item !== "number" || !Number.isFinite(item)) continue;
    const duration = Math.round(item);
    if (duration < 1 || duration > 240 || builtIns.has(duration) || seen.has(duration)) continue;
    seen.add(duration);
    custom.push(duration);
    if (custom.length >= MAX_CUSTOM_FIXED_DURATIONS) break;
  }
  return custom.sort((a, b) => a - b);
}

function isCustomSceneId(value: unknown): value is `custom:${string}` {
  return typeof value === "string" && /^custom:[a-z0-9_-]{3,48}$/i.test(value);
}

function pickClockColors(raw: unknown): ClockColorPalette {
  const r = asObject(raw);
  if (!r) return { ...DEFAULT_CLOCK_COLORS };
  return {
    digits: pickCssColor(r.digits, DEFAULT_CLOCK_COLORS.digits),
    hands: pickCssColor(r.hands, DEFAULT_CLOCK_COLORS.hands),
    ring: pickCssColor(r.ring, DEFAULT_CLOCK_COLORS.ring),
    background: pickCssColor(r.background, DEFAULT_CLOCK_COLORS.background),
    highlight: pickCssColor(r.highlight, DEFAULT_CLOCK_COLORS.highlight),
  };
}

function validateCustomScene(raw: unknown): CustomScene | null {
  const r = asObject(raw);
  if (!r || !isCustomSceneId(r.id)) return null;
  return {
    id: r.id,
    name: pickString(r.name, "Custom scene"),
    background: pickCssColor(r.background, "#101820"),
    gradientFrom: pickCssColor(r.gradientFrom, "#243949"),
    gradientTo: pickCssColor(r.gradientTo, "#101820"),
    animation: pick(r.animation, ANIMATIONS, "particles"),
    sound: pick(r.sound, SOUND_IDS, DEFAULT_PREFS.sound),
    clock: pick(r.clock, CLOCK_VARIANTS, DEFAULT_PREFS.clock),
    clockScale: pick(r.clockScale, CLOCK_SCALES, DEFAULT_PREFS.clockScale),
    clockColors: pickClockColors(r.clockColors),
    durationMode: pick(r.durationMode, DURATION_MODES, DEFAULT_PREFS.durationMode),
    duration: pickDuration(r.duration),
    customDuration: pickCustomDuration(r.customDuration),
  };
}

/**
 * Validate a raw value (from localStorage / usePref) and return a typed
 * MeditationPrefs. Unknown fields are clamped to defaults. Returns a
 * fresh object — never mutates `raw`.
 */
export function validatePrefs(raw: unknown): MeditationPrefs {
  const r = asObject(raw);
  if (!r) {
    return { ...DEFAULT_PREFS };
  }
  const customScenes = Array.isArray(r.customScenes)
    ? r.customScenes
        .map(validateCustomScene)
        .filter((scene): scene is CustomScene => scene !== null)
        .slice(0, MAX_CUSTOM_SCENES)
    : [];
  const customFixedDurations = pickCustomFixedDurations(r.customFixedDurations);

  const rawScene = r.scene;
  const scene = isCustomSceneId(rawScene) && customScenes.some((custom) => custom.id === rawScene)
    ? rawScene
    : pick(rawScene, BASE_SCENE_IDS, DEFAULT_PREFS.scene);

  return {
    schemaVersion: 3,
    scene: scene as SceneId,
    clock: pick(r.clock, CLOCK_VARIANTS, DEFAULT_PREFS.clock),
    sound: pick(r.sound, SOUND_IDS, DEFAULT_PREFS.sound),
    volume: pickVolume(r.volume),
    duration: pickDuration(r.duration),
    customFixedDurations,
    durationMode: pick(r.durationMode, DURATION_MODES, DEFAULT_PREFS.durationMode),
    customDuration: pickCustomDuration(r.customDuration),
    clockScale: pick(r.clockScale, CLOCK_SCALES, DEFAULT_PREFS.clockScale),
    clockColors: pickClockColors(r.clockColors),
    customScenes,
  };
}
