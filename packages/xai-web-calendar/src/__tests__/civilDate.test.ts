import { describe, expect, it } from "vitest";
import { isValidCivilDate } from "../internal/civilDate.js";

describe("isValidCivilDate", () => {
  it("accepts only real Gregorian calendar days", () => {
    expect(isValidCivilDate("2024-02-29")).toBe(true);
    expect(isValidCivilDate("2026-02-29")).toBe(false);
    expect(isValidCivilDate("2026-04-31")).toBe(false);
    expect(isValidCivilDate("2026-13-01")).toBe(false);
    expect(isValidCivilDate("2026-02-31")).toBe(false);
  });

  it("does not apply Date's 1900 offset to two-digit years in a four-digit key", () => {
    expect(isValidCivilDate("0004-02-29")).toBe(true);
    expect(isValidCivilDate("0001-02-29")).toBe(false);
    expect(isValidCivilDate("0000-02-29")).toBe(false);
  });
});
