/**
 * AC-PREFS-1..AC-PREFS-3 (test.md §A2).
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { setPref } from "@repo/plugin-web-storage";
import { useFeaturePrefs } from "../useFeaturePrefs.js";

describe("useFeaturePrefs", () => {
  it("AC-PREFS-1: defaults are all true", () => {
    const { result } = renderHook(() => useFeaturePrefs());
    expect(result.current).toEqual({
      tasks: true, board: true, dashboard: true, calendar: true,
      matrix: true, pomodoro: true, habits: true, meditation: true,
    });
  });

  it("AC-PREFS-2: setPref propagates to subscribers", () => {
    const { result } = renderHook(() => useFeaturePrefs());
    act(() => {
      setPref("xai_pref_features_board", false);
    });
    expect(result.current.board).toBe(false);
    expect(result.current.tasks).toBe(true);
  });

  it("AC-PREFS-3: localStorage round-trip", () => {
    localStorage.setItem("xai_pref_features_tasks", "false");
    const { result } = renderHook(() => useFeaturePrefs());
    expect(result.current.tasks).toBe(false);
    expect(result.current.board).toBe(true);
  });
});
