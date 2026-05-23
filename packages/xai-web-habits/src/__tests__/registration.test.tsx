/**
 * AC-SHELL-1..2: habitsSlotRegistration shape and render.
 */
import { describe, it, expect } from "vitest";
import { habitsSlotRegistration } from "../registration.js";

describe("habitsSlotRegistration", () => {
  it("AC-SHELL-1: has expected field values", () => {
    expect(habitsSlotRegistration.moduleId).toBe("habits");
    expect(habitsSlotRegistration.label).toBe("Habits");
    expect(habitsSlotRegistration.defaultChildPath).toBe("");
    expect(habitsSlotRegistration.icon).toBe("pin");
    expect(habitsSlotRegistration.railOrder).toBe(8);
    expect(habitsSlotRegistration.i18nKey).toBe("nav.habits");
    expect(habitsSlotRegistration.showInRail).toBe(true);
  });

  it("AC-SHELL-1: children array has two entries with correct paths", () => {
    expect(habitsSlotRegistration.children).toHaveLength(2);
    expect(habitsSlotRegistration.children[0]?.path).toBe("");
    expect(habitsSlotRegistration.children[1]?.path).toBe("*");
  });

  it("AC-SHELL-2: children[0].render is a function", () => {
    expect(typeof habitsSlotRegistration.children[0]?.render).toBe("function");
  });

  it("AC-SHELL-2: children[1].render is a function", () => {
    expect(typeof habitsSlotRegistration.children[1]?.render).toBe("function");
  });
});
