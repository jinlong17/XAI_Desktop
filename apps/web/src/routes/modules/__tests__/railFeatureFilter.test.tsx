/**
 * Rail filter integration — row #23 (xai-web-settings-features-panel).
 * AC-APP-1..AC-APP-3 (packages/xai-web-settings-features-panel/docs/test.md §B2)
 *
 * Tests the pure filter against the host's actual webShellModuleRegistrations
 * array. Mounting the full <App> in jsdom is not required because the
 * pure-helper contract already guarantees the filter is the rail's only
 * gate.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  useFeaturePrefs,
  filterModulesByFeaturePrefs,
} from "@repo/plugin-web-settings-features-panel";
import { setPref } from "@repo/plugin-web-storage";
import { renderHook } from "@testing-library/react";
import { webShellModuleRegistrations } from "../shellRegistrations";

beforeEach(() => {
  localStorage.clear();
});

describe("rail feature filter against real webShellModuleRegistrations", () => {
  it("AC-APP-1: default prefs (all true) → all real registrations pass through", () => {
    const { result } = renderHook(() => useFeaturePrefs());
    const filtered = filterModulesByFeaturePrefs(
      webShellModuleRegistrations,
      result.current,
    );
    expect(filtered.length).toBe(webShellModuleRegistrations.length);
    expect(filtered.map((m) => m.moduleId)).toEqual(
      webShellModuleRegistrations.map((m) => m.moduleId),
    );
  });

  it("AC-APP-2: flipping board off removes it from the filtered list", () => {
    setPref("xai_pref_features_board", false);
    const { result } = renderHook(() => useFeaturePrefs());
    const filtered = filterModulesByFeaturePrefs(
      webShellModuleRegistrations,
      result.current,
    );
    expect(filtered.map((m) => m.moduleId)).not.toContain("board");
    // Non-toggleable modules MUST stay.
    expect(filtered.map((m) => m.moduleId)).toContain("ai");
    expect(filtered.map((m) => m.moduleId)).toContain("settings");
    expect(filtered.map((m) => m.moduleId)).toContain("countdown");
    expect(filtered.map((m) => m.moduleId)).toContain("statistics");
  });

  it("AC-APP-3: localStorage persistence — pref set survives a fresh hook mount", () => {
    setPref("xai_pref_features_meditation", false);
    // Fresh renderHook ≈ remount.
    const { result } = renderHook(() => useFeaturePrefs());
    expect(result.current.meditation).toBe(false);
    const filtered = filterModulesByFeaturePrefs(
      webShellModuleRegistrations,
      result.current,
    );
    expect(filtered.map((m) => m.moduleId)).not.toContain("meditation");
  });
});
