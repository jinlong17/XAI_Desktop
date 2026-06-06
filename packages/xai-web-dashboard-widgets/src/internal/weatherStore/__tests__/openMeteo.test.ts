import { describe, expect, it, vi } from "vitest";
import {
  conditionFromWeatherCode,
  fetchOpenMeteoWeather,
  isOpenMeteoCacheFresh,
  searchOpenMeteoCities,
} from "../openMeteo.js";
import type { UserWeather } from "../types.js";

describe("Open-Meteo weather client", () => {
  it("searchOpenMeteoCities normalizes geocoding results", async () => {
    const fetchImpl = vi.fn(async (input: string | URL) => {
      void input;
      return new Response(
        JSON.stringify({
          results: [
            {
              id: 1796236,
              name: "Shanghai",
              latitude: 31.22222,
              longitude: 121.45806,
              timezone: "Asia/Shanghai",
              country: "China",
              country_code: "CN",
              admin1: "Shanghai",
              population: 22315474,
            },
          ],
        }),
        { status: 200 },
      );
    });

    const results = await searchOpenMeteoCities(" Shanghai ", "zh", fetchImpl);

    expect(results).toEqual([
      {
        id: 1796236,
        name: "Shanghai",
        latitude: 31.22222,
        longitude: 121.45806,
        timezone: "Asia/Shanghai",
        country: "China",
        countryCode: "CN",
        admin1: "Shanghai",
        population: 22315474,
      },
    ]);
    const url = new URL(String(fetchImpl.mock.calls[0]![0]));
    expect(url.hostname).toBe("geocoding-api.open-meteo.com");
    expect(url.searchParams.get("name")).toBe("Shanghai");
    expect(url.searchParams.get("language")).toBe("zh");
  });

  it("fetchOpenMeteoWeather normalizes current weather and 3-day forecast", async () => {
    const location: UserWeather = {
      city: "Shanghai",
      provider: "open-meteo",
      latitude: 31.23,
      longitude: 121.47,
      timezone: "Asia/Shanghai",
      country: "China",
      updatedAt: "2026-06-01T12:00:00.000Z",
    };
    const fetchImpl = vi.fn(async (input: string | URL) => {
      void input;
      return new Response(
        JSON.stringify({
          timezone: "Asia/Shanghai",
          current: {
            temperature_2m: 28.44,
            apparent_temperature: 31.21,
            relative_humidity_2m: 74,
            weather_code: 3,
            wind_speed_10m: 8.86,
          },
          daily: {
            time: ["2026-06-01", "2026-06-02", "2026-06-03"],
            weather_code: [3, 61, 0],
            temperature_2m_max: [31.25, 29, 32],
            temperature_2m_min: [24.75, 23, 25],
            precipitation_probability_max: [40, 80, 10],
          },
        }),
        { status: 200 },
      );
    });

    const draft = await fetchOpenMeteoWeather(location, fetchImpl);

    expect(draft.provider).toBe("open-meteo");
    expect(draft.temp).toBe(28.4);
    expect(draft.apparentTemp).toBe(31.2);
    expect(draft.humidity).toBe(74);
    expect(draft.windSpeed).toBe(8.9);
    expect(draft.condition).toBe("cloudy");
    expect(draft.hi).toBe(31.3);
    expect(draft.lo).toBe(24.8);
    expect(draft.forecast).toHaveLength(3);
    expect(draft.forecast?.[1]?.condition).toBe("rainy");
    expect(typeof draft.fetchedAt).toBe("string");
    const url = new URL(String(fetchImpl.mock.calls[0]![0]));
    expect(url.hostname).toBe("api.open-meteo.com");
    expect(url.searchParams.get("timezone")).toBe("Asia/Shanghai");
  });

  it("maps WMO codes to the widget's three condition icons", () => {
    expect(conditionFromWeatherCode(0)).toBe("sunny");
    expect(conditionFromWeatherCode(3)).toBe("cloudy");
    expect(conditionFromWeatherCode(61)).toBe("rainy");
    expect(conditionFromWeatherCode(95)).toBe("rainy");
  });

  it("isOpenMeteoCacheFresh honors the 20 minute cache window", () => {
    const fresh: UserWeather = {
      city: "X",
      provider: "open-meteo",
      latitude: 1,
      longitude: 1,
      fetchedAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-01T10:00:00.000Z",
    };
    expect(isOpenMeteoCacheFresh(fresh, Date.parse("2026-06-01T10:19:59.000Z"))).toBe(true);
    expect(isOpenMeteoCacheFresh(fresh, Date.parse("2026-06-01T10:20:01.000Z"))).toBe(false);
  });
});
