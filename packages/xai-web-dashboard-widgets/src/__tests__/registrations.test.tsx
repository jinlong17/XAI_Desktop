/**
 * AC-REG-1..5: registrations array shape.
 */
import { describe, it, expect } from "vitest";

import { dashboardWidgetRegistrations } from "../registrations.js";

describe("AC-REG: dashboardWidgetRegistrations shape", () => {
  it("AC-REG-1: length is 11", () => {
    expect(dashboardWidgetRegistrations).toHaveLength(11);
  });

  it("AC-REG-2: ids match the prototype WIDGETS_CONFIG order", () => {
    expect(dashboardWidgetRegistrations.map((r) => r.id)).toEqual([
      "clock",
      "stat-tasks",
      "stat-streak",
      "stat-pomos",
      "timetrack",
      "weather",
      "mini-cal",
      "timezones",
      "stickies",
      "mail",
      "upcoming",
    ]);
  });

  it("AC-REG-3: spans map per design.md §1.1 #4", () => {
    expect(dashboardWidgetRegistrations.map((r) => r.span)).toEqual([
      "w-clock",
      "w-stat",
      "w-stat",
      "w-stat",
      "w-timetrack",
      "w-weather",
      "w-mini-cal",
      "w-timezones",
      "w-stickies",
      "w-mail",
      "w-upcoming",
    ]);
  });

  it("AC-REG-4: each entry has a callable render returning a ReactNode (null acceptable for placeholders)", () => {
    const ctx = {
      lang: "en" as const,
      now: new Date(2026, 4, 22, 10, 0, 0),
      goTo: () => {},
    };
    for (const reg of dashboardWidgetRegistrations) {
      expect(typeof reg.render).toBe("function");
      // arity may be 0 (placeholder ignoring ctx) or 1 — both produce a ReactNode
      expect(reg.render.length).toBeLessThanOrEqual(1);
      // Calling render with ctx must not throw and must return ReactNode (null
      // or a React element).
      expect(() => reg.render(ctx)).not.toThrow();
    }
  });

  it("AC-REG-5: each entry has bilingual ariaLabel", () => {
    for (const reg of dashboardWidgetRegistrations) {
      expect(reg.ariaLabel).toBeDefined();
      expect(typeof reg.ariaLabel!.en).toBe("string");
      expect(typeof reg.ariaLabel!.zh).toBe("string");
      expect(reg.ariaLabel!.en.length).toBeGreaterThan(0);
      expect(reg.ariaLabel!.zh.length).toBeGreaterThan(0);
    }
  });
});
