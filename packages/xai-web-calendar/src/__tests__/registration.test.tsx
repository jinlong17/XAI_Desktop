/**
 * Tests for registration.tsx slot — AC-SHELL-1, AC-SHELL-2.
 */
import { describe, it, expect } from "vitest";
import { calendarSlotRegistration } from "../registration.js";

describe("calendarSlotRegistration", () => {
  it("AC-SHELL-1: shape matches WebModuleSlotRegistration", () => {
    expect(calendarSlotRegistration.moduleId).toBe("calendar");
    expect(calendarSlotRegistration.label).toBe("Calendar");
    expect(calendarSlotRegistration.defaultChildPath).toBe("");
    expect(calendarSlotRegistration.icon).toBe("calendar");
    expect(calendarSlotRegistration.railOrder).toBe(5);
    expect(calendarSlotRegistration.i18nKey).toBe("nav.calendar");
    expect(calendarSlotRegistration.showInRail).toBe(true);
    expect(calendarSlotRegistration.children).toHaveLength(2);
    expect(calendarSlotRegistration.children?.[0]?.path).toBe("");
    expect(calendarSlotRegistration.children?.[1]?.path).toBe("*");
  });

  it("AC-SHELL-2: child render functions are defined", () => {
    expect(typeof calendarSlotRegistration.children?.[0]?.render).toBe("function");
    expect(typeof calendarSlotRegistration.children?.[1]?.render).toBe("function");
  });
});
