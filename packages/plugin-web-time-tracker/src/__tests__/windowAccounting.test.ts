import { describe, expect, it } from "vitest";
import { createTimeTrackerEntry } from "../internal/storage.js";
import { accountingSegments, entriesInWindow, entriesOnDay, entryDayTotals, entryDuration, entryHourTotals, sourceEntry } from "../internal/time.js";

const minute = 60_000;
const at = (text: string) => new Date(text).getTime();
const make = (start: number, end: number | null) => createTimeTrackerEntry("cat_work", null, start, end, { en: "source", zh: "原记录" });

describe("window accounting projections", () => {
  it("intersects each pause segment, caps future ends, and preserves original identity/bytes", () => {
    const source = { ...make(0, 10 * minute), segments: [{ start: 0, end: 10 * minute }, { start: 30 * minute, end: 70 * minute }] };
    const before = JSON.stringify(source);
    const [view] = entriesInWindow([source], 5 * minute, 80 * minute, 60 * minute);
    expect(view).toBeDefined();
    expect(entryDuration(view!, 60 * minute)).toBe(35 * minute);
    expect(accountingSegments(view!, 60 * minute)).toEqual([{ start: 5 * minute, end: 10 * minute }, { start: 30 * minute, end: 60 * minute }]);
    expect(sourceEntry(view!)).toBe(source);
    expect(view!.segments).toBe(source.segments);
    expect(JSON.stringify(view)).toBe(before);
    expect(JSON.stringify(source)).toBe(before);
  });
  it("nested windows cannot widen the original report range", () => {
    const source = make(0, 100 * minute);
    const narrow = entriesInWindow([source], 10 * minute, 20 * minute, 100 * minute);
    const [view] = entriesInWindow(narrow, 0, 100 * minute, 100 * minute);
    expect(entryDuration(view!, 100 * minute)).toBe(10 * minute);
    expect(sourceEntry(view!)).toBe(source);
  });
  it("half-open edges and future/invalid/reversed segments contribute nothing", () => {
    const entries = [make(0, 10), make(20, 30), make(15, 12), make(Number.NaN, 20), make(11, Number.POSITIVE_INFINITY), make(10, 10)];
    expect(entriesInWindow(entries, 10, 20, 20)).toEqual([]);
    expect(entriesInWindow([make(30, null)], 0, 100, 20)).toEqual([]);
    expect(entriesInWindow([make(0, 100)], 20, 10, 100)).toEqual([]);
  });
  it("windowed hours conserve sub-minute precision across a clock-hour boundary", () => {
    const start = at("2026-05-01T10:59:30.250");
    const source = make(start, at("2026-05-01T11:00:30.750"));
    const hour = entryHourTotals(source, at("2026-05-01T12:00:00"));
    expect(hour[10]).toBe(29_750);
    expect(hour[11]).toBe(30_750);
    expect(hour.reduce((a, b) => a + b, 0)).toBe(60_500);
  });
  it("a paused entry contributes one unique day despite several segments", () => {
    const start = at("2026-05-01T10:00:00");
    const source = { ...make(start, start + minute), segments: [{ start, end: start + minute }, { start: start + 2 * minute, end: start + 3 * minute }] };
    expect([...entryDayTotals(source, start + 4 * minute)]).toEqual([["2026-05-01", 2 * minute]]);
    expect(entriesOnDay([source], "2026-05-01", start + 4 * minute)).toHaveLength(1);
  });
  it.each([
    ["2026-03-08", "2026-03-09", 23],
    ["2026-11-01", "2026-11-02", 25],
  ])("DST %s natural-day and hourly totals conserve elapsed time", (day, next, hours) => {
    // Explicit offsets make the expected elapsed total independent of the runner timezone.
    const spring = hours === 23;
    const start = at(`${day}T00:00:00${spring ? "-08:00" : "-07:00"}`);
    const end = at(`${next}T00:00:00${spring ? "-07:00" : "-08:00"}`);
    const source = make(start, end);
    expect(entryDuration(source, end)).toBe(hours * 60 * minute);
    expect([...entryDayTotals(source, end).values()].reduce((a, b) => a + b, 0)).toBe(hours * 60 * minute);
    expect(entryHourTotals(source, end).reduce((a, b) => a + b, 0)).toBe(hours * 60 * minute);
  });
});
