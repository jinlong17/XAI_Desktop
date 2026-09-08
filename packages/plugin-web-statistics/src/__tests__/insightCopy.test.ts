import { describe, it, expect } from "vitest";
import { insightCopy } from "../internal/insightCopy.js";

describe("insightCopy", () => {
  it("I1: empty-state EN when peak=null", () => {
    expect(
      insightCopy("en", { peakHourLabel: null, focusTrendStr: "—", range: "week" }),
    ).toContain("focus session");
  });

  it("I2: empty-state ZH when peak=null", () => {
    expect(
      insightCopy("zh", { peakHourLabel: null, focusTrendStr: "—", range: "week" }),
    ).toContain("洞察");
  });

  it("I3: week EN contains peak, trend, 'morning rhythm'", () => {
    const out = insightCopy("en", {
      peakHourLabel: "09:00",
      focusTrendStr: "+8%",
      range: "week",
    });
    expect(out).toContain("09:00");
    expect(out).toContain("+8%");
    expect(out).toContain("morning rhythm");
  });

  it("I4: month ZH contains peak, trend, '节奏稳定'", () => {
    const out = insightCopy("zh", {
      peakHourLabel: "14:00",
      focusTrendStr: "+12%",
      range: "month",
    });
    expect(out).toContain("14:00");
    expect(out).toContain("+12%");
    expect(out).toContain("节奏稳定");
  });

  it("I5: all EN contains 'Long-game'", () => {
    const out = insightCopy("en", {
      peakHourLabel: "10:00",
      focusTrendStr: "—",
      range: "all",
    });
    expect(out).toContain("10:00");
    expect(out).toContain("—");
    expect(out).toContain("Long-game");
  });

  it("I6: never contains stray '+ undefined' or '++' or 'null' tokens", () => {
    const out = insightCopy("en", {
      peakHourLabel: "09:00",
      focusTrendStr: "+8%",
      range: "week",
    });
    expect(out).not.toContain("++");
    expect(out).not.toContain("undefined");
    expect(out).not.toContain("null");
  });

  it("I7: '—' trend renders grammatically", () => {
    const out = insightCopy("en", {
      peakHourLabel: "09:00",
      focusTrendStr: "—",
      range: "week",
    });
    expect(out).toContain("focus time is —");
  });

  it("I8: pure — same inputs → same output", () => {
    const a = insightCopy("en", {
      peakHourLabel: "09:00",
      focusTrendStr: "+8%",
      range: "week",
    });
    const b = insightCopy("en", {
      peakHourLabel: "09:00",
      focusTrendStr: "+8%",
      range: "week",
    });
    expect(a).toBe(b);
  });

  it("range='month' ZH template", () => {
    const out = insightCopy("zh", {
      peakHourLabel: "10:00",
      focusTrendStr: "+3%",
      range: "month",
    });
    expect(out).toContain("比上月");
  });

  it("range='all' ZH template", () => {
    const out = insightCopy("zh", {
      peakHourLabel: "10:00",
      focusTrendStr: "+3%",
      range: "all",
    });
    expect(out).toContain("长期稳健");
  });
});
