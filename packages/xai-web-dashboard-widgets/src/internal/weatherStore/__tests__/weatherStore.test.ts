/**
 * AC-WSTORE — Pure weatherStore function tests.
 *
 * No RTL / no React — pure unit tests over getWeather, setWeather, clearWeather.
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §G
 * Test:   packages/xai-web-dashboard-widgets/docs/test.md §G.3 AC-WSTORE-1..6
 */
import { describe, it, expect } from "vitest";
import { getWeather, setWeather, clearWeather } from "../weatherStore.js";
import type { UserWeather } from "../types.js";

const VALID_WEATHER: UserWeather = {
  city: "Beijing",
  temp: 25,
  condition: "sunny",
  updatedAt: "2026-05-29T10:00:00.000Z",
};

describe("AC-WSTORE-1: getWeather defensive narrow — null / malformed → null", () => {
  it("getWeather(null) → null", () => {
    expect(getWeather(null)).toBeNull();
  });
  it("getWeather(undefined) → null", () => {
    expect(getWeather(undefined)).toBeNull();
  });
  it("getWeather({}) → null (missing required fields)", () => {
    expect(getWeather({})).toBeNull();
  });
  it("getWeather([]) → null (array not object)", () => {
    expect(getWeather([])).toBeNull();
  });
  it("getWeather({city:1, temp:25, condition:'sunny', updatedAt:'x'}) → null (city not string)", () => {
    expect(getWeather({ city: 1, temp: 25, condition: "sunny", updatedAt: "x" })).toBeNull();
  });
  it("getWeather({city:'', temp:25, condition:'sunny', updatedAt:'x'}) → null (empty city)", () => {
    expect(getWeather({ city: "", temp: 25, condition: "sunny", updatedAt: "x" })).toBeNull();
  });
  it("getWeather({city:'x', temp:'hot', condition:'sunny', updatedAt:'x'}) → null (temp not number)", () => {
    expect(getWeather({ city: "x", temp: "hot", condition: "sunny", updatedAt: "x" })).toBeNull();
  });
  it("getWeather({city:'x', temp:25, condition:'stormy', updatedAt:'x'}) → null (unknown condition)", () => {
    expect(getWeather({ city: "x", temp: 25, condition: "stormy", updatedAt: "x" })).toBeNull();
  });
  it("getWeather({city:'x', temp:25, condition:'sunny', updatedAt:'x', hi:'warm'}) → null (hi not number)", () => {
    expect(getWeather({ city: "x", temp: 25, condition: "sunny", updatedAt: "x", hi: "warm" })).toBeNull();
  });
  it("getWeather(location-only Open-Meteo snapshot) → valid", () => {
    const locationOnly = {
      city: "Shanghai",
      provider: "open-meteo",
      latitude: 31.23,
      longitude: 121.47,
      timezone: "Asia/Shanghai",
      updatedAt: "2026-06-01T10:00:00.000Z",
    };
    expect(getWeather(locationOnly)).toEqual(locationOnly);
  });
  it("getWeather(invalid latitude/longitude) → null", () => {
    expect(
      getWeather({
        city: "Invalid",
        provider: "open-meteo",
        latitude: 120,
        longitude: 200,
        updatedAt: "2026-06-01T10:00:00.000Z",
      }),
    ).toBeNull();
  });
  it("never throws", () => {
    expect(() => getWeather(null)).not.toThrow();
    expect(() => getWeather({})).not.toThrow();
    expect(() => getWeather(42)).not.toThrow();
  });
});

describe("AC-WSTORE-2: getWeather(valid UserWeather) → the same validated object", () => {
  it("returns the validated UserWeather", () => {
    const result = getWeather(VALID_WEATHER);
    expect(result).toEqual(VALID_WEATHER);
  });
  it("handles optional hi/lo when present and valid", () => {
    const withHiLo = { ...VALID_WEATHER, hi: 30, lo: 18 };
    expect(getWeather(withHiLo)).toEqual(withHiLo);
  });
  it("handles all 3 WeatherCondition presets", () => {
    for (const cond of ["sunny", "cloudy", "rainy"] as const) {
      const w = { ...VALID_WEATHER, condition: cond };
      expect(getWeather(w)).toEqual(w);
    }
  });
  it("handles optional Open-Meteo details when present and valid", () => {
    const withProviderDetails = {
      ...VALID_WEATHER,
      provider: "open-meteo",
      latitude: 31.23,
      longitude: 121.47,
      timezone: "Asia/Shanghai",
      country: "China",
      countryCode: "CN",
      admin1: "Shanghai",
      weatherCode: 3,
      apparentTemp: 31,
      humidity: 74,
      windSpeed: 9,
      precipitationProbability: 40,
      fetchedAt: "2026-06-01T10:00:00.000Z",
      forecast: [
        {
          date: "2026-06-01",
          condition: "cloudy",
          weatherCode: 3,
          hi: 31,
          lo: 25,
          precipitationProbability: 40,
        },
      ],
    } satisfies UserWeather;
    expect(getWeather(withProviderDetails)).toEqual(withProviderDetails);
  });
});

describe("AC-WSTORE-3: setWeather trims city + stamps updatedAt", () => {
  it("trims leading/trailing whitespace from city", () => {
    const result = setWeather({ city: "  Shanghai ", temp: 22, condition: "cloudy" });
    expect(result.city).toBe("Shanghai");
  });
  it("carries temp + condition", () => {
    const result = setWeather({ city: "Tokyo", temp: 20, condition: "rainy" });
    expect(result.temp).toBe(20);
    expect(result.condition).toBe("rainy");
  });
  it("updatedAt is an ISO string", () => {
    const result = setWeather({ city: "Paris", temp: 15, condition: "cloudy" });
    expect(typeof result.updatedAt).toBe("string");
    expect(() => new Date(result.updatedAt)).not.toThrow();
    // ISO string contains 'T' and 'Z' or offset
    expect(result.updatedAt).toMatch(/T\d{2}:\d{2}:\d{2}/);
  });
  it("hi/lo absent when not provided in draft", () => {
    const result = setWeather({ city: "London", temp: 12, condition: "rainy" });
    expect(result.hi).toBeUndefined();
    expect(result.lo).toBeUndefined();
  });
  it("location-only Open-Meteo draft persists provider metadata without requiring manual temp", () => {
    const result = setWeather({
      city: "Shanghai",
      provider: "open-meteo",
      latitude: 31.23,
      longitude: 121.47,
      timezone: "Asia/Shanghai",
      country: "China",
      countryCode: "CN",
      admin1: "Shanghai",
    });
    expect(result.provider).toBe("open-meteo");
    expect(result.latitude).toBe(31.23);
    expect(result.longitude).toBe(121.47);
    expect(result.temp).toBeUndefined();
    expect(result.condition).toBeUndefined();
  });
});

describe("AC-WSTORE-4: setWeather with hi/lo → carries hi/lo; without → undefined", () => {
  it("carries hi and lo when provided", () => {
    const result = setWeather({ city: "Dubai", temp: 40, condition: "sunny", hi: 44, lo: 35 });
    expect(result.hi).toBe(44);
    expect(result.lo).toBe(35);
  });
  it("omits hi/lo when not provided", () => {
    const result = setWeather({ city: "Oslo", temp: 5, condition: "cloudy" });
    expect("hi" in result).toBe(false);
    expect("lo" in result).toBe(false);
  });
  it("carries hi only when only hi provided", () => {
    const result = setWeather({ city: "Sydney", temp: 22, condition: "sunny", hi: 25 });
    expect(result.hi).toBe(25);
    expect(result.lo).toBeUndefined();
  });
});

describe("AC-WSTORE-5: clearWeather() → null", () => {
  it("returns null", () => {
    expect(clearWeather()).toBeNull();
  });
});

describe("AC-WSTORE-6: SINGLETON — not a record; two setWeather calls do NOT accumulate", () => {
  it("setWeather returns ONE object (not a keyed map)", () => {
    const result = setWeather({ city: "Beijing", temp: 25, condition: "sunny" });
    expect(typeof result).toBe("object");
    expect(result).not.toBeNull();
    // It is a UserWeather, not a Record<id, ...>
    expect(typeof result.city).toBe("string");
    expect(typeof result.temp).toBe("number");
    // It does NOT have an id key (not a stickies-style record entry)
    expect("id" in result).toBe(false);
  });

  it("second setWeather call overwrites (no accumulation — RW1)", () => {
    const first = setWeather({ city: "Beijing", temp: 25, condition: "sunny" });
    const second = setWeather({ city: "Shanghai", temp: 30, condition: "rainy" });
    // Both are independent UserWeather snapshots — second is NOT merged with first
    expect(second.city).toBe("Shanghai");
    expect(second.temp).toBe(30);
    // The 'first' result is unchanged (pure function)
    expect(first.city).toBe("Beijing");
  });
});
