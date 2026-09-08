/**
 * cityLibrary — 12-city timezone library shared by ClockWidget + WorldClocks.
 *
 * Static UTC offsets (no DST handling) — matches `web design/module-dashboard.jsx`
 * lines 569-582 verbatim. Intentional v1 limitation documented in api.md §S10.
 */
import type { Lang } from "@repo/plugin-web-tokens";

export interface CityEntry {
  /** Stable id used in xai_clock_tz + xai_zones. */
  id: string;
  /** Bilingual city name. */
  city: { en: string; zh: string };
  /** UTC offset in hours (integer). */
  tz: number;
}

export const CITY_LIBRARY: readonly CityEntry[] = [
  { id: "shanghai", city: { en: "Shanghai", zh: "上海" }, tz: 8 },
  { id: "london", city: { en: "London", zh: "伦敦" }, tz: 1 },
  { id: "new_york", city: { en: "New York", zh: "纽约" }, tz: -4 },
  { id: "tokyo", city: { en: "Tokyo", zh: "东京" }, tz: 9 },
  { id: "sf", city: { en: "San Francisco", zh: "旧金山" }, tz: -7 },
  { id: "paris", city: { en: "Paris", zh: "巴黎" }, tz: 2 },
  { id: "sydney", city: { en: "Sydney", zh: "悉尼" }, tz: 11 },
  { id: "berlin", city: { en: "Berlin", zh: "柏林" }, tz: 2 },
  { id: "dubai", city: { en: "Dubai", zh: "迪拜" }, tz: 4 },
  { id: "singapore", city: { en: "Singapore", zh: "新加坡" }, tz: 8 },
  { id: "hk", city: { en: "Hong Kong", zh: "香港" }, tz: 8 },
  { id: "la", city: { en: "Los Angeles", zh: "洛杉矶" }, tz: -7 },
] as const;

export function findCity(id: string): CityEntry | undefined {
  return CITY_LIBRARY.find((c) => c.id === id);
}

export function cityLabel(entry: CityEntry, lang: Lang): string {
  return entry.city[lang];
}
