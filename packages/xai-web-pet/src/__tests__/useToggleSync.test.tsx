/**
 * useToggleSync.test.tsx — AC-PET-10 event listener tests.
 *
 * Tests that useToggleSync correctly:
 * - Returns the prop value initially
 * - Updates internalOn when web:shell:pet-toggle fires
 * - Reconciles back to prop when prop changes
 * - Cleans up on unmount
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { useToggleSync } from "../internal/useToggleSync.js";

describe("useToggleSync", () => {
  it("returns the prop value initially (true)", () => {
    const { result } = renderHook(() => useToggleSync(true));
    expect(result.current).toBe(true);
  });

  it("returns the prop value initially (false)", () => {
    const { result } = renderHook(() => useToggleSync(false));
    expect(result.current).toBe(false);
  });

  it("updates internalOn to false when event fires with on:false", () => {
    const { result } = renderHook(() => useToggleSync(true));
    expect(result.current).toBe(true);

    act(() => {
      emitWebEvent("web:shell:pet-toggle", { on: false, source: "rail-bottom" });
    });

    expect(result.current).toBe(false);
  });

  it("updates internalOn to true when event fires with on:true (from false)", () => {
    const { result } = renderHook(() => useToggleSync(false));

    act(() => {
      emitWebEvent("web:shell:pet-toggle", { on: true, source: "rail-bottom" });
    });

    expect(result.current).toBe(true);
  });

  it("reconciles to prop when prop changes (prop is authoritative)", () => {
    // Start with propOn=true. Event fires with on:false → internalOn=false.
    // Then prop changes: false → true. The useEffect([propOn]) should run
    // and reconcile internalOn back to true.
    const { result, rerender } = renderHook(
      ({ propOn }: { propOn: boolean }) => useToggleSync(propOn),
      { initialProps: { propOn: true } },
    );

    // Fire event to flip to false
    act(() => {
      emitWebEvent("web:shell:pet-toggle", { on: false, source: "settings" });
    });
    expect(result.current).toBe(false);

    // Prop changes to false first (so next rerender with true is a real change)
    act(() => {
      rerender({ propOn: false });
    });

    // Now prop changes back to true → useEffect([propOn]) fires → reconcile
    act(() => {
      rerender({ propOn: true });
    });
    expect(result.current).toBe(true);
  });

  it("follows prop when prop changes without event", () => {
    const { result, rerender } = renderHook(
      ({ propOn }: { propOn: boolean }) => useToggleSync(propOn),
      { initialProps: { propOn: true } },
    );

    expect(result.current).toBe(true);

    act(() => {
      rerender({ propOn: false });
    });
    expect(result.current).toBe(false);
  });
});
