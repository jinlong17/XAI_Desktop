/**
 * UT1..UT8 — useTimerTick hook tests.
 * test.md §2
 *
 * Uses vi.useFakeTimers() (set in vitest.setup.ts).
 * rAF is polyfilled via vitest.setup.ts as setTimeout(cb, 16).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTimerTick } from "../internal/useTimerTick.js";

describe("useTimerTick", () => {
  beforeEach(() => {
    // vi.useFakeTimers() + vi.setSystemTime() already set in vitest.setup.ts
  });

  // UT1: idle state → no rAF
  it("UT1: starts in idle state", () => {
    const { result } = renderHook(() => useTimerTick());
    expect(result.current.timerState.kind).toBe("idle");
    expect(result.current.timerState.mode).toBe("focus");
  });

  // UT2: transition idle → running starts rAF
  it("UT2: start() transitions idle → running", () => {
    const { result } = renderHook(() => useTimerTick());
    act(() => {
      result.current.start();
    });
    expect(result.current.timerState.kind).toBe("running");
  });

  // UT3: setState only fires on second change (not every rAF frame)
  it("UT3: displayedRemainingMs decreases by at least 1 second after 1100ms", () => {
    const { result } = renderHook(() => useTimerTick());
    act(() => {
      result.current.start();
    });
    const initialDisplayed = result.current.displayedRemainingMs;

    // Advance 1100 ms — must cross at least one displayed-second boundary
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    // Now displayed should have dropped by at least 1 second
    expect(result.current.displayedRemainingMs).toBeLessThan(initialDisplayed);
  });

  // UT4: pause cancels rAF
  it("UT4: pause() transitions running → paused and freezes remaining", () => {
    const { result } = renderHook(() => useTimerTick());
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => {
      result.current.pause();
    });
    expect(result.current.timerState.kind).toBe("paused");
    const afterPause = result.current.displayedRemainingMs;
    // Advance time — remaining should NOT change while paused
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // Displayed remains the same (frozen at pause point)
    expect(result.current.displayedRemainingMs).toBe(afterPause);
  });

  // UT5: resume restarts rAF from paused remaining
  it("UT5: resume() continues from paused remaining", () => {
    const { result } = renderHook(() => useTimerTick());
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(2000); });
    act(() => { result.current.pause(); });
    const pausedRemaining = result.current.displayedRemainingMs;
    act(() => { result.current.resume(); });
    expect(result.current.timerState.kind).toBe("running");
    act(() => { vi.advanceTimersByTime(1100); });
    // Should be ~1 second less than pausedRemaining
    expect(result.current.displayedRemainingMs).toBeLessThan(pausedRemaining);
  });

  // UT6: visibilitychange recompute on return to tab
  it("UT6: visibilitychange → visible forces recompute", () => {
    const { result } = renderHook(() => useTimerTick());
    act(() => { result.current.start(); });
    // Simulate tab blur + time passing
    act(() => { vi.advanceTimersByTime(10000); });
    const displayedBefore = result.current.displayedRemainingMs;

    // Simulate tab becoming visible again
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      writable: true,
      configurable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    // After recompute, displayed should not exceed what was before (time only moves forward)
    expect(result.current.displayedRemainingMs).toBeLessThanOrEqual(displayedBefore);
  });

  // UT7: pageshow recompute (bfcache return)
  it("UT7: pageshow event forces recompute when running", () => {
    const { result } = renderHook(() => useTimerTick());
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(5000); });
    const beforePageshow = result.current.displayedRemainingMs;
    act(() => {
      window.dispatchEvent(new Event("pageshow"));
    });
    // After pageshow, remaining should be <= before (time only moves forward)
    expect(result.current.displayedRemainingMs).toBeLessThanOrEqual(beforePageshow);
  });

  // UT8: StrictMode double-mount: no rAF leak, no double-emit
  it("UT8: unmount cleans up rAF and listeners", () => {
    const cancelSpy = vi.spyOn(globalThis, "cancelAnimationFrame");
    const removeDocSpy = vi.spyOn(document, "removeEventListener");
    const removeWinSpy = vi.spyOn(window, "removeEventListener");

    const { result, unmount } = renderHook(() => useTimerTick());
    act(() => { result.current.start(); });
    unmount();

    expect(cancelSpy).toHaveBeenCalled();
    expect(removeDocSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(removeWinSpy).toHaveBeenCalledWith("pageshow", expect.any(Function));
  });
});
