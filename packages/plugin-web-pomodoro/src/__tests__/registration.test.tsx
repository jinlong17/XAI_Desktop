/**
 * RG1..RG3 — pomodoroWebModuleRegistration shape tests.
 * test.md §2
 */

import { describe, it, expect } from "vitest";
import { pomodoroWebModuleRegistration } from "../registration.js";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";

describe("pomodoroWebModuleRegistration", () => {
  // RG1: satisfies WebModuleSlotRegistration type (compile-time + runtime shape)
  it("RG1: satisfies WebModuleSlotRegistration type", () => {
    // Compile-time: assignment below would fail if shape doesn't match
    const reg: WebModuleSlotRegistration = pomodoroWebModuleRegistration;
    expect(reg).toBeDefined();
  });

  // RG2: moduleId/icon/railOrder/i18nKey match api.md §3.1
  it("RG2: moduleId, icon, railOrder, i18nKey match api.md §3.1", () => {
    expect(pomodoroWebModuleRegistration.moduleId).toBe("pomodoro");
    expect(pomodoroWebModuleRegistration.icon).toBe("timer");
    expect(pomodoroWebModuleRegistration.railOrder).toBe(7);
    expect(pomodoroWebModuleRegistration.i18nKey).toBe("nav.pomodoro");
    expect(pomodoroWebModuleRegistration.showInRail).toBe(true);
    expect(pomodoroWebModuleRegistration.label).toBe("Pomodoro");
  });

  // RG3: defaultChildPath === "" and children has "" + "*" entries
  it("RG3: defaultChildPath empty, children has 2 entries with '' and '*'", () => {
    expect(pomodoroWebModuleRegistration.defaultChildPath).toBe("");
    expect(pomodoroWebModuleRegistration.children).toHaveLength(2);
    const paths = pomodoroWebModuleRegistration.children.map((c) => c.path);
    expect(paths).toContain("");
    expect(paths).toContain("*");
  });
});
