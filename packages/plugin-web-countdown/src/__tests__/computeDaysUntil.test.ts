/**
 * computeDaysUntil.test.ts — Tests C1..C12
 *
 * C1: today → 0
 * C2: tomorrow → 1
 * C3: yesterday → -1
 * C4: +N days
 * C5: DST forward boundary (US spring forward 2026-03-08)
 * C6: DST backward boundary (US fall back 2026-11-01)
 * C7: leap day (2024-02-29 to 2024-03-01)
 * C8: year boundary (2026-12-31 to 2027-01-01)
 * C9: target_date = "" → NaN
 * C10: target_date = "not-a-date" → NaN
 * C11: target_date with slashes → NaN
 * C12: invalid ISO string → NaN
 */

import { describe, it, expect } from "vitest";
import { computeDaysUntil } from "../internal/computeDaysUntil.js";

describe("computeDaysUntil", () => {
  it("C1: today returns 0", () => {
    const now = new Date(2026, 4, 23, 14, 30, 0); // 2026-05-23 14:30
    expect(computeDaysUntil("2026-05-23", now)).toBe(0);
  });

  it("C2: tomorrow returns 1", () => {
    const now = new Date(2026, 4, 23, 14, 30, 0);
    expect(computeDaysUntil("2026-05-24", now)).toBe(1);
  });

  it("C3: yesterday returns -1", () => {
    const now = new Date(2026, 4, 23, 14, 30, 0);
    expect(computeDaysUntil("2026-05-22", now)).toBe(-1);
  });

  it("C4: +7 days", () => {
    const now = new Date(2026, 4, 23, 14, 30, 0);
    expect(computeDaysUntil("2026-05-30", now)).toBe(7);
  });

  it("C4b: -7 days", () => {
    const now = new Date(2026, 4, 23, 14, 30, 0);
    expect(computeDaysUntil("2026-05-16", now)).toBe(-7);
  });

  // DST forward: US 2026-03-08 clocks spring forward at 2am (lose 1 hour)
  it("C5: DST forward (2026-03-07 → 2026-03-08) = 1 day", () => {
    const now = new Date(2026, 2, 7, 12, 0, 0); // 2026-03-07 noon
    expect(computeDaysUntil("2026-03-08", now)).toBe(1);
  });

  // DST backward: US 2026-11-01 clocks fall back at 2am (gain 1 hour)
  it("C6: DST backward (2026-10-31 → 2026-11-01) = 1 day", () => {
    const now = new Date(2026, 9, 31, 12, 0, 0); // 2026-10-31 noon
    expect(computeDaysUntil("2026-11-01", now)).toBe(1);
  });

  // Leap day
  it("C7: 2024-02-29 to 2024-03-01 = 1 day", () => {
    const now = new Date(2024, 1, 29, 12, 0, 0); // 2024-02-29 noon
    expect(computeDaysUntil("2024-03-01", now)).toBe(1);
  });

  // Year boundary
  it("C8: 2026-12-31 to 2027-01-01 = 1 day", () => {
    const now = new Date(2026, 11, 31, 12, 0, 0); // 2026-12-31 noon
    expect(computeDaysUntil("2027-01-01", now)).toBe(1);
  });

  it("C9: empty string → NaN", () => {
    expect(computeDaysUntil("", new Date())).toBeNaN();
  });

  it("C10: 'not-a-date' → NaN", () => {
    expect(computeDaysUntil("not-a-date", new Date())).toBeNaN();
  });

  it("C11: slash-separated date → NaN", () => {
    expect(computeDaysUntil("2026/05/23", new Date())).toBeNaN();
  });

  it("C12: incomplete ISO string → NaN", () => {
    expect(computeDaysUntil("2026-05", new Date())).toBeNaN();
  });

  it("large positive delta", () => {
    const now = new Date(2026, 4, 23, 14, 30, 0);
    expect(computeDaysUntil("2030-05-23", now)).toBe(365 * 4 + 1); // +4 years with 1 leap day (2028)
  });
});
