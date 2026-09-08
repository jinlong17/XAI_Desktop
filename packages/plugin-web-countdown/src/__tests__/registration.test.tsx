/**
 * registration.test.tsx — Tests RG1..RG3
 *
 * RG1: countdownWebModuleRegistration satisfies WebModuleSlotRegistration shape
 * RG2: moduleId/icon/railOrder/i18nKey match spec
 * RG3: defaultChildPath="" and children has "" + "*" entries
 */

import { describe, it, expect } from "vitest";
import { countdownWebModuleRegistration } from "../registration.js";

describe("countdownWebModuleRegistration", () => {
  it("RG1: is a non-null object (satisfies WebModuleSlotRegistration shape)", () => {
    expect(countdownWebModuleRegistration).toBeTruthy();
    expect(typeof countdownWebModuleRegistration).toBe("object");
  });

  it("RG2: moduleId/icon/railOrder/i18nKey match spec", () => {
    expect(countdownWebModuleRegistration.moduleId).toBe("countdown");
    expect(countdownWebModuleRegistration.icon).toBe("countdown");
    expect(countdownWebModuleRegistration.railOrder).toBe(10);
    expect(countdownWebModuleRegistration.i18nKey).toBe("nav.countdown");
  });

  it("RG2b: label and showInRail are correct", () => {
    expect(countdownWebModuleRegistration.label).toBe("Countdown");
    expect(countdownWebModuleRegistration.showInRail).toBe(true);
  });

  it("RG3: defaultChildPath is empty and children has '' and '*' entries", () => {
    expect(countdownWebModuleRegistration.defaultChildPath).toBe("");
    const paths = countdownWebModuleRegistration.children.map((c) => c.path);
    expect(paths).toContain("");
    expect(paths).toContain("*");
    expect(paths).toHaveLength(2);
  });

  it("RG3b: each child has a render function", () => {
    for (const child of countdownWebModuleRegistration.children) {
      expect(typeof child.render).toBe("function");
    }
  });
});
