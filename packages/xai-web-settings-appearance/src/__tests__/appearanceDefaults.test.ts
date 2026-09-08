/**
 * AC-DEF-1..AC-DEF-9 — appearanceDefaults parity with chassis resetAllPrefs().
 * Strategy (M2): subscribe onWebEvent before calling resetAllPrefs(), capture
 * 7 emits into a Map, build an appearance-subset object, deep-equal against
 * appearanceDefaults. No direct chassis @internal import.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { onWebEvent } from "@repo/xai-web-event-bus";
import { resetAllPrefs } from "@repo/plugin-web-settings-shell";
import { appearanceDefaults } from "../appearanceDefaults.js";
import type { AppearanceDefaults } from "../types.js";

type CapturedMap = Map<string, unknown>;

function captureResetAllPrefsEmits(): CapturedMap {
  const captured: CapturedMap = new Map();
  // onWebEvent passes the payload directly (not wrapped in {detail})
  const off = onWebEvent("web:settings:preference-changed", (payload) => {
    captured.set(payload.key, payload.value);
  });
  resetAllPrefs();
  off();
  return captured;
}

describe("appearanceDefaults parity", () => {
  let captured: CapturedMap;

  beforeEach(() => {
    captured = captureResetAllPrefsEmits();
  });

  it("AC-DEF-1: chassis emits theme='light'; appearanceDefaults.theme matches", () => {
    expect(captured.get("theme")).toBe("light");
    expect(appearanceDefaults.theme).toBe("light");
  });

  it("AC-DEF-2: chassis emits density='comfortable'; appearanceDefaults.density matches", () => {
    expect(captured.get("density")).toBe("comfortable");
    expect(appearanceDefaults.density).toBe("comfortable");
  });

  it("AC-DEF-3: chassis emits fontScale=1; appearanceDefaults.fontScale matches", () => {
    expect(captured.get("fontScale")).toBe(1);
    expect(appearanceDefaults.fontScale).toBe(1);
  });

  it("AC-DEF-4: chassis emits accentHue=165; appearanceDefaults.accentHue matches", () => {
    expect(captured.get("accentHue")).toBe(165);
    expect(appearanceDefaults.accentHue).toBe(165);
  });

  it("AC-DEF-5: chassis emits railPos='left'; appearanceDefaults.railPos matches", () => {
    expect(captured.get("railPos")).toBe("left");
    expect(appearanceDefaults.railPos).toBe("left");
  });

  it("AC-DEF-6: chassis emits bgTone='default'; appearanceDefaults.bgTone matches", () => {
    expect(captured.get("bgTone")).toBe("default");
    expect(appearanceDefaults.bgTone).toBe("default");
  });

  it("AC-DEF-7: appearanceDefaults does NOT contain a lang key", () => {
    expect(Object.keys(appearanceDefaults)).not.toContain("lang");
    // chassis DOES emit lang — but the pane's per-pane Reset intentionally excludes it
    expect(captured.has("lang")).toBe(true);
  });

  it("AC-DEF-8: appearanceDefaults is frozen", () => {
    expect(Object.isFrozen(appearanceDefaults)).toBe(true);
  });

  it("AC-DEF-9: every key of appearanceDefaults is captured from resetAllPrefs()", () => {
    const keys = Object.keys(appearanceDefaults) as Array<keyof AppearanceDefaults>;
    for (const key of keys) {
      expect(captured.has(key), `missing key: ${key}`).toBe(true);
      expect(captured.get(key)).toBe(appearanceDefaults[key]);
    }
  });
});
