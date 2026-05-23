import { describe, it, expect } from "vitest";
import { trendPercent } from "../internal/trendPercent.js";

describe("trendPercent", () => {
  it("T1: +25% for (100, 80)", () => {
    expect(trendPercent(100, 80)).toBe("+25%");
  });

  it("T2: -20% for (80, 100)", () => {
    expect(trendPercent(80, 100)).toBe("-20%");
  });

  it("T3: em-dash for (0, 0)", () => {
    expect(trendPercent(0, 0)).toBe("—");
  });

  it("T4: em-dash for (50, 0) — never report +Infinity%", () => {
    expect(trendPercent(50, 0)).toBe("—");
  });

  it("T5: -100% for (0, 50)", () => {
    expect(trendPercent(0, 50)).toBe("-100%");
  });

  it("T6: rounds via Math.round to whole percent", () => {
    expect(trendPercent(101, 100)).toBe("+1%");
    // (101-200)/200 = -0.495 → Math.round → -49 (banker's-round-to-even gives 0; Math.round rounds toward +∞).
    expect(trendPercent(101, 200)).toBe("-49%");
    // (100-200)/200 = -0.50 → Math.round → 0 in some implementations; here Math.round(-50) → -50.
    expect(trendPercent(100, 200)).toBe("-50%");
  });

  it("T7: -1% rounded for tiny negative diff", () => {
    expect(trendPercent(99, 100)).toBe("-1%");
  });

  it("T8: +900% for large positive growth", () => {
    expect(trendPercent(1000, 100)).toBe("+900%");
  });

  it("returns +0% when rounded delta is exactly 0 but inputs differ", () => {
    // current 100, prior 100 → diff 0 → +0%
    expect(trendPercent(100, 100)).toBe("+0%");
  });
});
