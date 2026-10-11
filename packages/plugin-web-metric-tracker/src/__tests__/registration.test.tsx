import { describe, expect, it } from "vitest";
import { metricTrackerWebModuleRegistration } from "../registration.js";

describe("metric tracker registration", () => {
  it("registers /app/metrics as a rail-visible Web module", () => {
    expect(metricTrackerWebModuleRegistration.moduleId).toBe("metrics");
    expect(metricTrackerWebModuleRegistration.icon).toBe("target");
    expect(metricTrackerWebModuleRegistration.i18nKey).toBe("nav.metrics");
    expect(metricTrackerWebModuleRegistration.showInRail).toBe(true);
    expect(metricTrackerWebModuleRegistration.children[0]!.render.name).not.toBe("ModuleRoutePlaceholderPage");
  });
});
