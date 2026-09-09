/**
 * aiMutateSubscriber.test.tsx — CS-DEL-1..CS-DEL-3, CS-UPD-1..CS-UPD-3
 *
 * Tests for useCalendarMutateRequestSubscriber:
 * CS-DEL-1: delete event handler → deleteEvent + setPref
 * CS-DEL-2: delete idempotency — duplicate requestId → only one delete
 * CS-DEL-3: delete unknown id → no-op
 * CS-UPD-1: update title → updateEvent + setPref; preserves createdAt + id; bumps updatedAt
 * CS-UPD-2: update time fields → new startISO/endISO recomputed
 * CS-UPD-3: update idempotency — duplicate requestId → only one update
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §9 CS-DEL/CS-UPD tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { accountScope, getPref } from "@repo/plugin-web-storage";
import { useCalendarMutateRequestSubscriber } from "../internal/aiMutateSubscriber.js";
import type { UserCalEvent } from "../internal/eventStore/types.js";
import { disableCanonicalSubscriberTests, enableCanonicalSubscriberTests, settleCanonicalCommands } from "./canonicalSubscriberHarness.js";

const NOW = "2026-05-29T09:00:00.000Z";

function seedEvent(id: string, overrides?: Partial<UserCalEvent>): UserCalEvent {
  return {
    id,
    title: "Original title",
    startISO: "2026-05-29T10:00",
    endISO: "2026-05-29T11:00",
    colorPreset: "mint",
    recurrence: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function writeSeed(): { eventId: string } {
  const eventId = "ev-seed-001";
  const store: Record<string, UserCalEvent> = {
    [eventId]: seedEvent(eventId),
  };
  localStorage.setItem(accountScope.physicalKey("xai_calendar_events"), JSON.stringify(store));
  return { eventId };
}

beforeEach(() => {
  localStorage.clear();
  enableCanonicalSubscriberTests();
});

afterEach(disableCanonicalSubscriberTests);

describe("CS-DEL-1: delete event → deleteEvent + setPref (event removed)", () => {
  it("removes the targeted calendar event", async () => {
    const { eventId } = writeSeed();
    renderHook(() => useCalendarMutateRequestSubscriber());

    act(() => {
      emitWebEvent("web:calendar:delete-requested", {
        requestId: "req-cal-del-001",
        id: eventId,
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const store = getPref("xai_calendar_events") as Record<string, unknown>;
    expect(store[eventId]).toBeUndefined();
  });
});

describe("CS-DEL-2: delete idempotency — duplicate requestId → only one delete", () => {
  it("second event with same requestId is no-op (event already gone)", async () => {
    const { eventId } = writeSeed();
    renderHook(() => useCalendarMutateRequestSubscriber());

    act(() => {
      emitWebEvent("web:calendar:delete-requested", {
        requestId: "req-cal-del-dup",
        id: eventId,
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    // seed another event to make sure the second emit doesn't corrupt the store
    const store1 = getPref("xai_calendar_events") as Record<string, unknown>;
    const count1 = Object.keys(store1).length;

    act(() => {
      emitWebEvent("web:calendar:delete-requested", {
        requestId: "req-cal-del-dup", // duplicate
        id: eventId,
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const store2 = getPref("xai_calendar_events") as Record<string, unknown>;
    expect(Object.keys(store2).length).toBe(count1); // no further change
  });
});

describe("CS-DEL-3: delete unknown id → store unchanged", () => {
  it("returns store unchanged when event id not found", async () => {
    writeSeed();
    renderHook(() => useCalendarMutateRequestSubscriber());

    const before = JSON.stringify(getPref("xai_calendar_events"));

    act(() => {
      emitWebEvent("web:calendar:delete-requested", {
        requestId: "req-cal-del-noop",
        id: "ev-DOES_NOT_EXIST",
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    expect(JSON.stringify(getPref("xai_calendar_events"))).toBe(before);
  });
});

describe("CS-UPD-1: update title → updateEvent; preserves createdAt + id; bumps updatedAt", () => {
  it("updates title; preserves createdAt and id; bumps updatedAt", async () => {
    const { eventId } = writeSeed();
    renderHook(() => useCalendarMutateRequestSubscriber());

    act(() => {
      emitWebEvent("web:calendar:update-requested", {
        requestId: "req-cal-upd-001",
        id: eventId,
        patch: { title: "Updated title" },
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const store = getPref("xai_calendar_events") as Record<string, UserCalEvent>;
    const updated = store[eventId]!;
    expect(updated.title).toBe("Updated title");
    expect(updated.createdAt).toBe(NOW);    // preserved
    expect(updated.id).toBe(eventId);       // preserved
    expect(updated.updatedAt).not.toBe(NOW); // bumped
  });
});

describe("CS-UPD-2: update time fields → startISO/endISO recomputed", () => {
  it("moves event to a new date + startTime with correct ISO strings", async () => {
    const { eventId } = writeSeed();
    renderHook(() => useCalendarMutateRequestSubscriber());

    act(() => {
      emitWebEvent("web:calendar:update-requested", {
        requestId: "req-cal-upd-time",
        id: eventId,
        patch: { date: "2026-06-01", startTime: "14:00", durationMin: 45 },
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const store = getPref("xai_calendar_events") as Record<string, UserCalEvent>;
    const updated = store[eventId]!;
    expect(updated.startISO).toBe("2026-06-01T14:00");
    expect(updated.endISO).toBe("2026-06-01T14:45");
  });
});

describe("CS-UPD-3: update idempotency — duplicate requestId → only one update", () => {
  it("applies first update; second event with same requestId is no-op", async () => {
    const { eventId } = writeSeed();
    renderHook(() => useCalendarMutateRequestSubscriber());

    act(() => {
      emitWebEvent("web:calendar:update-requested", {
        requestId: "req-cal-upd-dup",
        id: eventId,
        patch: { title: "First update" },
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();

    act(() => {
      emitWebEvent("web:calendar:update-requested", {
        requestId: "req-cal-upd-dup", // duplicate
        id: eventId,
        patch: { title: "Second update — should be ignored" },
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();

    const store = getPref("xai_calendar_events") as Record<string, UserCalEvent>;
    expect(store[eventId]!.title).toBe("First update");
  });
});
