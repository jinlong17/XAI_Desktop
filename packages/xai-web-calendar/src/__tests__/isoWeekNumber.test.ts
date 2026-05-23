/**
 * Tests for internal/isoWeekNumber.ts — AC-ISO-1..4.
 */
import { describe, it, expect } from "vitest";
import { isoWeekNumber } from "../internal/isoWeekNumber.js";

describe("isoWeekNumber", () => {
  it("AC-ISO-1: Apr 27 2026 (Mon) → W18", () => {
    expect(isoWeekNumber(new Date(Date.UTC(2026, 3, 27)))).toBe(18);
  });

  it("AC-ISO-2: Jan 1 2026 (Thu) → week 1", () => {
    expect(isoWeekNumber(new Date(Date.UTC(2026, 0, 1)))).toBe(1);
  });

  it("AC-ISO-3: Dec 31 2026 (Thu) → week 53", () => {
    expect(isoWeekNumber(new Date(Date.UTC(2026, 11, 31)))).toBe(53);
  });

  it("AC-ISO-4: Jan 1 2023 (Sun) → week 52 of 2022", () => {
    expect(isoWeekNumber(new Date(Date.UTC(2023, 0, 1)))).toBe(52);
  });

  it("May 2026 weeks (Mon-first labels W18..W22)", () => {
    expect(isoWeekNumber(new Date(Date.UTC(2026, 3, 27)))).toBe(18); // Apr 27 Mon
    expect(isoWeekNumber(new Date(Date.UTC(2026, 4, 4)))).toBe(19);  // May 4 Mon
    expect(isoWeekNumber(new Date(Date.UTC(2026, 4, 11)))).toBe(20); // May 11 Mon
    expect(isoWeekNumber(new Date(Date.UTC(2026, 4, 18)))).toBe(21); // May 18 Mon
    expect(isoWeekNumber(new Date(Date.UTC(2026, 4, 25)))).toBe(22); // May 25 Mon
  });

  it("Sundays in May 2026 belong to the week of the preceding Mon", () => {
    expect(isoWeekNumber(new Date(Date.UTC(2026, 4, 3)))).toBe(18); // May 3 Sun → W18
    expect(isoWeekNumber(new Date(Date.UTC(2026, 4, 10)))).toBe(19); // May 10 Sun → W19
  });
});
