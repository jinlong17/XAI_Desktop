import type {
  NewWeatherDraft,
  UserWeather,
  WeatherCityCandidate,
  WeatherCondition,
  WeatherLang,
} from "./types.js";

const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

export const OPEN_METEO_CACHE_TTL_MS = 20 * 60 * 1000;

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

interface OpenMeteoGeocodingResult {
  id?: unknown;
  name?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  timezone?: unknown;
  country?: unknown;
  country_code?: unknown;
  admin1?: unknown;
  population?: unknown;
}

interface OpenMeteoForecastResponse {
  timezone?: unknown;
  current?: Record<string, unknown>;
  daily?: Record<string, unknown>;
}

function getFetch(fetchImpl?: FetchLike): FetchLike {
  const resolved = fetchImpl ?? globalThis.fetch;
  if (typeof resolved !== "function") {
    throw new Error("Fetch is not available for weather requests");
  }
  return resolved.bind(globalThis) as FetchLike;
}

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function roundWeatherValue(value: number): number {
  return Math.round(value * 10) / 10;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function readNumberArray(record: Record<string, unknown>, key: string): Array<number | undefined> {
  const value = record[key];
  return Array.isArray(value) ? value.map(asFiniteNumber) : [];
}

function readStringArray(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export function conditionFromWeatherCode(code: number): WeatherCondition {
  if (code === 0 || code === 1) return "sunny";
  if (code === 2 || code === 3 || code === 45 || code === 48) return "cloudy";
  return "rainy";
}

export function hasOpenMeteoLocation(
  weather: UserWeather | null,
): weather is UserWeather & { latitude: number; longitude: number } {
  return (
    weather !== null &&
    typeof weather.latitude === "number" &&
    Number.isFinite(weather.latitude) &&
    typeof weather.longitude === "number" &&
    Number.isFinite(weather.longitude)
  );
}

export function isOpenMeteoCacheFresh(
  weather: UserWeather | null,
  nowMs = Date.now(),
  ttlMs = OPEN_METEO_CACHE_TTL_MS,
): boolean {
  if (!weather?.fetchedAt) return false;
  const fetchedMs = Date.parse(weather.fetchedAt);
  return Number.isFinite(fetchedMs) && nowMs - fetchedMs >= 0 && nowMs - fetchedMs < ttlMs;
}

function normalizeCandidate(raw: OpenMeteoGeocodingResult): WeatherCityCandidate | null {
  const id = asFiniteNumber(raw.id);
  const name = asString(raw.name);
  const latitude = asFiniteNumber(raw.latitude);
  const longitude = asFiniteNumber(raw.longitude);
  const timezone = asString(raw.timezone);
  if (id === undefined || !name || latitude === undefined || longitude === undefined || !timezone) return null;
  return {
    id,
    name,
    latitude,
    longitude,
    timezone,
    country: asString(raw.country),
    countryCode: asString(raw.country_code),
    admin1: asString(raw.admin1),
    population: asFiniteNumber(raw.population),
  };
}

export async function searchOpenMeteoCities(
  query: string,
  lang: WeatherLang = "en",
  fetchImpl?: FetchLike,
): Promise<WeatherCityCandidate[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = new URL(GEOCODING_ENDPOINT);
  url.searchParams.set("name", trimmed);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", lang);
  url.searchParams.set("format", "json");

  const response = await getFetch(fetchImpl)(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo geocoding failed with HTTP ${response.status}`);
  }
  const data = (await response.json()) as { results?: unknown };
  if (!Array.isArray(data.results)) return [];
  return data.results
    .map((item) => normalizeCandidate(item as OpenMeteoGeocodingResult))
    .filter((item): item is WeatherCityCandidate => item !== null);
}

function buildForecastDays(daily: Record<string, unknown> | undefined, fallbackCode: number) {
  if (!daily) return [];
  const dates = readStringArray(daily, "time");
  const codes = readNumberArray(daily, "weather_code");
  const highs = readNumberArray(daily, "temperature_2m_max");
  const lows = readNumberArray(daily, "temperature_2m_min");
  const precip = readNumberArray(daily, "precipitation_probability_max");

  return dates.slice(0, 3).map((date, index) => {
    const weatherCode = codes[index] ?? fallbackCode;
    const hi = highs[index];
    const lo = lows[index];
    const precipitationProbability = precip[index];
    return {
      date,
      condition: conditionFromWeatherCode(weatherCode),
      weatherCode,
      ...(hi !== undefined ? { hi: roundWeatherValue(hi) } : {}),
      ...(lo !== undefined ? { lo: roundWeatherValue(lo) } : {}),
      ...(precipitationProbability !== undefined ? { precipitationProbability } : {}),
    };
  });
}

export async function fetchOpenMeteoWeather(
  location: UserWeather,
  fetchImpl?: FetchLike,
): Promise<NewWeatherDraft> {
  if (!hasOpenMeteoLocation(location)) {
    throw new Error("Open-Meteo weather requires latitude and longitude");
  }

  const url = new URL(FORECAST_ENDPOINT);
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
  );
  url.searchParams.set("forecast_days", "3");
  url.searchParams.set("timezone", location.timezone || "auto");

  const response = await getFetch(fetchImpl)(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo forecast failed with HTTP ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoForecastResponse;
  const current = data.current ?? {};
  const temperature = asFiniteNumber(current.temperature_2m);
  const weatherCode = asFiniteNumber(current.weather_code);
  if (temperature === undefined || weatherCode === undefined) {
    throw new Error("Open-Meteo forecast response is missing current weather");
  }

  const apparentTemp = asFiniteNumber(current.apparent_temperature);
  const humidity = asFiniteNumber(current.relative_humidity_2m);
  const windSpeed = asFiniteNumber(current.wind_speed_10m);
  const forecast = buildForecastDays(data.daily, weatherCode);
  const today = forecast[0];

  return {
    provider: "open-meteo",
    city: location.city,
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: asString(data.timezone) ?? location.timezone,
    country: location.country,
    countryCode: location.countryCode,
    admin1: location.admin1,
    temp: roundWeatherValue(temperature),
    condition: conditionFromWeatherCode(weatherCode),
    weatherCode,
    ...(apparentTemp !== undefined ? { apparentTemp: roundWeatherValue(apparentTemp) } : {}),
    ...(humidity !== undefined ? { humidity } : {}),
    ...(windSpeed !== undefined ? { windSpeed: roundWeatherValue(windSpeed) } : {}),
    ...(today?.hi !== undefined ? { hi: today.hi } : {}),
    ...(today?.lo !== undefined ? { lo: today.lo } : {}),
    ...(today?.precipitationProbability !== undefined
      ? { precipitationProbability: today.precipitationProbability }
      : {}),
    ...(forecast.length > 0 ? { forecast } : {}),
    fetchedAt: new Date().toISOString(),
  };
}
