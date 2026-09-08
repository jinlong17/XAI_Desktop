import { describe, it, expect } from "vitest";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { statisticsWebModuleRegistration } from "../registration.js";

describe("statisticsWebModuleRegistration (RE)", () => {
  it("RE1: satisfies WebModuleSlotRegistration type + has moduleId 'statistics'", () => {
    const reg: WebModuleSlotRegistration = statisticsWebModuleRegistration;
    expect(reg).toBeDefined();
    expect(statisticsWebModuleRegistration.moduleId).toBe("statistics");
  });

  it("RE2: railOrder, icon, i18nKey, showInRail per design", () => {
    expect(statisticsWebModuleRegistration.railOrder).toBe(11);
    expect(statisticsWebModuleRegistration.icon).toBe("chart");
    expect(statisticsWebModuleRegistration.i18nKey).toBe("nav.statistics");
    expect(statisticsWebModuleRegistration.showInRail).toBe(true);
  });

  it("RE3: defaultChildPath + 2 children with render functions", () => {
    expect(statisticsWebModuleRegistration.defaultChildPath).toBe("");
    expect(statisticsWebModuleRegistration.children).toHaveLength(2);
    const paths = statisticsWebModuleRegistration.children.map((c) => c.path);
    expect(paths).toContain("");
    expect(paths).toContain("*");
    for (const child of statisticsWebModuleRegistration.children) {
      expect(typeof child.render).toBe("function");
    }
  });

  it("RE4: label is 'Statistics'", () => {
    expect(statisticsWebModuleRegistration.label).toBe("Statistics");
  });
});
