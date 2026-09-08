import { describe, expect, it } from "vitest";
import { metricsAdapter } from "../../adapters/metrics.js";

describe("metrics adapter", () => {
  it("returns module jump on empty query", () => {
    const hits = metricsAdapter("", {});
    expect(hits).toHaveLength(1);
    expect(hits[0]!.moduleId).toBe("metrics");
  });

  it("matches weight, BMI, and Chinese aliases", () => {
    expect(metricsAdapter("weight", {})).toHaveLength(1);
    expect(metricsAdapter("bmi", {})).toHaveLength(1);
    expect(metricsAdapter("体重", {})).toHaveLength(1);
    expect(metricsAdapter("指标", {})).toHaveLength(1);
  });

  it("ignores unrelated queries", () => {
    expect(metricsAdapter("xyznotmatched", {})).toHaveLength(0);
  });
});
