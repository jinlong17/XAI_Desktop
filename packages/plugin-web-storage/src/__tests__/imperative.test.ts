/**
 * Imperative helper tests — AC-IMP-1..11
 * Tests: getPref / setPref / removePref round-trips, error handling, idempotency.
 *
 * Environment: jsdom (from vitest.config.ts)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getPref, setPref, removePref } from "../internal/storage.js";
import { _clearAllListeners } from "../internal/storage.js";

beforeEach(() => {
  localStorage.clear();
  _clearAllListeners();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AC-IMP-1: getPref returns default when key absent", () => {
  it("xai_accent_hue default is 165", () => {
    expect(getPref("xai_accent_hue")).toBe(165);
  });

  it("xai_ai_insights default is true", () => {
    expect(getPref("xai_ai_insights")).toBe(true);
  });

  it("xai_zones default is empty array", () => {
    expect(getPref("xai_zones")).toEqual([]);
  });
});

describe("AC-IMP-2: setPref/getPref round-trip for number codec", () => {
  it("setPref(xai_accent_hue, 200) then getPref returns 200", () => {
    setPref("xai_accent_hue", 200);
    expect(getPref("xai_accent_hue")).toBe(200);
  });
});

describe("AC-IMP-3: setPref/getPref round-trip for string codec", () => {
  it("setPref(xai_rail_pos, 'right') then getPref returns 'right'", () => {
    setPref("xai_rail_pos", "right");
    expect(getPref("xai_rail_pos")).toBe("right");
  });
});

describe("AC-IMP-4: setPref/getPref round-trip for boolean codec", () => {
  it("setPref(xai_ai_insights, false) then getPref returns false", () => {
    setPref("xai_ai_insights", false);
    expect(getPref("xai_ai_insights")).toBe(false);
  });

  it("setPref(xai_ai_voice, true) then getPref returns true", () => {
    setPref("xai_ai_voice", true);
    expect(getPref("xai_ai_voice")).toBe(true);
  });
});

describe("AC-IMP-5: setPref/getPref round-trip for json codec", () => {
  it("setPref(xai_rail_order, ['board','tasks']) then getPref returns the array", () => {
    setPref("xai_rail_order", ["board", "tasks"] as never);
    expect(getPref("xai_rail_order")).toEqual(["board", "tasks"]);
  });

  it("setPref(xai_pet_pos, {x:10,y:20}) then getPref returns the object", () => {
    setPref("xai_pet_pos", { x: 10, y: 20 });
    expect(getPref("xai_pet_pos")).toEqual({ x: 10, y: 20 });
  });
});

describe("AC-IMP-6: removePref then getPref returns default", () => {
  it("sets then removes xai_accent_hue — getPref returns 165", () => {
    setPref("xai_accent_hue", 200);
    expect(getPref("xai_accent_hue")).toBe(200);
    removePref("xai_accent_hue");
    expect(getPref("xai_accent_hue")).toBe(165);
  });
});

describe("AC-IMP-7: corrupt JSON in storage returns default + warns", () => {
  it("corrupt xai_zones value returns [] and calls console.warn once", () => {
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    localStorage.setItem("xai_zones", "{not json");
    const result = getPref("xai_zones");
    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0]?.[0]).toMatch(/decode failed for xai_zones/);
  });
});

describe("AC-IMP-8: type-mismatched value returns default", () => {
  it("'abc' stored for number codec xai_accent_hue returns 165", () => {
    localStorage.setItem("xai_accent_hue", "abc");
    expect(getPref("xai_accent_hue")).toBe(165);
  });

  it("'notbool' stored for boolean codec xai_ai_insights returns true (default)", () => {
    localStorage.setItem("xai_ai_insights", "notbool");
    expect(getPref("xai_ai_insights")).toBe(true);
  });
});

describe("AC-IMP-9: setPref returns true on success", () => {
  it("setPref(xai_accent_hue, 100) returns true", () => {
    const result = setPref("xai_accent_hue", 100);
    expect(result).toBe(true);
  });
});

describe("AC-IMP-10: setPref returns false on QuotaExceededError", () => {
  it("mocked QuotaExceededError causes setPref to return false and log", () => {
    // First set to ensure existing !== new value (to trigger the write path)
    localStorage.setItem("xai_accent_hue", "100");

    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    const result = setPref("xai_accent_hue", 250);
    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0]?.[0]).toMatch(/quota exceeded/i);
  });
});

describe("AC-IMP-11: setPref with identical-to-current value does NOT call setItem", () => {
  it("writing the same value twice: second write skips localStorage.setItem", () => {
    // Initial write (will call setItem)
    setPref("xai_accent_hue", 200);

    // Spy AFTER the first write
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    // Write same value again — should skip
    setPref("xai_accent_hue", 200);
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
