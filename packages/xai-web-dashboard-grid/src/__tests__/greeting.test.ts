/**
 * AC-RENDER-5/6/7: pickGreetingKey + formatDashboardDate.
 */
import { describe, expect, it } from "vitest";

import { formatDashboardDate, pickGreetingKey } from "../internal/greeting.js";

describe("pickGreetingKey", () => {
  it("AC-RENDER-5: hour < 12 → good_morning", () => {
    expect(pickGreetingKey(new Date(2026, 4, 23, 0, 0, 0))).toBe("dashboard.good_morning");
    expect(pickGreetingKey(new Date(2026, 4, 23, 6, 0, 0))).toBe("dashboard.good_morning");
    expect(pickGreetingKey(new Date(2026, 4, 23, 11, 59, 0))).toBe("dashboard.good_morning");
  });

  it("AC-RENDER-5: 12 ≤ hour < 18 → good_afternoon", () => {
    expect(pickGreetingKey(new Date(2026, 4, 23, 12, 0, 0))).toBe("dashboard.good_afternoon");
    expect(pickGreetingKey(new Date(2026, 4, 23, 14, 0, 0))).toBe("dashboard.good_afternoon");
    expect(pickGreetingKey(new Date(2026, 4, 23, 17, 59, 0))).toBe("dashboard.good_afternoon");
  });

  it("AC-RENDER-5: hour ≥ 18 → good_evening", () => {
    expect(pickGreetingKey(new Date(2026, 4, 23, 18, 0, 0))).toBe("dashboard.good_evening");
    expect(pickGreetingKey(new Date(2026, 4, 23, 22, 30, 0))).toBe("dashboard.good_evening");
    expect(pickGreetingKey(new Date(2026, 4, 23, 23, 59, 0))).toBe("dashboard.good_evening");
  });
});

describe("formatDashboardDate", () => {
  it("AC-RENDER-7: zh form returns '<Y> 年 <M> 月 <D> 日 · 周<W>'", () => {
    // 2026-05-23 is a Saturday → 周六
    const d = new Date(2026, 4, 23, 8, 0, 0);
    expect(formatDashboardDate(d, "zh")).toBe("2026 年 5 月 23 日 · 周六");
  });

  it("AC-RENDER-7: zh form Sunday → 周日", () => {
    // 2026-05-24 is a Sunday
    const d = new Date(2026, 4, 24, 8, 0, 0);
    expect(formatDashboardDate(d, "zh")).toBe("2026 年 5 月 24 日 · 周日");
  });

  it("AC-RENDER-6: en form uses long weekday + month + numeric day", () => {
    const d = new Date(2026, 4, 23, 8, 0, 0);
    const out = formatDashboardDate(d, "en");
    // Locale "en-US" → "Saturday, May 23"
    expect(out).toContain("Saturday");
    expect(out).toContain("May");
    expect(out).toContain("23");
  });

  it("returns the same string for the same input (pure)", () => {
    const d = new Date(2026, 4, 23, 8, 0, 0);
    expect(formatDashboardDate(d, "en")).toBe(formatDashboardDate(d, "en"));
    expect(formatDashboardDate(d, "zh")).toBe(formatDashboardDate(d, "zh"));
  });
});
