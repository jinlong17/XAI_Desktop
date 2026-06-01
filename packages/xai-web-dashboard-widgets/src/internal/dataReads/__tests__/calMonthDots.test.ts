import { describe, it, expect } from "vitest";
import { monthDots } from "../calMonthDots.js";

function makeEvent(overrides: Partial<{
  id: string;
  title: string;
  startISO: string;
  endISO: string;
  colorPreset: string;
  recurrence: null | { kind: "daily" | "weekly" };
}> = {}) {
  return {
    id: overrides.id ?? "evt-1",
    title: overrides.title ?? "Test",
    startISO: overrides.startISO ?? "2026-05-15T10:00",
    endISO: overrides.endISO ?? "2026-05-15T11:00",
    colorPreset: overrides.colorPreset ?? "mint",
    recurrence: overrides.recurrence !== undefined ? overrides.recurrence : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// May 2026 = viewYear=2026, viewMonth=4
const VIEW_YEAR = 2026;
const VIEW_MONTH = 4; // May

// ---------------------------------------------------------------------------
// AC-RD-CAL-1: empty store → {}
// ---------------------------------------------------------------------------
describe("monthDots — empty store (AC-RD-CAL-1)", () => {
  it("returns {} for null store", () => {
    expect(monthDots(null, VIEW_YEAR, VIEW_MONTH)).toEqual({});
  });

  it("returns {} for empty map", () => {
    expect(monthDots({}, VIEW_YEAR, VIEW_MONTH)).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// AC-RD-CAL-2: non-recurring event → correct day dot
// ---------------------------------------------------------------------------
describe("monthDots — non-recurring (AC-RD-CAL-2)", () => {
  it("places dot on correct day-of-month", () => {
    const ev = makeEvent({ startISO: "2026-05-15T10:00", colorPreset: "amber" });
    const store = { [ev.id]: ev };
    const result = monthDots(store, VIEW_YEAR, VIEW_MONTH);
    expect(result[15]).toBeDefined();
    expect(result[15]).toContain("amber");
  });

  it("excludes event from different month", () => {
    const ev = makeEvent({ startISO: "2026-06-15T10:00" }); // June, not May
    const store = { [ev.id]: ev };
    const result = monthDots(store, VIEW_YEAR, VIEW_MONTH);
    expect(Object.keys(result)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// AC-RD-CAL-3: multiple events on same day capped at 3 dots
// ---------------------------------------------------------------------------
describe("monthDots — 3-dot cap (AC-RD-CAL-3)", () => {
  it("caps at 3 dots per day", () => {
    const events = [
      makeEvent({ id: "e1", startISO: "2026-05-10T09:00", colorPreset: "mint" }),
      makeEvent({ id: "e2", startISO: "2026-05-10T11:00", colorPreset: "amber" }),
      makeEvent({ id: "e3", startISO: "2026-05-10T13:00", colorPreset: "blue" }),
      makeEvent({ id: "e4", startISO: "2026-05-10T15:00", colorPreset: "violet" }), // 4th → dropped
    ];
    const store: Record<string, unknown> = {};
    for (const ev of events) store[ev.id] = ev;
    const result = monthDots(store, VIEW_YEAR, VIEW_MONTH);
    expect(result[10]).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// AC-RD-CAL-4: daily recurrence expands within month
// ---------------------------------------------------------------------------
describe("monthDots — recurrence (AC-RD-CAL-4)", () => {
  it("daily recurrence produces dots on multiple days in month", () => {
    const ev = makeEvent({
      id: "daily",
      startISO: "2026-05-28T09:00", // start May 28
      endISO: "2026-05-28T10:00",
      colorPreset: "blue",
      recurrence: { kind: "daily" },
    });
    const store = { [ev.id]: ev };
    const result = monthDots(store, VIEW_YEAR, VIEW_MONTH);
    // Should have dots on days 28, 29, 30, 31 at minimum
    expect(result[28]).toBeDefined();
    expect(result[29]).toBeDefined();
    expect(result[30]).toBeDefined();
    expect(result[31]).toBeDefined();
  });

  it("weekly recurrence produces one dot on anchor day and same weekday next week", () => {
    // May 21 is a Thursday; weekly → also May 28
    const ev = makeEvent({
      id: "weekly",
      startISO: "2026-05-21T09:00",
      endISO: "2026-05-21T10:00",
      colorPreset: "violet",
      recurrence: { kind: "weekly" },
    });
    const store = { [ev.id]: ev };
    const result = monthDots(store, VIEW_YEAR, VIEW_MONTH);
    expect(result[21]).toBeDefined();
    expect(result[28]).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// AC-RD-CAL-5: `rose` colorPreset produces a dot (RD4 guard — CSS class exists)
// ---------------------------------------------------------------------------
describe("monthDots — rose colorPreset (AC-RD-CAL-5)", () => {
  it("includes 'rose' colorPreset in dots", () => {
    const ev = makeEvent({
      id: "rose-1",
      startISO: "2026-05-20T10:00",
      colorPreset: "rose",
    });
    const store = { [ev.id]: ev };
    const result = monthDots(store, VIEW_YEAR, VIEW_MONTH);
    expect(result[20]).toBeDefined();
    expect(result[20]).toContain("rose");
  });
});
