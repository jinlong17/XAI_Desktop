import { describe, it, expect } from "vitest";
import * as Barrel from "../index.js";

describe("index barrel — P3 surface (StatisticsModule + statisticsWebModuleRegistration)", () => {
  it("IB1: StatisticsModule is exported and is a function", () => {
    expect(typeof Barrel.StatisticsModule).toBe("function");
  });

  it("IB2: statisticsWebModuleRegistration is exported and shaped correctly", () => {
    expect(Barrel.statisticsWebModuleRegistration).toBeDefined();
    expect(Barrel.statisticsWebModuleRegistration.moduleId).toBe("statistics");
  });

  it("IB3: barrel does not expose internal helpers", () => {
    const exposed = Object.keys(Barrel as Record<string, unknown>);
    expect(exposed).not.toContain("isPomodoroSession");
    expect(exposed).not.toContain("aggregateRange");
    expect(exposed).not.toContain("trendPercent");
    expect(exposed).not.toContain("insightCopy");
    expect(exposed).not.toContain("heatmapCells");
  });
});
