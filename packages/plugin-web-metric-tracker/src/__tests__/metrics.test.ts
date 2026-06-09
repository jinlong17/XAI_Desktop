import { describe, expect, it } from "vitest";
import { rangeWindow } from "../internal/date.js";
import { bmiFor, computeWeightStats, filterRecordsByRange, kgToUnit, weightToKg } from "../internal/metrics.js";
import { createSeedMetricTrackerState } from "../internal/seed.js";

describe("metric calculations", () => {
  it("converts kg and jin through kg as the canonical analysis unit", () => {
    expect(weightToKg(144, "jin")).toBe(72);
    expect(weightToKg(72, "kg")).toBe(72);
    expect(kgToUnit(72, "jin")).toBe(144);
  });

  it("calculates BMI from height and canonical kg weight", () => {
    expect(bmiFor(72.3, 178)?.toFixed(1)).toBe("22.8");
  });

  it("computes current, high, low, average, trend, goal distance, and BMI trend", () => {
    const state = createSeedMetricTrackerState("2026-05-25T08:30:00.000");
    const stats = computeWeightStats(state.records, state.profile);
    expect(stats.current?.id).toBe("mw_20260525");
    expect(stats.highest?.id).toBe("mw_20260507");
    expect(stats.lowest?.id).toBe("mw_20260525");
    expect(stats.averageKg?.toFixed(1)).toBe("73.4");
    expect(stats.trendKg?.toFixed(1)).toBe("-2.2");
    expect(stats.distanceToGoalKg?.toFixed(1)).toBe("2.3");
    expect(stats.bmiTrend).toBeLessThan(0);
  });

  it("filters records by a rolling date range", () => {
    const state = createSeedMetricTrackerState("2026-05-25T08:30:00.000");
    const range = rangeWindow("7d", new Date("2026-05-25T08:30:00"));
    expect(filterRecordsByRange(state.records, range).map((record) => record.id)).toEqual([
      "mw_20260525",
      "mw_20260523",
      "mw_20260521",
    ]);
  });

  it("filters records by the previous calendar month", () => {
    const state = createSeedMetricTrackerState("2026-05-25T08:30:00.000");
    const range = rangeWindow("lastMonth", new Date("2026-06-09T08:30:00"));
    expect(filterRecordsByRange(state.records, range).map((record) => record.id)).toEqual([
      "mw_20260525",
      "mw_20260523",
      "mw_20260521",
      "mw_20260518",
      "mw_20260516",
      "mw_20260514",
      "mw_20260511",
      "mw_20260509",
      "mw_20260507",
    ]);
  });
});
