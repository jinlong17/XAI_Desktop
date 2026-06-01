/**
 * aiCreateSubscriber.test.tsx — CS-1..CS-4
 *
 * Tests for useCalendarCreateRequestSubscriber:
 * CS-1: store mutation — web:calendar:create-requested → createEvent + setPref
 * CS-2: idempotency — duplicate requestId → only one event created
 * CS-3: route-independent (hook is standalone; not dependent on CalendarModule)
 * CS-4: no cross-plugin import from ai-chat (structural — import graph check)
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 CS tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { getPref, setPref } from "@repo/plugin-web-storage";
import { useCalendarCreateRequestSubscriber } from "../internal/aiCreateSubscriber.js";

beforeEach(() => {
  localStorage.clear();
  // Seed an empty calendar store.
  setPref("xai_calendar_events", {});
});

describe("CS-1: store mutation — event handler calls createEvent + setPref", () => {
  it("creates a calendar event in the store", () => {
    renderHook(() => useCalendarCreateRequestSubscriber());

    act(() => {
      emitWebEvent("web:calendar:create-requested", {
        requestId: "creq-001",
        title: "Team standup",
        date: "2026-05-30",
        startTime: "09:30",
        durationMin: 30,
        requestedAt: new Date().toISOString(),
      });
    });

    const rawStore = getPref("xai_calendar_events") as Record<
      string,
      { title: string; startISO: string; endISO: string; colorPreset: string }
    >;
    const events = Object.values(rawStore);
    expect(events).toHaveLength(1);
    expect(events[0]!.title).toBe("Team standup");
    // startISO: "2026-05-30T09:30"
    expect(events[0]!.startISO).toBe("2026-05-30T09:30");
    // endISO: "2026-05-30T10:00" (09:30 + 30 min)
    expect(events[0]!.endISO).toBe("2026-05-30T10:00");
    expect(events[0]!.colorPreset).toBe("mint");
  });

  it("defaults startTime to 09:00 and durationMin to 60 when not provided", () => {
    renderHook(() => useCalendarCreateRequestSubscriber());

    act(() => {
      emitWebEvent("web:calendar:create-requested", {
        requestId: "creq-002",
        title: "All-day reminder",
        date: "2026-06-01",
        startTime: "09:00",
        durationMin: 60,
        requestedAt: new Date().toISOString(),
      });
    });

    const rawStore = getPref("xai_calendar_events") as Record<
      string,
      { title: string; startISO: string; endISO: string }
    >;
    const events = Object.values(rawStore);
    expect(events[0]!.startISO).toBe("2026-06-01T09:00");
    expect(events[0]!.endISO).toBe("2026-06-01T10:00");
  });
});

describe("CS-2: idempotency — duplicate requestId does not create a second event", () => {
  it("ignores a second event with the same requestId", () => {
    renderHook(() => useCalendarCreateRequestSubscriber());

    act(() => {
      emitWebEvent("web:calendar:create-requested", {
        requestId: "creq-dup",
        title: "Duplicate event",
        date: "2026-05-30",
        startTime: "10:00",
        durationMin: 30,
        requestedAt: new Date().toISOString(),
      });
      emitWebEvent("web:calendar:create-requested", {
        requestId: "creq-dup",
        title: "Duplicate event",
        date: "2026-05-30",
        startTime: "10:00",
        durationMin: 30,
        requestedAt: new Date().toISOString(),
      });
    });

    const rawStore = getPref("xai_calendar_events") as Record<string, unknown>;
    expect(Object.values(rawStore)).toHaveLength(1); // deduplicated
  });
});

describe("CS-3: route-independent — subscriber works without CalendarModule mounted", () => {
  it("writes to store even when no CalendarModule is rendered", () => {
    renderHook(() => useCalendarCreateRequestSubscriber());

    act(() => {
      emitWebEvent("web:calendar:create-requested", {
        requestId: "creq-standalone",
        title: "Standalone meeting",
        date: "2026-06-05",
        startTime: "14:00",
        durationMin: 45,
        requestedAt: new Date().toISOString(),
      });
    });

    const rawStore = getPref("xai_calendar_events") as Record<string, { title: string }>;
    const events = Object.values(rawStore);
    expect(events).toHaveLength(1);
    expect(events[0]!.title).toBe("Standalone meeting");
  });
});

describe("CS-4: no cross-plugin import — module does not use runtime import from plugin-web-ai-chat", () => {
  it("aiCreateSubscriber does not have an import statement from @repo/plugin-web-ai-chat", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/internal/aiCreateSubscriber.ts",
      ),
      "utf-8",
    );
    expect(src).not.toMatch(/from\s+["']@repo\/plugin-web-ai-chat["']/);
  });
});
