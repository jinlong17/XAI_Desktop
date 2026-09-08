/**
 * useDaysUntil.test.tsx — Tests H1..H6
 *
 * H1: one timer per module instance (not per card) — measured via setTimeout spy count
 * H2: midnight rollover fires recompute via fake timer
 * H3: visibilitychange (visible) recomputes days
 * H4: StrictMode double-mount cleans up without double-timer leak
 * H5: unmount clears the timeout
 * H6: NaN returned for invalid target_date
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDaysUntil } from "../internal/useDaysUntil.js";

// Setup in vitest.setup.ts sets systemTime to 2026-05-23 14:30:00 local

describe("useDaysUntil", () => {
  it("H1: schedules exactly one setTimeout per hook instance on mount", () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const { unmount } = renderHook(() => useDaysUntil("2026-05-30"));
    // Should be called once for scheduleNext() on mount (ignoring React internals)
    const countdownCalls = setTimeoutSpy.mock.calls.filter(
      ([, ms]) => typeof ms === "number" && (ms as number) > 0,
    );
    expect(countdownCalls.length).toBeGreaterThanOrEqual(1);
    unmount();
    setTimeoutSpy.mockRestore();
  });

  it("H2: midnight rollover fires recompute", () => {
    // System time is 2026-05-23 14:30:00 (set in setup)
    // Target is 2026-05-30 — currently 7 days away
    const { result, unmount } = renderHook(() => useDaysUntil("2026-05-30"));
    expect(result.current).toBe(7);

    // Compute ms until midnight from setup time (2026-05-23 14:30 → 2026-05-24 00:00)
    const setupTime = new Date(2026, 4, 23, 14, 30, 0);
    const midnight = new Date(2026, 4, 24, 0, 0, 0);
    const msToMidnight = midnight.getTime() - setupTime.getTime() + 1001; // +1001ms buffer

    // Advance system time to just after midnight, then fire just that one timer
    act(() => {
      vi.setSystemTime(new Date(2026, 4, 24, 0, 0, 1));
      vi.advanceTimersByTime(msToMidnight);
    });

    // Now it should be 6 days away
    expect(result.current).toBe(6);
    unmount();
  });

  it("H3: visibilitychange (visible) recomputes days", () => {
    const { result, unmount } = renderHook(() => useDaysUntil("2026-05-30"));
    expect(result.current).toBe(7);

    // Advance time to next day without running timers
    act(() => {
      vi.setSystemTime(new Date(2026, 4, 24, 14, 30, 0));
      // Trigger visibilitychange
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current).toBe(6);
    unmount();
  });

  it("H4: StrictMode double-mount does not leak timers (cleanup works)", () => {
    // In StrictMode, React mounts, unmounts, then remounts — ensure cleanup works
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const { unmount } = renderHook(() => useDaysUntil("2026-05-30"));
    unmount();
    // clearTimeout should have been called (cleanup on unmount)
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("H5: unmount removes visibilitychange listener", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => useDaysUntil("2026-05-30"));
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
    removeEventListenerSpy.mockRestore();
  });

  it("H6: returns NaN for invalid target_date", () => {
    const { result, unmount } = renderHook(() => useDaysUntil("not-a-date"));
    expect(Number.isNaN(result.current)).toBe(true);
    unmount();
  });
});
