import { describe, expect, it } from "vitest";
import { timeTrackerWebModuleRegistration } from "../registration.js";

describe("timeTrackerWebModuleRegistration", () => {
  it("registers timetrack as a rail-visible module", () => {
    expect(timeTrackerWebModuleRegistration.moduleId).toBe("timetrack");
    expect(timeTrackerWebModuleRegistration.i18nKey).toBe("nav.timetrack");
    expect(timeTrackerWebModuleRegistration.showInRail).toBe(true);
    expect(timeTrackerWebModuleRegistration.children[0]?.render).toBeTypeOf("function");
  });
});
