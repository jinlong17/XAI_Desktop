/**
 * useWeather hook tests — AC-WHOOK-1..4
 *
 * Tests persistence via the useWeather hook API.
 * Pattern mirrors useStickies.test.tsx (§E).
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §G
 * Test:   packages/xai-web-dashboard-widgets/docs/test.md §G.3 AC-WHOOK-1..4
 */
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWeather } from "../internal/weatherStore/useWeather.js";

beforeEach(() => {
  localStorage.clear();
});

describe("AC-WHOOK-3: default (unset) → weather === null", () => {
  it("hook returns null when localStorage is clear", () => {
    const { result } = renderHook(() => useWeather());
    expect(result.current.weather).toBeNull();
  });
});

describe("AC-WHOOK-1: set(draft) persists to xai_dashboard_weather; weather reflects it", () => {
  it("after set(), weather has the new city + condition", () => {
    const { result } = renderHook(() => useWeather());
    act(() => {
      result.current.set({ city: "Beijing", temp: 25, condition: "sunny" });
    });
    expect(result.current.weather).not.toBeNull();
    expect(result.current.weather!.city).toBe("Beijing");
    expect(result.current.weather!.temp).toBe(25);
    expect(result.current.weather!.condition).toBe("sunny");
  });

  it("set() persists to xai_dashboard_weather key in localStorage", () => {
    const { result } = renderHook(() => useWeather());
    act(() => {
      result.current.set({ city: "Shanghai", temp: 30, condition: "cloudy" });
    });
    const raw = localStorage.getItem("xai_dashboard_weather");
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw!);
    expect(stored.city).toBe("Shanghai");
    expect(stored.condition).toBe("cloudy");
  });

  it("set() can persist an Open-Meteo location before live weather has loaded", () => {
    const { result } = renderHook(() => useWeather());
    act(() => {
      result.current.set({
        city: "Shanghai",
        provider: "open-meteo",
        latitude: 31.23,
        longitude: 121.47,
        timezone: "Asia/Shanghai",
      });
    });
    expect(result.current.weather).not.toBeNull();
    expect(result.current.weather!.provider).toBe("open-meteo");
    expect(result.current.weather!.latitude).toBe(31.23);
    expect(result.current.weather!.temp).toBeUndefined();
  });
});

describe("AC-WHOOK-2: clear() persists null; weather becomes null", () => {
  it("after set then clear, weather is null and localStorage is null", () => {
    const { result } = renderHook(() => useWeather());
    act(() => {
      result.current.set({ city: "Tokyo", temp: 20, condition: "rainy" });
    });
    expect(result.current.weather).not.toBeNull();

    act(() => {
      result.current.clear();
    });
    expect(result.current.weather).toBeNull();
    const raw = localStorage.getItem("xai_dashboard_weather");
    // After clear, stored value should be null (JSON.stringify(null) = "null")
    expect(raw === null || raw === "null").toBe(true);
  });
});

describe("AC-WHOOK-4: a second hook instance reading the same key sees the persisted value", () => {
  it("after set() in hook1, hook2 initialized fresh sees the same value via localStorage", () => {
    const { result: hook1 } = renderHook(() => useWeather());
    act(() => {
      hook1.current.set({ city: "Berlin", temp: 15, condition: "cloudy" });
    });

    // A new hook instance reads the persisted localStorage
    const { result: hook2 } = renderHook(() => useWeather());
    expect(hook2.current.weather).not.toBeNull();
    expect(hook2.current.weather!.city).toBe("Berlin");
  });
});
