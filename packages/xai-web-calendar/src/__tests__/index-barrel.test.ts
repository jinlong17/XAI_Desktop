/**
 * Tests for src/index.ts public surface — AC-BARREL-1.
 */
import { describe, it, expect } from "vitest";
import * as pkg from "../index.js";

describe("index barrel", () => {
  it("AC-BARREL-1: exports CalendarModule + default + calendarSlotRegistration", () => {
    expect(typeof pkg.CalendarModule).toBe("function");
    expect(typeof pkg.default).toBe("function");
    expect(pkg.default).toBe(pkg.CalendarModule);
    expect(pkg.calendarSlotRegistration).toBeDefined();
    expect(pkg.calendarSlotRegistration.moduleId).toBe("calendar");
  });
});
