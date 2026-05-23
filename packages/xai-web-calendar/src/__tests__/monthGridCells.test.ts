/**
 * Tests for internal/monthGridCells.ts — AC-GRID-1..7.
 */
import { describe, it, expect } from "vitest";
import { monthGridCells } from "../internal/monthGridCells.js";

describe("monthGridCells", () => {
  it("AC-GRID-1: May 2026 Sunday-first → 42 cells (6 rows; May 1 is Fri, leading pad 5)", () => {
    const cells = monthGridCells(2026, 5, 0);
    expect(cells).toHaveLength(42);
    expect(cells[0]).toMatchObject({
      d: 26,
      year: 2026,
      month: 4,
      inMonth: false,
      dateKey: "2026-04-26",
    });
    expect(cells[0]?.weekNum).toBe(17);
  });

  it("AC-GRID-2: May 2026 Monday-first → 35 cells, first cell = Apr 27", () => {
    const cells = monthGridCells(2026, 5, 1);
    expect(cells).toHaveLength(35);
    expect(cells[0]).toMatchObject({
      d: 27,
      year: 2026,
      month: 4,
      inMonth: false,
      dateKey: "2026-04-27",
    });
    expect(cells[0]?.weekNum).toBe(18);
  });

  it("AC-GRID-3: Aug 2026 Sunday-first → 42 cells (6 rows)", () => {
    const cells = monthGridCells(2026, 8, 0);
    expect(cells).toHaveLength(42);
  });

  it("AC-GRID-4: Feb 2024 (leap) Sunday-first → 35 cells", () => {
    const cells = monthGridCells(2024, 2, 0);
    expect(cells).toHaveLength(35);
    // Feb 2024: Feb 1 = Thursday → leading pad = 4 (Sun..Wed Jan).
    const inMonthCells = cells.filter((c) => c.inMonth);
    expect(inMonthCells).toHaveLength(29); // leap day
  });

  it("AC-GRID-5: Pad cells flagged inMonth: false", () => {
    const cells = monthGridCells(2026, 5, 0);
    const padCells = cells.filter((c) => !c.inMonth);
    expect(padCells.length).toBeGreaterThan(0);
    padCells.forEach((c) => {
      expect(c.month).not.toBe(5);
    });
    const inMonth = cells.filter((c) => c.inMonth);
    expect(inMonth).toHaveLength(31);
    inMonth.forEach((c) => {
      expect(c.year).toBe(2026);
      expect(c.month).toBe(5);
    });
  });

  it("AC-GRID-6: weekNum populated only on column 0", () => {
    const cells = monthGridCells(2026, 5, 0);
    for (let i = 0; i < cells.length; i++) {
      if (i % 7 === 0) {
        expect(cells[i]?.weekNum).toBeDefined();
      } else {
        expect(cells[i]?.weekNum).toBeUndefined();
      }
    }
  });

  it("AC-GRID-7: holidayKey attached on May 1 + May 9", () => {
    const cells = monthGridCells(2026, 5, 0);
    const may1 = cells.find((c) => c.dateKey === "2026-05-01");
    const may9 = cells.find((c) => c.dateKey === "2026-05-09");
    expect(may1?.holidayKey).toBe("cal.holiday_mayday");
    expect(may9?.holidayKey).toBe("cal.holiday_mothers_day");
  });

  it("Year rollover: Jan 2027 Sunday-first → first cells in Dec 2026", () => {
    const cells = monthGridCells(2027, 1, 0);
    expect(cells[0]?.year).toBe(2026);
    expect(cells[0]?.month).toBe(12);
  });

  it("Year rollover: Dec 2026 Sunday-first → trailing cells in Jan 2027", () => {
    const cells = monthGridCells(2026, 12, 0);
    const trailing = cells.filter((c) => !c.inMonth && c.year === 2027);
    expect(trailing.length).toBeGreaterThan(0);
    trailing.forEach((c) => {
      expect(c.month).toBe(1);
    });
  });
});
