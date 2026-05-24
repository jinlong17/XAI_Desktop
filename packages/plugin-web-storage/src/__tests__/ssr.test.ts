// @vitest-environment node
/**
 * SSR smoke tests — AC-SSR-1..6
 * Environment: Node (no jsdom, no window object)
 *
 * Validates that the package can be imported and all imperative functions
 * work in a Node environment (simulating SSR).
 */

import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// AC-SSR-1: import does not throw in Node
// ---------------------------------------------------------------------------

describe("AC-SSR-1: bare import does not throw", () => {
  it("all public exports load without error", async () => {
    const api = await import("../index.js");
    expect(typeof api.PREF_REGISTRY).toBe("object");
    expect(typeof api.getPref).toBe("function");
    expect(typeof api.setPref).toBe("function");
    expect(typeof api.removePref).toBe("function");
    expect(typeof api.isPrefKey).toBe("function");
    expect(typeof api.migrate).toBe("function");
    expect(typeof api.usePref).toBe("function");
    expect(typeof api.usePrefAutosave).toBe("function");
    // S1 sub-fix additions — xai_pref_* read-path imperative helpers.
    expect(typeof api.getPrefAutosave).toBe("function");
    expect(typeof api.setPrefAutosave).toBe("function");
    expect(typeof api.removePrefAutosave).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// AC-SSR-2: getPref returns default in Node (no localStorage)
// ---------------------------------------------------------------------------

describe("AC-SSR-2: getPref returns registry default in SSR", () => {
  it("getPref('xai_accent_hue') returns 165 in Node", async () => {
    const { getPref } = await import("../index.js");
    expect(getPref("xai_accent_hue")).toBe(165);
  });

  it("getPref('xai_ai_insights') returns true in Node", async () => {
    const { getPref } = await import("../index.js");
    expect(getPref("xai_ai_insights")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// AC-SSR-3: setPref returns false and does not throw in Node
// ---------------------------------------------------------------------------

describe("AC-SSR-3: setPref returns false in SSR and does not throw", () => {
  it("setPref('xai_accent_hue', 200) returns false and no throw", async () => {
    const { setPref } = await import("../index.js");
    let result: boolean | undefined;
    expect(() => {
      result = setPref("xai_accent_hue", 200);
    }).not.toThrow();
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AC-SSR-4: removePref does not throw in Node
// ---------------------------------------------------------------------------

describe("AC-SSR-4: removePref does not throw in SSR", () => {
  it("removePref('xai_accent_hue') does not throw", async () => {
    const { removePref } = await import("../index.js");
    expect(() => {
      removePref("xai_accent_hue");
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// AC-SSR-5: isPrefKey works in Node (pure regex, no window)
// ---------------------------------------------------------------------------

describe("AC-SSR-5: isPrefKey works in Node", () => {
  it("isPrefKey('xai_pref_x') returns true in Node", async () => {
    const { isPrefKey } = await import("../index.js");
    expect(isPrefKey("xai_pref_x")).toBe(true);
  });

  it("isPrefKey('xai_accent_hue') returns false in Node", async () => {
    const { isPrefKey } = await import("../index.js");
    expect(isPrefKey("xai_accent_hue")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AC-SSR-6: migrate does not throw in Node
// ---------------------------------------------------------------------------

describe("AC-SSR-6: migrate does not throw in SSR", () => {
  it("migrate(1, 1) in Node does not throw", async () => {
    const { migrate } = await import("../index.js");
    expect(() => {
      migrate(1, 1);
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// AC-SSR-7: xai_pref_* read-path SSR fallback (S1 sub-fix)
// ---------------------------------------------------------------------------

describe("AC-SSR-7: getPrefAutosave returns defaultValue under SSR", () => {
  it("getPrefAutosave('any_suffix', { defaultValue: 'x' }) returns 'x' in Node", async () => {
    const { getPrefAutosave } = await import("../index.js");
    expect(
      getPrefAutosave<string>("ssr_suffix_smoke", { defaultValue: "x" }),
    ).toBe("x");
  });

  it("getPrefAutosave without defaultValue returns undefined in Node", async () => {
    const { getPrefAutosave } = await import("../index.js");
    expect(getPrefAutosave<string>("ssr_suffix_no_default")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// AC-SSR-8: setPrefAutosave / removePrefAutosave no-op under SSR
// ---------------------------------------------------------------------------

describe("AC-SSR-8: setPrefAutosave / removePrefAutosave no-op safely in SSR", () => {
  it("setPrefAutosave('x', 'v') returns false in Node and does not throw", async () => {
    const { setPrefAutosave } = await import("../index.js");
    let result: boolean | undefined;
    expect(() => {
      result = setPrefAutosave<string>("ssr_set_smoke", "v");
    }).not.toThrow();
    expect(result).toBe(false);
  });

  it("removePrefAutosave('x') does not throw in Node", async () => {
    const { removePrefAutosave } = await import("../index.js");
    expect(() => {
      removePrefAutosave("ssr_remove_smoke");
    }).not.toThrow();
  });
});
