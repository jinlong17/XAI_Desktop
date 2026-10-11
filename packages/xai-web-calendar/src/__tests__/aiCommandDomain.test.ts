import { describe, expect, it } from "vitest";
import { isCalendarEventStore } from "../internal/aiCommandDomain.js";
import type { UserCalEvent } from "../internal/eventStore/types.js";

function event(overrides: Partial<UserCalEvent> = {}): UserCalEvent {
  return {
    id: "event-1",
    title: "Valid",
    startISO: "2024-02-29T09:00",
    endISO: "2024-02-29T09:30",
    colorPreset: "mint",
    recurrence: null,
    createdAt: "2026-09-09T00:00:00.000Z",
    updatedAt: "2026-09-09T00:00:00.000Z",
    ...overrides,
  };
}

describe("isCalendarEventStore", () => {
  it("accepts a valid leap-day domain and an empty store", () => {
    expect(isCalendarEventStore({})).toBe(true);
    expect(isCalendarEventStore({ "event-1": event() })).toBe(true);
  });

  it.each([
    ["impossible date", event({ startISO: "2026-02-29T09:00", endISO: "2026-02-29T09:30" })],
    ["different days", event({ endISO: "2024-03-01T09:30" })],
    ["short duration", event({ endISO: "2024-02-29T09:03" })],
    ["backward duration", event({ endISO: "2024-02-29T08:30" })],
    ["bad recurrence", event({ recurrence: { kind: "monthly" } as never })],
    ["bad optional", event({ reminder: "tomorrow" as never })],
    ["bad timestamp", event({ updatedAt: "not-a-date" })],
  ])("rejects %s", (_name, candidate) => {
    expect(isCalendarEventStore({ "event-1": candidate })).toBe(false);
  });

  it("rejects a physical key that disagrees with the event id", () => {
    expect(isCalendarEventStore({ different: event() })).toBe(false);
  });
});
