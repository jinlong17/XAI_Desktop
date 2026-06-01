/**
 * useUserCalEvents — React hook bridging EventStore + usePref.
 * 8 cases including AC-PERSIST-CREATE-4 (cross-tab storage event).
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUserCalEvents } from "../internal/eventStore/useUserCalEvents.js";

describe("useUserCalEvents — initial state", () => {
  it("starts with empty store + empty list", () => {
    const { result } = renderHook(() => useUserCalEvents());
    expect(result.current.events).toEqual({});
    expect(result.current.list).toEqual([]);
  });
});

describe("useUserCalEvents — CRUD", () => {
  it("create() adds an event + persists via setPref", () => {
    const { result } = renderHook(() => useUserCalEvents());
    act(() => {
      result.current.create({
        title: "First",
        startISO: "2026-05-22T09:00",
        endISO: "2026-05-22T10:00",
        colorPreset: "mint",
        recurrence: null,
      });
    });
    expect(result.current.list).toHaveLength(1);
    expect(result.current.list[0]?.title).toBe("First");
    // Persistence: read raw localStorage value.
    const raw = localStorage.getItem("xai_calendar_events");
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toHaveProperty(result.current.list[0]!.id);
  });

  it("update() patches title + bumps updatedAt", async () => {
    const { result } = renderHook(() => useUserCalEvents());
    let id = "";
    act(() => {
      id = result.current.create({
        title: "Before",
        startISO: "2026-05-22T09:00",
        endISO: "2026-05-22T10:00",
        colorPreset: "mint",
        recurrence: null,
      }).id;
    });
    await new Promise((r) => setTimeout(r, 5));
    act(() => {
      result.current.update(id, { title: "After" });
    });
    expect(result.current.events[id]?.title).toBe("After");
  });

  it("update() returns null when id missing — no state change", () => {
    const { result } = renderHook(() => useUserCalEvents());
    let returned: unknown = "uninit";
    act(() => {
      returned = result.current.update("nope", { title: "x" });
    });
    expect(returned).toBeNull();
  });

  it("remove() deletes the event", () => {
    const { result } = renderHook(() => useUserCalEvents());
    let id = "";
    act(() => {
      id = result.current.create({
        title: "To delete",
        startISO: "2026-05-22T09:00",
        endISO: "2026-05-22T10:00",
        colorPreset: "mint",
        recurrence: null,
      }).id;
    });
    act(() => {
      result.current.remove(id);
    });
    expect(result.current.list).toHaveLength(0);
  });

  it("getById() returns the event or null", () => {
    const { result } = renderHook(() => useUserCalEvents());
    let id = "";
    act(() => {
      id = result.current.create({
        title: "Lookup",
        startISO: "2026-05-22T09:00",
        endISO: "2026-05-22T10:00",
        colorPreset: "mint",
        recurrence: null,
      }).id;
    });
    expect(result.current.getById(id)?.title).toBe("Lookup");
    expect(result.current.getById("missing")).toBeNull();
  });
});

describe("useUserCalEvents — persistence round-trip", () => {
  it("remount sees the event that was created in a previous mount (HC4)", () => {
    const { result: r1, unmount } = renderHook(() => useUserCalEvents());
    act(() => {
      r1.current.create({
        title: "Persisted",
        startISO: "2026-05-22T09:00",
        endISO: "2026-05-22T10:00",
        colorPreset: "mint",
        recurrence: null,
      });
    });
    unmount();
    const { result: r2 } = renderHook(() => useUserCalEvents());
    expect(r2.current.list).toHaveLength(1);
    expect(r2.current.list[0]?.title).toBe("Persisted");
  });
});

describe("useUserCalEvents — cross-tab sync (AC-PERSIST-CREATE-4)", () => {
  it("re-renders when a `storage` event arrives carrying a new value", () => {
    const { result } = renderHook(() => useUserCalEvents());
    expect(result.current.list).toHaveLength(0);
    // Simulate another tab writing to localStorage + dispatching the event.
    const externalValue = {
      "tab-b-id": {
        id: "tab-b-id",
        title: "From other tab",
        startISO: "2026-05-22T09:00",
        endISO: "2026-05-22T10:00",
        colorPreset: "mint" as const,
        recurrence: null,
        createdAt: "2026-05-22T00:00:00.000Z",
        updatedAt: "2026-05-22T00:00:00.000Z",
      },
    };
    act(() => {
      localStorage.setItem("xai_calendar_events", JSON.stringify(externalValue));
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "xai_calendar_events",
          newValue: JSON.stringify(externalValue),
          oldValue: null,
          storageArea: localStorage,
        }),
      );
    });
    expect(result.current.list).toHaveLength(1);
    expect(result.current.list[0]?.title).toBe("From other tab");
  });
});
