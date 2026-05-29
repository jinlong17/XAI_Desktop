/**
 * WeatherWidget tests — AC-WEATHER-REAL-1..8
 *
 * REWRITTEN for §G-A: fixture assertions (AC-WEATHER-1..3 from SHIPPED row #11)
 * are removed; replaced by store-driven assertions (real usePref round-trip).
 * WEATHER fixture export is kept; fixtures.test.ts still passes (RW4).
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §G
 * Test:   packages/xai-web-dashboard-widgets/docs/test.md §G.3 AC-WEATHER-REAL-1..8
 */
import { describe, it, expect, beforeEach, beforeAll, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WeatherWidget } from "../widgets/WeatherWidget.js";
import { STR_WEATHER } from "../internal/strings.js";

// jsdom stubs for HTMLDialogElement (same pattern as WeatherEditor tests)
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
    };
  }
});

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AC-WEATHER-REAL-1: store null → honest empty state; no fixture temp/city; Edit button present", () => {
  it("renders empty state text when no weather is set", () => {
    const { container } = render(<WeatherWidget lang="en" />);
    expect(container.textContent).toContain(STR_WEATHER.empty.en);
  });

  it("no fixture temp or city rendered (no .ww-temp)", () => {
    const { container } = render(<WeatherWidget lang="en" />);
    expect(container.querySelector(".ww-temp")).toBeNull();
  });

  it("Edit button is present with data-no-drag", () => {
    const { container } = render(<WeatherWidget lang="en" />);
    const editBtn = container.querySelector("[data-no-drag]");
    expect(editBtn).not.toBeNull();
  });
});

describe("AC-WEATHER-REAL-2: clicking Edit opens the editor (dialog .open)", () => {
  it("editor dialog is closed initially, opens on Edit click", () => {
    const { container } = render(<WeatherWidget lang="en" />);
    const editBtn = container.querySelector("[data-no-drag]") as HTMLElement;
    expect(container.querySelector("dialog[open]")).toBeNull();
    fireEvent.click(editBtn);
    expect(container.querySelector("dialog")).not.toBeNull();
    expect(container.querySelector("dialog")!.hasAttribute("open")).toBe(true);
  });
});

describe("AC-WEATHER-REAL-3: seeded UserWeather → renders temp + city + condition label + icon", () => {
  it("after seeding localStorage, widget renders the persisted weather values", () => {
    // Seed localStorage directly (bypassing the hook for the seed step)
    const seeded = {
      city: "Shanghai",
      temp: 30,
      condition: "cloudy",
      updatedAt: "2026-05-29T12:00:00.000Z",
    };
    localStorage.setItem("xai_dashboard_weather", JSON.stringify(seeded));

    const { container } = render(<WeatherWidget lang="en" />);
    expect(container.querySelector(".ww-temp")?.textContent).toBe("30°");
    expect(container.textContent).toContain("Shanghai");
    expect(container.textContent).toContain(STR_WEATHER.cond_cloudy.en);
    // condition icon: data-icon="cloud" for cloudy
    expect(container.querySelector('[data-icon="cloud"]')).not.toBeNull();
  });
});

describe("AC-WEATHER-REAL-4: each of the 3 conditions renders its mapped icon", () => {
  const CASES: Array<[string, string, string]> = [
    ["sunny", "sun", STR_WEATHER.cond_sunny.en],
    ["cloudy", "cloud", STR_WEATHER.cond_cloudy.en],
    ["rainy", "rain", STR_WEATHER.cond_rainy.en],
  ];

  for (const [condition, iconName, label] of CASES) {
    it(`condition "${condition}" renders icon data-icon="${iconName}" and label "${label}"`, () => {
      const seeded = {
        city: "TestCity",
        temp: 20,
        condition,
        updatedAt: "2026-05-29T12:00:00.000Z",
      };
      localStorage.setItem("xai_dashboard_weather", JSON.stringify(seeded));
      const { container } = render(<WeatherWidget lang="en" />);
      expect(container.querySelector(`[data-icon="${iconName}"]`)).not.toBeNull();
      expect(container.textContent).toContain(label);
    });
  }
});

describe("AC-WEATHER-REAL-5: optional hi/lo — present → .ww-hilo shows values; absent → no .ww-hilo", () => {
  it("seeded with hi+lo → .ww-hilo row with both values", () => {
    const seeded = {
      city: "Seoul",
      temp: 22,
      condition: "sunny",
      hi: 26,
      lo: 18,
      updatedAt: "2026-05-29T12:00:00.000Z",
    };
    localStorage.setItem("xai_dashboard_weather", JSON.stringify(seeded));
    const { container } = render(<WeatherWidget lang="en" />);
    const hiLo = container.querySelector(".ww-hilo");
    expect(hiLo).not.toBeNull();
    expect(hiLo!.textContent).toContain("26°");
    expect(hiLo!.textContent).toContain("18°");
  });

  it("seeded without hi/lo → no .ww-hilo row", () => {
    const seeded = {
      city: "Oslo",
      temp: 8,
      condition: "rainy",
      updatedAt: "2026-05-29T12:00:00.000Z",
    };
    localStorage.setItem("xai_dashboard_weather", JSON.stringify(seeded));
    const { container } = render(<WeatherWidget lang="en" />);
    expect(container.querySelector(".ww-hilo")).toBeNull();
  });
});

describe("AC-WEATHER-REAL-6: integration — Edit → fill editor → Save → widget shows new values", () => {
  it("fill and save editor → widget reflects the new city and temp", () => {
    const { container } = render(<WeatherWidget lang="en" />);

    // Open editor
    const editBtn = container.querySelector("[data-no-drag]") as HTMLElement;
    fireEvent.click(editBtn);

    // Fill the editor
    const cityInput = container.querySelector("#weather-editor-city") as HTMLInputElement;
    const tempInput = container.querySelector("#weather-editor-temp") as HTMLInputElement;
    fireEvent.change(cityInput, { target: { value: "Osaka" } });
    fireEvent.change(tempInput, { target: { value: "24" } });

    // Save
    fireEvent.click(screen.getByText(STR_WEATHER.btn_save.en));

    // Widget should now show the new values
    expect(container.querySelector(".ww-temp")?.textContent).toBe("24°");
    expect(container.textContent).toContain("Osaka");
  });
});

describe("AC-WEATHER-REAL-7: 5-day forecast NOT rendered on live path (no .wwf-day)", () => {
  it("no .wwf-day elements when weather is null (empty state)", () => {
    const { container } = render(<WeatherWidget lang="en" />);
    expect(container.querySelectorAll(".wwf-day")).toHaveLength(0);
  });

  it("no .wwf-day elements when weather is set (real path)", () => {
    const seeded = {
      city: "HK",
      temp: 32,
      condition: "sunny",
      updatedAt: "2026-05-29T12:00:00.000Z",
    };
    localStorage.setItem("xai_dashboard_weather", JSON.stringify(seeded));
    const { container } = render(<WeatherWidget lang="en" />);
    expect(container.querySelectorAll(".wwf-day")).toHaveLength(0);
  });
});

describe("AC-WEATHER-REAL-8: bilingual — empty label + condition labels render in en + zh; title from dashboard.weather", () => {
  it("lang=en: empty state label is en", () => {
    const { container } = render(<WeatherWidget lang="en" />);
    expect(container.textContent).toContain(STR_WEATHER.empty.en);
  });

  it("lang=zh: empty state label is zh", () => {
    const { container } = render(<WeatherWidget lang="zh" />);
    expect(container.textContent).toContain(STR_WEATHER.empty.zh);
  });

  it("lang=en + sunny: condition label is en sunny", () => {
    const seeded = {
      city: "X",
      temp: 20,
      condition: "sunny",
      updatedAt: "2026-05-29T12:00:00.000Z",
    };
    localStorage.setItem("xai_dashboard_weather", JSON.stringify(seeded));
    const { container } = render(<WeatherWidget lang="en" />);
    expect(container.textContent).toContain(STR_WEATHER.cond_sunny.en);
  });

  it("lang=zh + cloudy: condition label is zh cloudy", () => {
    const seeded = {
      city: "X",
      temp: 20,
      condition: "cloudy",
      updatedAt: "2026-05-29T12:00:00.000Z",
    };
    localStorage.setItem("xai_dashboard_weather", JSON.stringify(seeded));
    const { container } = render(<WeatherWidget lang="zh" />);
    expect(container.textContent).toContain(STR_WEATHER.cond_cloudy.zh);
  });
});
