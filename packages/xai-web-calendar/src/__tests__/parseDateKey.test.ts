/**
 * Tests for internal/parseDateKey.ts.
 * AC-PARSE-1..6 per test.md §8.
 */
import { describe, it, expect } from "vitest";
import {
  parseDateKey,
  tryParseDateKey,
  formatDateKey,
  dateKeyMonth,
  stepDateKey,
} from "../internal/parseDateKey.js";

describe("parseDateKey", () => {
  it("AC-PARSE-1: valid date parses correctly", () => {
    const r = parseDateKey("2026-05-22");
    expect(r).toEqual({ year: 2026, month: 5, day: 22 });
  });

  it("AC-PARSE-2: malformed (missing part) throws", () => {
    expect(() => parseDateKey("2026-05")).toThrow();
  });

  it("AC-PARSE-3: out-of-range month throws", () => {
    expect(() => parseDateKey("2026-13-01")).toThrow(/month out of range/);
  });

  it("AC-PARSE-4: out-of-range day throws", () => {
    expect(() => parseDateKey("2026-05-32")).toThrow(/day out of range/);
  });

  it("AC-PARSE-5: leap-year Feb 29 is accepted", () => {
    // 2024 is a leap year
    const r = parseDateKey("2024-02-29");
    expect(r).toEqual({ year: 2024, month: 2, day: 29 });
  });

  it("AC-PARSE-6: tryParseDateKey returns null on malformed", () => {
    expect(tryParseDateKey("not-a-date")).toBeNull();
    expect(tryParseDateKey("")).toBeNull();
    expect(tryParseDateKey("2026-13-01")).toBeNull();
  });

  it("tryParseDateKey returns parts on valid input", () => {
    expect(tryParseDateKey("2026-05-22")).toEqual({ year: 2026, month: 5, day: 22 });
  });
});

describe("formatDateKey", () => {
  it("pads single-digit month and day", () => {
    expect(formatDateKey(2026, 1, 5)).toBe("2026-01-05");
  });

  it("round-trips with parseDateKey", () => {
    const parts = parseDateKey("2026-11-30");
    expect(formatDateKey(parts.year, parts.month, parts.day)).toBe("2026-11-30");
  });
});

describe("dateKeyMonth", () => {
  it("extracts year+month from a date key", () => {
    expect(dateKeyMonth("2026-05-22")).toEqual({ year: 2026, month: 5 });
  });
});

describe("stepDateKey", () => {
  it("advances forward by days", () => {
    expect(stepDateKey("2026-05-22", 1)).toBe("2026-05-23");
    expect(stepDateKey("2026-05-22", 7)).toBe("2026-05-29");
  });

  it("steps backward by days", () => {
    expect(stepDateKey("2026-05-22", -1)).toBe("2026-05-21");
    expect(stepDateKey("2026-05-01", -1)).toBe("2026-04-30");
  });

  it("handles month rollover forward", () => {
    expect(stepDateKey("2026-05-31", 1)).toBe("2026-06-01");
  });

  it("handles year rollover forward", () => {
    expect(stepDateKey("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("handles year rollover backward", () => {
    expect(stepDateKey("2026-01-01", -1)).toBe("2025-12-31");
  });
});
