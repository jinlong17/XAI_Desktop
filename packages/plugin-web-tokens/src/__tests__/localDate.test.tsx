import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { addLocalDays, localDateKey, nextLocalDayStart, parseLocalDateKey } from "../localDate.js";
import { useLocalDayClock } from "../useLocalDayClock.js";

afterEach(() => vi.useRealTimers());
describe("local civil date contract", () => {
  it("keeps date identities and validates calendar dates", () => {
    expect(parseLocalDateKey("2026-02-30")).toBeNull();
    expect(parseLocalDateKey("2026-2-3")).toBeNull();
    expect(localDateKey(parseLocalDateKey("2024-02-29")!)).toBe("2024-02-29");
    expect(localDateKey(addLocalDays(parseLocalDateKey("2026-12-31")!, 1))).toBe("2027-01-01");
  });
  it("uses actual local midnight in every process time zone, including DST", () => {
    for (const key of ["2026-03-08", "2026-11-01", "2026-04-05", "2026-10-04"]) {
      const start = parseLocalDateKey(key)!;
      const next = nextLocalDayStart(start);
      const expected = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
      expect(next.getTime()).toBe(expected.getTime());
      expect(localDateKey(next)).not.toBe(key);
      expect((next.getTime() - start.getTime()) / 60_000).toBe(1440 + next.getTimezoneOffset() - start.getTimezoneOffset());
    }
  });
  it("refreshes at midnight, on resume and releases subscriptions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 8, 23, 59, 59));
    const { result, unmount } = renderHook(() => useLocalDayClock());
    expect(result.current.dayKey).toBe("2026-09-08");
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.dayKey).toBe("2026-09-09");
    vi.setSystemTime(new Date(2026, 8, 11, 8));
    act(() => window.dispatchEvent(new Event("pageshow")));
    expect(result.current.dayKey).toBe("2026-09-11");
    vi.setSystemTime(new Date(2026, 8, 12, 8));
    act(() => window.dispatchEvent(new Event("focus")));
    expect(result.current.dayKey).toBe("2026-09-12");
    vi.setSystemTime(new Date(2026, 8, 13, 8));
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(result.current.dayKey).toBe("2026-09-13");
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
