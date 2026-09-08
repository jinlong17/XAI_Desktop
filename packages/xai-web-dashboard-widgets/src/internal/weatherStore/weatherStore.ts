/**
 * @internal — Pure SINGLETON Weather store helpers.
 *
 * All functions are PURE: they never call usePref or access localStorage.
 * The React hook wrapper (useWeather) commits via setPref.
 *
 * SINGLETON (not a record): Weather stores ONE UserWeather | null value.
 * Contrast §E stickiesStore (Record<id, UserSticky>).
 *
 * Invariants:
 *   - getWeather: defensive narrow — null/malformed → null; never throws (RG3).
 *   - setWeather: trims city; stamps updatedAt as ISO 8601 now. Always succeeds.
 *   - clearWeather: returns null (the "unset" state).
 *   - Singleton: a second setWeather call OVERWRITES (no accumulation — RW1).
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §G
 * API:    packages/xai-web-dashboard-widgets/docs/api.md §G.3.2
 */

import type {
  UserWeather,
  NewWeatherDraft,
  WeatherCondition,
  WeatherForecastDay,
  WeatherProvider,
} from "./types.js";

const VALID_CONDITIONS: ReadonlySet<string> = new Set<WeatherCondition>([
  "sunny",
  "cloudy",
  "rainy",
]);

const VALID_PROVIDERS: ReadonlySet<string> = new Set<WeatherProvider>([
  "manual",
  "open-meteo",
]);

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidLatitude(value: unknown): value is number {
  return isFiniteNumber(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: unknown): value is number {
  return isFiniteNumber(value) && value >= -180 && value <= 180;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || isFiniteNumber(value);
}

function isValidForecastDay(value: unknown): value is WeatherForecastDay {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj.date !== "string" || obj.date.length === 0) return false;
  if (typeof obj.condition !== "string" || !VALID_CONDITIONS.has(obj.condition)) return false;
  if (!isOptionalNumber(obj.weatherCode)) return false;
  if (!isOptionalNumber(obj.hi)) return false;
  if (!isOptionalNumber(obj.lo)) return false;
  if (!isOptionalNumber(obj.precipitationProbability)) return false;
  return true;
}

/** Defensive narrow: checks that v looks like a valid UserWeather object. */
function isValidUserWeather(v: unknown): v is UserWeather {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const obj = v as Record<string, unknown>;
  if (typeof obj.city !== "string" || obj.city.length === 0) return false;
  if (typeof obj.updatedAt !== "string") return false;
  if (obj.provider !== undefined && (typeof obj.provider !== "string" || !VALID_PROVIDERS.has(obj.provider))) {
    return false;
  }
  if (obj.temp !== undefined && !isFiniteNumber(obj.temp)) return false;
  if (obj.condition !== undefined && (typeof obj.condition !== "string" || !VALID_CONDITIONS.has(obj.condition))) {
    return false;
  }
  // hi/lo are optional; if present they must be numbers
  if (!isOptionalNumber(obj.hi)) return false;
  if (!isOptionalNumber(obj.lo)) return false;
  if (!isOptionalNumber(obj.weatherCode)) return false;
  if (!isOptionalNumber(obj.apparentTemp)) return false;
  if (!isOptionalNumber(obj.humidity)) return false;
  if (!isOptionalNumber(obj.windSpeed)) return false;
  if (!isOptionalNumber(obj.precipitationProbability)) return false;
  if (!isOptionalString(obj.timezone)) return false;
  if (!isOptionalString(obj.country)) return false;
  if (!isOptionalString(obj.countryCode)) return false;
  if (!isOptionalString(obj.admin1)) return false;
  if (obj.fetchedAt !== undefined && typeof obj.fetchedAt !== "string") return false;
  if (obj.forecast !== undefined) {
    if (!Array.isArray(obj.forecast)) return false;
    if (!obj.forecast.every(isValidForecastDay)) return false;
  }

  const hasManualSnapshot = isFiniteNumber(obj.temp) && typeof obj.condition === "string" && VALID_CONDITIONS.has(obj.condition);
  const hasLocation = isValidLatitude(obj.latitude) && isValidLongitude(obj.longitude);
  if (obj.latitude !== undefined && !isValidLatitude(obj.latitude)) return false;
  if (obj.longitude !== undefined && !isValidLongitude(obj.longitude)) return false;
  if (!hasManualSnapshot && !hasLocation) return false;
  return true;
}

/**
 * Narrow `store` (the registry default `unknown`/`null`) to `UserWeather | null`.
 *
 * Returns `null` for null / malformed / missing values (RG3 — never throws).
 */
export function getWeather(store: unknown): UserWeather | null {
  if (store === null || store === undefined) return null;
  if (!isValidUserWeather(store)) return null;
  return store;
}

/**
 * Produce a new singleton snapshot from the draft.
 *
 * Trims city; carries temp/condition/hi?/lo?; stamps updatedAt = now ISO.
 * Field validation is the editor's job — this always succeeds.
 * Returns a new object (the 2nd call overwrites the 1st — RW1).
 */
export function setWeather(draft: NewWeatherDraft): UserWeather {
  const result: UserWeather = {
    city: draft.city.trim(),
    provider: draft.provider ?? (draft.latitude !== undefined && draft.longitude !== undefined ? "open-meteo" : "manual"),
    updatedAt: new Date().toISOString(),
  };
  if (draft.temp !== undefined) result.temp = draft.temp;
  if (draft.condition !== undefined) result.condition = draft.condition;
  if (draft.hi !== undefined) result.hi = draft.hi;
  if (draft.lo !== undefined) result.lo = draft.lo;
  if (draft.latitude !== undefined) result.latitude = draft.latitude;
  if (draft.longitude !== undefined) result.longitude = draft.longitude;
  if (draft.timezone !== undefined) result.timezone = draft.timezone;
  if (draft.country !== undefined) result.country = draft.country;
  if (draft.countryCode !== undefined) result.countryCode = draft.countryCode;
  if (draft.admin1 !== undefined) result.admin1 = draft.admin1;
  if (draft.weatherCode !== undefined) result.weatherCode = draft.weatherCode;
  if (draft.apparentTemp !== undefined) result.apparentTemp = draft.apparentTemp;
  if (draft.humidity !== undefined) result.humidity = draft.humidity;
  if (draft.windSpeed !== undefined) result.windSpeed = draft.windSpeed;
  if (draft.precipitationProbability !== undefined) result.precipitationProbability = draft.precipitationProbability;
  if (draft.forecast !== undefined) result.forecast = draft.forecast;
  if (draft.fetchedAt !== undefined) result.fetchedAt = draft.fetchedAt;
  return result;
}

/**
 * The "unset" state — returns null (for persisting via the usePref setter).
 */
export function clearWeather(): null {
  return null;
}
