/**
 * Tests for internal/placeEventBlocks.ts.
 * AC-PLACE-1..10 per test.md §8.
 */
import { describe, it, expect } from "vitest";
import { placeEventBlocks } from "../internal/placeEventBlocks.js";
import type { CalEvent } from "../internal/sampleEvents.js";

const DATE = "2026-05-22"; // standard 24-hour day

describe("placeEventBlocks", () => {
  it("AC-PLACE-1: empty events → empty array", () => {
    expect(placeEventBlocks([], DATE)).toEqual([]);
  });

  it("AC-PLACE-2: single timed event placed at correct row", () => {
    const events: CalEvent[] = [
      { c: "mint", t: { en: "Meeting", zh: "会议" }, time: "09:00" },
    ];
    const blocks = placeEventBlocks(events, DATE);
    const timed = blocks.filter((b) => !b.allDay);
    expect(timed).toHaveLength(1);
    expect(timed[0]?.startRow).toBeCloseTo(9);
    expect(timed[0]?.rowSpan).toBe(1); // no endTime → 1 hour
    expect(timed[0]?.col).toBe(0);
    expect(timed[0]?.colSpan).toBe(1);
  });

  it("AC-PLACE-3: two non-overlapping events get col 0", () => {
    const events: CalEvent[] = [
      { c: "mint", t: { en: "A", zh: "A" }, time: "09:00" },
      { c: "amber", t: { en: "B", zh: "B" }, time: "11:00" },
    ];
    const blocks = placeEventBlocks(events, DATE).filter((b) => !b.allDay);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.col).toBe(0);
    expect(blocks[1]?.col).toBe(0);
  });

  it("AC-PLACE-4: two overlapping events get different cols", () => {
    const events: CalEvent[] = [
      { c: "mint", t: { en: "A", zh: "A" }, time: "09:00", endTime: "11:00" },
      { c: "amber", t: { en: "B", zh: "B" }, time: "09:30", endTime: "11:00" },
    ] as CalEvent[];
    const blocks = placeEventBlocks(events, DATE).filter((b) => !b.allDay);
    expect(blocks).toHaveLength(2);
    const cols = blocks.map((b) => b.col).sort();
    expect(cols).toEqual([0, 1]);
    // colSpan should be 2 (total cols)
    expect(blocks.every((b) => b.colSpan === 2)).toBe(true);
  });

  it("AC-PLACE-5: three overlapping events get cols 0, 1, 2", () => {
    const events: CalEvent[] = [
      { c: "mint", t: { en: "A", zh: "A" }, time: "10:00", endTime: "12:00" },
      { c: "amber", t: { en: "B", zh: "B" }, time: "10:15", endTime: "12:00" },
      { c: "blue", t: { en: "C", zh: "C" }, time: "10:30", endTime: "12:00" },
    ] as CalEvent[];
    const blocks = placeEventBlocks(events, DATE).filter((b) => !b.allDay);
    expect(blocks).toHaveLength(3);
    const cols = blocks.map((b) => b.col).sort();
    expect(cols).toEqual([0, 1, 2]);
    expect(blocks.every((b) => b.colSpan === 3)).toBe(true);
  });

  it("AC-PLACE-6: all-day events (no time) marked allDay=true, not in hour rows", () => {
    const events: CalEvent[] = [
      { c: "mint", t: { en: "Holiday", zh: "节假日" } },
      { c: "amber", t: { en: "Birthday", zh: "生日" } },
    ];
    const blocks = placeEventBlocks(events, DATE);
    expect(blocks.every((b) => b.allDay)).toBe(true);
    expect(blocks[0]?.startRow).toBe(0);
    expect(blocks[0]?.rowSpan).toBe(0);
  });

  it("AC-PLACE-7: mixed all-day + timed events separated correctly", () => {
    const events: CalEvent[] = [
      { c: "mint", t: { en: "Holiday", zh: "节假日" } },
      { c: "amber", t: { en: "Meeting", zh: "会议" }, time: "14:00" },
    ];
    const blocks = placeEventBlocks(events, DATE);
    const allDay = blocks.filter((b) => b.allDay);
    const timed = blocks.filter((b) => !b.allDay);
    expect(allDay).toHaveLength(1);
    expect(timed).toHaveLength(1);
    expect(timed[0]?.startRow).toBeCloseTo(14);
  });

  it("AC-PLACE-8: endTime multi-hour block has correct rowSpan", () => {
    const events: CalEvent[] = [
      { c: "mint", t: { en: "Long Meeting", zh: "长会议" }, time: "09:00", endTime: "11:00" },
    ] as CalEvent[];
    const blocks = placeEventBlocks(events, DATE).filter((b) => !b.allDay);
    expect(blocks[0]?.rowSpan).toBeCloseTo(2);
  });

  it("AC-PLACE-9: missing endTime on CalEvent → 1-hour block", () => {
    const events: CalEvent[] = [
      { c: "mint", t: { en: "Task", zh: "任务" }, time: "11:00" },
    ];
    const blocks = placeEventBlocks(events, DATE).filter((b) => !b.allDay);
    expect(blocks[0]?.rowSpan).toBe(1);
  });

  it("AC-PLACE-10: null/undefined events input → empty array", () => {
    expect(placeEventBlocks(null as unknown as CalEvent[], DATE)).toEqual([]);
    expect(placeEventBlocks(undefined as unknown as CalEvent[], DATE)).toEqual([]);
  });
});
