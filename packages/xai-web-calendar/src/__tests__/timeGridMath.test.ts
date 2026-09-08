/**
 * Tests for internal/timeGridMath.ts.
 * AC-TGMATH-1..12 per test.md §8.
 */
import { describe, it, expect } from "vitest";
import {
  parseHHMM,
  hourToRow,
  rowsForBlock,
  dstHoursForDay,
  buildHourLabels,
  HOUR_HEIGHT_PX,
} from "../internal/timeGridMath.js";

describe("HOUR_HEIGHT_PX", () => {
  it("AC-TGMATH-1: is 48", () => {
    expect(HOUR_HEIGHT_PX).toBe(48);
  });
});

describe("parseHHMM", () => {
  it("AC-TGMATH-2: parses valid HH:MM", () => {
    expect(parseHHMM("09:00")).toEqual({ hours: 9, minutes: 0 });
    expect(parseHHMM("14:15")).toEqual({ hours: 14, minutes: 15 });
    expect(parseHHMM("23:59")).toEqual({ hours: 23, minutes: 59 });
    expect(parseHHMM("00:00")).toEqual({ hours: 0, minutes: 0 });
  });

  it("AC-TGMATH-3: returns null on malformed", () => {
    expect(parseHHMM("")).toBeNull();
    expect(parseHHMM("9:00")).not.toBeNull(); // single digit hours is fine
    expect(parseHHMM("25:00")).toBeNull(); // hours out of range
    expect(parseHHMM("09:60")).toBeNull(); // minutes out of range
    expect(parseHHMM("not-a-time")).toBeNull();
  });
});

describe("hourToRow", () => {
  it("AC-TGMATH-4: whole hours map to integer rows", () => {
    expect(hourToRow(0, 0)).toBe(0);
    expect(hourToRow(9, 0)).toBe(9);
    expect(hourToRow(23, 0)).toBe(23);
  });

  it("AC-TGMATH-5: minutes produce fractional rows", () => {
    expect(hourToRow(9, 15)).toBeCloseTo(9.25);
    expect(hourToRow(14, 30)).toBeCloseTo(14.5);
  });

  it("AC-TGMATH-6: spring-forward DST shifts rows after 03:00 down by 1", () => {
    const dst = { kind: "spring-forward" as const, atRow: 1 };
    // Before 03:00: no shift
    expect(hourToRow(1, 0, dst)).toBe(1);
    expect(hourToRow(2, 59, dst)).toBeCloseTo(2 + 59 / 60);
    // 03:00 and beyond: subtract 1
    expect(hourToRow(3, 0, dst)).toBe(2); // 3 - 1 = 2
    expect(hourToRow(14, 0, dst)).toBe(13);
  });
});

describe("rowsForBlock", () => {
  it("AC-TGMATH-7: missing endTime → 1 row", () => {
    expect(rowsForBlock("09:00", undefined)).toBe(1);
    expect(rowsForBlock("14:15", undefined)).toBe(1);
  });

  it("AC-TGMATH-8: exact hour span", () => {
    expect(rowsForBlock("09:00", "11:00")).toBe(2);
    expect(rowsForBlock("14:00", "16:30")).toBeCloseTo(2.5);
  });

  it("AC-TGMATH-9: past-midnight guard (end ≤ start) → 1 row", () => {
    expect(rowsForBlock("23:00", "01:00")).toBe(1);
    expect(rowsForBlock("09:00", "09:00")).toBe(1);
  });

  it("AC-TGMATH-10: malformed endTime → 1 row", () => {
    expect(rowsForBlock("09:00", "not-a-time")).toBe(1);
  });
});

describe("dstHoursForDay", () => {
  it("AC-TGMATH-11: spring-forward 2026-03-08 → 23 rows", () => {
    const r = dstHoursForDay("2026-03-08");
    expect(r.hours).toBe(23);
    expect(r.shift?.kind).toBe("spring-forward");
  });

  it("AC-TGMATH-12: fall-back 2026-11-01 → 25 rows", () => {
    const r = dstHoursForDay("2026-11-01");
    expect(r.hours).toBe(25);
    expect(r.shift?.kind).toBe("fall-back");
  });

  it("standard day → 24 rows, no shift", () => {
    const r = dstHoursForDay("2026-05-22");
    expect(r.hours).toBe(24);
    expect(r.shift).toBeUndefined();
  });
});

describe("buildHourLabels", () => {
  it("standard day has exactly 24 labels", () => {
    const labels = buildHourLabels("2026-05-22");
    expect(labels).toHaveLength(24);
    expect(labels[0]?.label).toBe("00");
    expect(labels[23]?.label).toBe("23");
    expect(labels.every((l) => !l.isDst)).toBe(true);
  });

  it("spring-forward day has 24 entries (23 real + 1 DST marker)", () => {
    const labels = buildHourLabels("2026-03-08");
    expect(labels).toHaveLength(24);
    expect(labels.some((l) => l.isDst)).toBe(true);
    expect(labels.some((l) => l.label === "02")).toBe(false); // 02:00 skipped
  });

  it("fall-back day has 25 entries (24 real + 1 extra)", () => {
    const labels = buildHourLabels("2026-11-01");
    expect(labels).toHaveLength(25);
    expect(labels.some((l) => l.isDst)).toBe(true);
  });
});
