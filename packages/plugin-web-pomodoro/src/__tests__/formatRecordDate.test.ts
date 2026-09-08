/**
 * FR1..FR6 — formatRecordDate tests.
 * test.md §2
 */

import { describe, it, expect } from "vitest";
import { formatRecordDate } from "../internal/formatRecordDate.js";

// vitest.setup.ts sets system time to 2026-05-23 14:30 local
const TODAY = "2026-05-23";
const YESTERDAY = "2026-05-22";
const TWO_DAYS_AGO = "2026-05-21";

describe("formatRecordDate", () => {
  // FR1: today (en)
  it("FR1: today → 'Today' (en)", () => {
    expect(formatRecordDate(TODAY, "en", TODAY)).toBe("Today");
  });

  // FR2: today (zh)
  it("FR2: today → '今天' (zh)", () => {
    expect(formatRecordDate(TODAY, "zh", TODAY)).toBe("今天");
  });

  // FR3: yesterday (en)
  it("FR3: yesterday → 'Yesterday' (en)", () => {
    expect(formatRecordDate(YESTERDAY, "en", TODAY)).toBe("Yesterday");
  });

  // FR4: yesterday (zh)
  it("FR4: yesterday → '昨天' (zh)", () => {
    expect(formatRecordDate(YESTERDAY, "zh", TODAY)).toBe("昨天");
  });

  // FR5: older date (en) → "5/21"
  it("FR5: two days ago → '5/21' (en)", () => {
    expect(formatRecordDate(TWO_DAYS_AGO, "en", TODAY)).toBe("5/21");
  });

  // FR6: older date (zh) → "5月21日"
  it("FR6: two days ago → '5月21日' (zh)", () => {
    expect(formatRecordDate(TWO_DAYS_AGO, "zh", TODAY)).toBe("5月21日");
  });

  // Extra: cross-year
  it("cross-year handled (en)", () => {
    expect(formatRecordDate("2025-12-01", "en", TODAY)).toBe("12/1");
  });
  it("cross-year handled (zh)", () => {
    expect(formatRecordDate("2025-12-01", "zh", TODAY)).toBe("12月1日");
  });
});
