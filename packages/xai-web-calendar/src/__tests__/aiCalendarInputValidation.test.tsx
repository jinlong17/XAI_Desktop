import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { accountScope, getPref, setPref } from "@repo/plugin-web-storage";
import { emitWebEvent, onWebEvent, type WebEventMap } from "@repo/xai-web-event-bus";
import { useCalendarCreateRequestSubscriber } from "../internal/aiCreateSubscriber.js";
import { useCalendarMutateRequestSubscriber } from "../internal/aiMutateSubscriber.js";
import type { UserCalEvent } from "../internal/eventStore/types.js";

const seed: UserCalEvent = {
  id: "existing-event",
  title: "Existing event",
  startISO: "2026-02-20T09:00",
  endISO: "2026-02-20T10:00",
  colorPreset: "mint",
  recurrence: null,
  createdAt: "2026-02-20T00:00:00.000Z",
  updatedAt: "2026-02-20T00:00:00.000Z",
};

function installSubscribers(): void {
  renderHook(() => {
    useCalendarCreateRequestSubscriber();
    useCalendarMutateRequestSubscriber();
  });
}

function emitCreate(payload: unknown): void {
  emitWebEvent("web:calendar:create-requested", payload as WebEventMap["web:calendar:create-requested"]);
}

function emitUpdate(payload: unknown): void {
  emitWebEvent("web:calendar:update-requested", payload as WebEventMap["web:calendar:update-requested"]);
}

beforeEach(() => {
  setPref("xai_calendar_events", { [seed.id]: seed });
});

describe("Calendar AI input validation", () => {
  it("retains documented defaults only when a legacy create request omits the fields", () => {
    installSubscribers();

    act(() => {
      emitCreate({ requestId: "legacy-defaults", title: "Legacy event", requestedAt: "2026-09-09T00:00:00.000Z" });
    });

    const events = Object.values(getPref("xai_calendar_events") as Record<string, UserCalEvent>);
    const created = events.find(event => event.title === "Legacy event");
    expect(created?.startISO.slice(11)).toBe("09:00");
    expect(created?.endISO.slice(11)).toBe("10:00");
  });

  it.each([
    ["impossible month day", { date: "2026-04-31" }],
    ["month out of range", { date: "2026-13-01" }],
    ["non-leap February 29", { date: "2026-02-29" }],
    ["non-string date", { date: 20260229 }],
    ["malformed time", { startTime: "24:00" }],
    ["non-string time", { startTime: 900 }],
    ["non-finite duration", { durationMin: Infinity }],
    ["non-number duration", { durationMin: "30" }],
    ["non-integer duration", { durationMin: 5.5 }],
  ])("rejects explicit create %s without writing", (_name, override) => {
    installSubscribers();
    const key = accountScope.physicalKey("xai_calendar_events");
    const before = localStorage.getItem(key);
    const receipts: WebEventMap["web:ai:tool-write-receipt"][] = [];
    const off = onWebEvent("web:ai:tool-write-receipt", receipt => receipts.push(receipt));

    try {
      act(() => {
        emitCreate({
          requestId: `invalid-create-${_name}`,
          title: "Rejected event",
          date: "2026-03-01",
          startTime: "09:00",
          durationMin: 30,
          requestedAt: "2026-09-09T00:00:00.000Z",
          ...override,
        });
      });
      expect(receipts).toHaveLength(1);
      expect(receipts[0]).toMatchObject({ ok: false, reason: "invalid" });
      expect(localStorage.getItem(key)).toBe(before);
    } finally {
      off();
    }
  });

  it("rejects invalid update date/time/duration without changing the target", () => {
    installSubscribers();
    const key = accountScope.physicalKey("xai_calendar_events");
    const before = localStorage.getItem(key);
    const receipts: WebEventMap["web:ai:tool-write-receipt"][] = [];
    const off = onWebEvent("web:ai:tool-write-receipt", receipt => receipts.push(receipt));

    try {
      act(() => {
        emitUpdate({ requestId: "invalid-update-date", id: seed.id, patch: { date: "2026-02-29" }, requestedAt: "2026-09-09T00:00:00.000Z" });
        emitUpdate({ requestId: "invalid-update-time", id: seed.id, patch: { startTime: "09:60" }, requestedAt: "2026-09-09T00:00:00.000Z" });
        emitUpdate({ requestId: "invalid-update-array-time", id: seed.id, patch: { startTime: ["09:00"] }, requestedAt: "2026-09-09T00:00:00.000Z" });
        emitUpdate({ requestId: "invalid-update-duration", id: seed.id, patch: { durationMin: Number.NaN }, requestedAt: "2026-09-09T00:00:00.000Z" });
        emitUpdate({ requestId: "invalid-update-cross-day", id: seed.id, patch: { startTime: "23:50", durationMin: 10 }, requestedAt: "2026-09-09T00:00:00.000Z" });
      });
      expect(receipts).toHaveLength(5);
      expect(receipts.every(receipt => receipt.ok === false && receipt.reason === "invalid")).toBe(true);
      expect(localStorage.getItem(key)).toBe(before);
    } finally {
      off();
    }
  });

  it("permits a corrected request ID once after its invalid request was rejected", () => {
    installSubscribers();
    const receipts: WebEventMap["web:ai:tool-write-receipt"][] = [];
    const off = onWebEvent("web:ai:tool-write-receipt", receipt => receipts.push(receipt));

    try {
      act(() => {
        emitCreate({ requestId: "retry-after-invalid", title: "Leap-day event", date: "2026-02-29", startTime: "09:00", durationMin: 30, requestedAt: "2026-09-09T00:00:00.000Z" });
        emitCreate({ requestId: "retry-after-invalid", title: "Leap-day event", date: "2024-02-29", startTime: "09:00", durationMin: 30, requestedAt: "2026-09-09T00:00:00.000Z" });
      });
      expect(receipts).toHaveLength(2);
      expect(receipts[0]).toMatchObject({ ok: false, reason: "invalid" });
      expect(receipts[1]).toMatchObject({ ok: true });
      const events = Object.values(getPref("xai_calendar_events") as Record<string, UserCalEvent>);
      expect(events).toHaveLength(2);
      expect(events.find(event => event.title === "Leap-day event")?.startISO).toBe("2024-02-29T09:00");
    } finally {
      off();
    }
  });

  it("keeps the confirmed duration at the legal same-day boundary", () => {
    installSubscribers();

    act(() => {
      emitCreate({ requestId: "same-day-boundary", title: "Late event", date: "2024-02-29", startTime: "23:50", durationMin: 5, requestedAt: "2026-09-09T00:00:00.000Z" });
    });

    const events = Object.values(getPref("xai_calendar_events") as Record<string, UserCalEvent>);
    const created = events.find(event => event.title === "Late event");
    expect(created?.startISO).toBe("2024-02-29T23:50");
    expect(created?.endISO).toBe("2024-02-29T23:55");
  });

  it("rejects a duration that would otherwise be silently clamped across the same-day boundary", () => {
    installSubscribers();
    const key = accountScope.physicalKey("xai_calendar_events");
    const before = localStorage.getItem(key);

    act(() => {
      emitCreate({ requestId: "cross-day-duration", title: "Too late", date: "2024-02-29", startTime: "23:50", durationMin: 10, requestedAt: "2026-09-09T00:00:00.000Z" });
    });

    expect(localStorage.getItem(key)).toBe(before);
  });
});
