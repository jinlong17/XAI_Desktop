/**
 * @internal — Weather store type contracts.
 *
 * Authority: ADR-0010 §D4 carve-out + docs/reviews/_p0-carve-outs/20260529-dashboard-weather-mail.md
 * Design:   packages/xai-web-dashboard-widgets/docs/design.md §G
 * API:      packages/xai-web-dashboard-widgets/docs/api.md §G.3.1
 *
 * §G-A Weather: SINGLETON store (UserWeather | null), NOT a record of many.
 *
 * Contrast §E stickies: a Record<id, UserSticky> of many entries.
 * Here: a single `UserWeather | null` snapshot (RW1).
 *
 * CONDITION_ICON maps the 3-preset enum to existing Icon glyphs (no Icon.tsx edit — RW3):
 *   sunny → "sun" ; cloudy → "cloud" ; rainy → "rain"
 */

import type { IconName } from "../Icon.js";

/** 3-preset weather condition (maps 1:1 to existing icon glyphs). */
export type WeatherCondition = "sunny" | "cloudy" | "rainy";

/**
 * Singleton user-set weather snapshot.
 * Distinct from the fixture WeatherFixture shape (bilingual strings + forecast array).
 */
export interface UserWeather {
  /** User-typed city name; trimmed before persist. */
  city: string;
  /** Current temperature (°, integer or one-decimal). */
  temp: number;
  /** Preset condition (NOT free text). */
  condition: WeatherCondition;
  /** Optional today-high (°). */
  hi?: number;
  /** Optional today-low (°). */
  lo?: number;
  /** ISO 8601 persisted timestamp (new Date().toISOString()). */
  updatedAt: string;
}

/**
 * Input shape for creating / overwriting the singleton (omits updatedAt).
 * hi/lo are optional and omitted when blank.
 */
export interface NewWeatherDraft {
  city: string;
  temp: number;
  condition: WeatherCondition;
  hi?: number;
  lo?: number;
}

/**
 * Preset condition → existing Icon glyph.
 * Compile-time exhaustive Record — TypeScript will error if WeatherCondition changes
 * without updating this map (RW3 guard).
 */
export const CONDITION_ICON: Record<WeatherCondition, IconName> = {
  sunny: "sun",
  cloudy: "cloud",
  rainy: "rain",
} as const;
