/**
 * formatTargetLabel.test.ts — Tests F1..F5
 *
 * F1: same year → "M/D" (e.g. "10/1" for 2026-10-01 when now=2026)
 * F2: cross year → "M/D/YY" (e.g. "1/15/27" for 2027-01-15 when now=2026)
 * F3: single-digit month and day in same-year format
 * F4: EN and ZH produce the same format string (language-neutral)
 * F5: invalid date string returned as-is
 */

import { describe, it, expect } from "vitest";
import { formatTargetLabel } from "../internal/formatTargetLabel.js";

// Test setup: vitest.setup.ts sets systemTime to 2026-05-23 — so current year = 2026

describe("formatTargetLabel", () => {
  it("F1: same year → M/D", () => {
    // 2026-10-01 when now is 2026
    expect(formatTargetLabel("2026-10-01", "en")).toBe("10/1");
  });

  it("F2: cross year → M/D/YY", () => {
    // 2027-01-15 when now is 2026
    expect(formatTargetLabel("2027-01-15", "en")).toBe("1/15/27");
  });

  it("F3: single-digit month + day in same-year", () => {
    expect(formatTargetLabel("2026-05-05", "en")).toBe("5/5");
  });

  it("F4: EN and ZH produce the same output (language-neutral format)", () => {
    const en = formatTargetLabel("2026-12-25", "en");
    const zh = formatTargetLabel("2026-12-25", "zh");
    expect(en).toBe(zh);
    expect(en).toBe("12/25");
  });

  it("F5: invalid date string returned as-is", () => {
    expect(formatTargetLabel("not-a-date", "en")).toBe("not-a-date");
    expect(formatTargetLabel("", "en")).toBe("");
  });

  it("past year → M/D/YY with two-digit year", () => {
    expect(formatTargetLabel("2020-02-20", "en")).toBe("2/20/20");
  });

  it("same year december", () => {
    expect(formatTargetLabel("2026-12-31", "en")).toBe("12/31");
  });
});
