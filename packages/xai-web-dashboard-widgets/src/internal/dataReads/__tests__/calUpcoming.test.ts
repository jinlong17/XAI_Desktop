import { describe, it, expect } from "vitest";
import { upcomingEvents } from "../calUpcoming.js";
import { listValidCalEvents } from "../isUserCalEventMap.js";

// Helpers
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
    title: overrides.title ?? "Test Event",
    startISO: overrides.startISO ?? "2026-05-29T10:00",
    endISO: overrides.endISO ?? "2026-05-29T11:00",
    colorPreset: overrides.colorPreset ?? "mint",
    recurrence: overrides.recurrence !== undefined ? overrides.recurrence : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// "now" for tests: May 28, 2026 at 12:00 local
const NOW = new Date(2026, 4, 28, 12, 0, 0); // local May 28 noon

// ---------------------------------------------------------------------------
// AC-RD-UPC-1: empty store → []
// ---------------------------------------------------------------------------
describe("upcomingEvents — empty store (AC-RD-UPC-1)", () => {
  it("returns [] for null store", () => {
    expect(upcomingEvents(null, NOW)).toEqual([]);
  });

  it("returns [] for empty map", () => {
    expect(upcomingEvents({}, NOW)).toEqual([]);
  });

  it("returns [] for array store", () => {
    expect(upcomingEvents([], NOW)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// AC-RD-UPC-2: non-recurring event after now included
// ---------------------------------------------------------------------------
describe("upcomingEvents — non-recurring (AC-RD-UPC-2)", () => {
  it("includes a future non-recurring event", () => {
    const ev = makeEvent({ startISO: "2026-05-29T10:00" });
    const store = { [ev.id]: ev };
    const result = upcomingEvents(store, NOW);
    expect(result).toHaveLength(1);
    const first = result[0];
    expect(first).toBeDefined();
    expect(first?.title).toBe("Test Event");
    expect(first?.dateKey).toBe("2026-05-29");
    expect(first?.timeStr).toBe("10:00");
  });

  it("excludes a past non-recurring event", () => {
    const ev = makeEvent({ startISO: "2026-05-28T11:00" }); // before NOW (12:00)
    const store = { [ev.id]: ev };
    expect(upcomingEvents(store, NOW)).toHaveLength(0);
  });

  it("includes event starting at exactly now", () => {
    const ev = makeEvent({ startISO: "2026-05-28T12:00" }); // exactly NOW
    const store = { [ev.id]: ev };
    expect(upcomingEvents(store, NOW)).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// AC-RD-UPC-3: sorted ascending by startISO + max 4
// ---------------------------------------------------------------------------
describe("upcomingEvents — sort + max (AC-RD-UPC-3)", () => {
  it("returns at most 4 events sorted by startISO", () => {
    const events = [
      makeEvent({ id: "e1", startISO: "2026-05-29T14:00", title: "4th" }),
      makeEvent({ id: "e2", startISO: "2026-05-29T09:00", title: "1st" }),
      makeEvent({ id: "e3", startISO: "2026-05-29T11:00", title: "2nd" }),
      makeEvent({ id: "e4", startISO: "2026-05-29T13:00", title: "3rd" }),
      makeEvent({ id: "e5", startISO: "2026-05-30T09:00", title: "5th" }),
    ];
    const store: Record<string, unknown> = {};
    for (const ev of events) store[ev.id] = ev;
    const result = upcomingEvents(store, NOW, 60, 4);
    expect(result).toHaveLength(4);
    expect(result.map((r) => r.title)).toEqual(["1st", "2nd", "3rd", "4th"]);
  });
});

// ---------------------------------------------------------------------------
// AC-RD-UPC-4: daily recurrence expansion
// ---------------------------------------------------------------------------
describe("upcomingEvents — daily recurrence (AC-RD-UPC-4)", () => {
  it("expands a daily recurring event within the look-ahead window", () => {
    const ev = makeEvent({
      id: "daily-1",
      startISO: "2026-05-20T09:00", // anchor in the past
      endISO: "2026-05-20T10:00",
      recurrence: { kind: "daily" },
    });
    const store = { [ev.id]: ev };
    // now = May 28 noon; look-ahead = 3 days → May 28..31
    const result = upcomingEvents(store, NOW, 3);
    // Should have instances on May 28 at 09:00 (< now) excluded, May 29, 30, 31
    // May 28T09:00 < May 28T12:00 → excluded
    const dates = result.map((r) => r.dateKey);
    expect(dates).toContain("2026-05-29");
    expect(dates).toContain("2026-05-30");
    expect(dates).toContain("2026-05-31");
    expect(dates).not.toContain("2026-05-28"); // past today
  });
});

// ---------------------------------------------------------------------------
// AC-RD-UPC-5: weekly recurrence expansion
// ---------------------------------------------------------------------------
describe("upcomingEvents — weekly recurrence (AC-RD-UPC-5)", () => {
  it("expands a weekly recurring event correctly", () => {
    // Anchor: May 21 (Thursday), weekly
    const ev = makeEvent({
      id: "weekly-1",
      startISO: "2026-05-21T10:00",
      endISO: "2026-05-21T11:00",
      recurrence: { kind: "weekly" },
    });
    const store = { [ev.id]: ev };
    // now = May 28 noon; look-ahead = 14 days → May 28..Jun 11
    // Next Thursday after now: May 28T10:00 < now (noon) → Jun 4
    const result = upcomingEvents(store, NOW, 14);
    const dates = result.map((r) => r.dateKey);
    expect(dates).toContain("2026-06-04");
    // May 28T10:00 is before noon, excluded
    expect(dates).not.toContain("2026-05-28");
  });
});

// ---------------------------------------------------------------------------
// AC-RD-UPC-6: invalid/non-conforming entries silently dropped
// ---------------------------------------------------------------------------
describe("upcomingEvents — defensive (AC-RD-UPC-6)", () => {
  it("drops malformed entries silently", () => {
    const store = {
      "bad-1": { id: "bad-1", startISO: "not-an-iso", title: "Bad" },
      "bad-2": null,
      "bad-3": "string",
      "good-1": makeEvent({ startISO: "2026-05-29T10:00" }),
    };
    const result = upcomingEvents(store, NOW);
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Test Event");
  });
});

// ---------------------------------------------------------------------------
// isUserCalEventMap / listValidCalEvents
// ---------------------------------------------------------------------------
describe("listValidCalEvents", () => {
  it("returns valid events only", () => {
    const store = {
      "e1": makeEvent({ id: "e1" }),
      "e2": { id: "e2" }, // missing fields
    };
    const list = listValidCalEvents(store);
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe("e1");
  });

  it("returns [] for non-object store", () => {
    expect(listValidCalEvents(null)).toHaveLength(0);
    expect(listValidCalEvents([])).toHaveLength(0);
  });
});
