/**
 * useTipRotation.test.tsx — AC-PET-12 tip rotation cycle tests.
 *
 * Uses vi.useFakeTimers() to control time.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTipRotation } from "../internal/useTipRotation.js";

// setBubble mock — explicit type annotation avoids inference issues
function makeSetBubble(): ReturnType<typeof vi.fn> & ((text: string | null) => void) {
  const fn = vi.fn();
  return fn as ReturnType<typeof vi.fn> & ((text: string | null) => void);
}

describe("useTipRotation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("calls setBubble with tips[0] immediately when on=true and !pickerOpen", () => {
    const setBubble = makeSetBubble();
    renderHook(() =>
      useTipRotation({ on: true, lang: "en", pickerOpen: false, setBubble }),
    );
    // The first setBubble call should happen synchronously
    expect(setBubble).toHaveBeenCalledWith(expect.any(String));
    expect(setBubble.mock.calls[0]?.[0]).toBeTruthy();
  });

  it("dismisses first bubble at TIP_FIRST_DISMISS_MS (5500ms)", () => {
    const setBubble = makeSetBubble();
    renderHook(() =>
      useTipRotation({ on: true, lang: "en", pickerOpen: false, setBubble }),
    );

    setBubble.mockClear();

    act(() => {
      vi.advanceTimersByTime(5500);
    });

    expect(setBubble).toHaveBeenCalledWith(null);
  });

  it("cycles to next tip at TIP_CYCLE_MS (12000ms) with null gap", () => {
    const setBubble = makeSetBubble();
    renderHook(() =>
      useTipRotation({ on: true, lang: "en", pickerOpen: false, setBubble }),
    );

    setBubble.mockClear();

    // Advance to cycle tick (12000ms)
    act(() => {
      vi.advanceTimersByTime(12000);
    });

    // Should have cleared to null first
    const calls = setBubble.mock.calls.map((c) => c[0]);
    expect(calls[0]).toBeNull();

    // Then after 400ms regrow delay, a new tip
    act(() => {
      vi.advanceTimersByTime(400);
    });

    const calls2 = setBubble.mock.calls.map((c) => c[0]);
    const newTip = calls2[calls2.length - 1];
    expect(typeof newTip).toBe("string");
    expect(newTip).toBeTruthy();
  });

  it("does not set bubble when on=false", () => {
    const setBubble = makeSetBubble();
    renderHook(() =>
      useTipRotation({ on: false, lang: "en", pickerOpen: false, setBubble }),
    );
    expect(setBubble).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(20000); });
    expect(setBubble).not.toHaveBeenCalled();
  });

  it("does not set bubble when pickerOpen=true", () => {
    const setBubble = makeSetBubble();
    renderHook(() =>
      useTipRotation({ on: true, lang: "en", pickerOpen: true, setBubble }),
    );
    expect(setBubble).not.toHaveBeenCalled();
  });

  it("resets when lang changes (effect re-runs)", () => {
    const setBubble = makeSetBubble();
    const { rerender } = renderHook<void, { lang: "en" | "zh" }>(
      ({ lang }) =>
        useTipRotation({ on: true, lang, pickerOpen: false, setBubble }),
      { initialProps: { lang: "en" } },
    );

    const countBefore = setBubble.mock.calls.length;

    rerender({ lang: "zh" });

    // After lang change, effect should run again — new calls expected
    expect(setBubble.mock.calls.length).toBeGreaterThan(countBefore);
  });

  it("cleans up timers on unmount (no calls after unmount)", () => {
    const setBubble = makeSetBubble();
    const { unmount } = renderHook(() =>
      useTipRotation({ on: true, lang: "en", pickerOpen: false, setBubble }),
    );

    unmount();
    setBubble.mockClear();

    act(() => { vi.advanceTimersByTime(30000); });
    expect(setBubble).not.toHaveBeenCalled();
  });
});
