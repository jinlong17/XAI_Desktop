import { describe, it, expect } from "vitest";
import * as Barrel from "../index.js";

describe("index barrel — P2 surface (StatisticsModule; registration in P3)", () => {
  it("IB1: StatisticsModule is exported and is a function", () => {
    expect(typeof Barrel.StatisticsModule).toBe("function");
  });

  it("IB2: barrel does not expose internal helpers", () => {
    const exposed = Object.keys(Barrel as Record<string, unknown>);
    expect(exposed).not.toContain("isPomodoroSession");
    expect(exposed).not.toContain("aggregateRange");
    expect(exposed).not.toContain("trendPercent");
    expect(exposed).not.toContain("insightCopy");
    expect(exposed).not.toContain("heatmapCells");
    // The registration export lands in P3 — confirm it is NOT present yet.
    expect(exposed).not.toContain("statisticsWebModuleRegistration");
  });
});
