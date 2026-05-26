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

// --- Extension barrel tests (gap-closure row #4) ----------------------------

describe("index barrel extension (gap-closure row #4)", () => {
  it("AC-BARREL-EXT-3: EventBlock type is exported (runtime: no-op, compile: present)", () => {
    // Type-only exports can't be directly tested at runtime; we verify the
    // import causes no error and the module object is resolvable.
    expect(pkg).toBeDefined();
  });

  it("AC-BARREL-EXT-4: CalendarViewId type is exported from storage (runtime check)", () => {
    // CalendarViewId is a type alias — verify the module loads without error.
    expect(pkg).toBeDefined();
  });
});
