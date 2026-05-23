import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { WeatherWidget } from "../widgets/WeatherWidget.js";
import { WEATHER } from "../internal/fixtures.js";

describe("WeatherWidget", () => {
  it("AC-WEATHER-1: renders fixture temp + city + condition", () => {
    const { container } = render(<WeatherWidget lang="en" />);
    expect(container.querySelector(".ww-temp")?.textContent).toBe(`${WEATHER.temp}°`);
    expect(container.textContent).toContain(WEATHER.city.en);
    expect(container.querySelector(".ww-cond")?.textContent).toBe(WEATHER.condition.en);
  });

  it("AC-WEATHER-1: zh renders zh city + condition", () => {
    const { container } = render(<WeatherWidget lang="zh" />);
    expect(container.textContent).toContain(WEATHER.city.zh);
    expect(container.querySelector(".ww-cond")?.textContent).toBe(WEATHER.condition.zh);
  });

  it("AC-WEATHER-2: renders 5 forecast days with hi/lo", () => {
    const { container } = render(<WeatherWidget lang="en" />);
    const days = container.querySelectorAll(".wwf-day");
    expect(days).toHaveLength(5);
    for (let i = 0; i < 5; i += 1) {
      const day = days[i]!;
      expect(day.textContent).toContain(`${WEATHER.forecast[i]!.hi}°`);
      expect(day.textContent).toContain(`${WEATHER.forecast[i]!.lo}°`);
    }
  });

  it("AC-WEATHER-3: bilingual day labels", () => {
    const { container: cEn } = render(<WeatherWidget lang="en" />);
    expect(cEn.querySelector(".wwf-d")?.textContent).toBe("Mon");
    const { container: cZh } = render(<WeatherWidget lang="zh" />);
    expect(cZh.querySelector(".wwf-d")?.textContent).toBe("一");
  });
});
