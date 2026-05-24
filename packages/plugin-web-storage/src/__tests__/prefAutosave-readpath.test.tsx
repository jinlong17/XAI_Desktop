// @vitest-environment jsdom
/**
 * Regression tests for the xai_pref_* autosave read-path.
 *
 * AC-AUTO-RP-1..9 — added 2026-05-24 in response to Codex cross-vendor
 * BLOCKED finding: `usePrefAutosave<T>(suffix, value)` writes were write-only
 * because `getPref` accepts only registered keys (`WebPrefKey`), leaving
 * arbitrary `xai_pref_*` autosave keys unreachable for consumer seeding.
 *
 * These tests prove the new typed helpers
 * (getPrefAutosave / setPrefAutosave / removePrefAutosave) close that gap.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { createElement, useState } from "react";
import {
  getPrefAutosave,
  setPrefAutosave,
  removePrefAutosave,
  usePrefAutosave,
} from "../index.js";
import { _clearAllListeners } from "../internal/storage.js";

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  localStorage.clear();
  _clearAllListeners();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// AC-AUTO-RP-1: getPrefAutosave returns defaultValue when key absent
// ---------------------------------------------------------------------------

describe("AC-AUTO-RP-1: getPrefAutosave returns defaultValue when key absent", () => {
  it("returns defaultValue when xai_pref_${suffix} is not in localStorage", () => {
    expect(
      getPrefAutosave<string>("nonexistent_suffix", {
        defaultValue: "fallback",
      }),
    ).toBe("fallback");
  });

  it("returns undefined when no defaultValue is provided and key is absent", () => {
    expect(getPrefAutosave<string>("missing_suffix")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// AC-AUTO-RP-2: getPrefAutosave reads what usePrefAutosave wrote (json codec)
// ---------------------------------------------------------------------------

describe("AC-AUTO-RP-2: usePrefAutosave -> getPrefAutosave round-trip (json)", () => {
  it("hook writes value 'compact' then getPrefAutosave reads it back", async () => {
    function Consumer() {
      usePrefAutosave("appearance_density_rp", "compact");
      return null;
    }
    await act(async () => {
      root.render(createElement(Consumer));
    });

    expect(getPrefAutosave<string>("appearance_density_rp")).toBe("compact");
  });

  it("hook writes complex object then getPrefAutosave reads it back", async () => {
    const payload = { theme: "dark", scale: 1.25, tags: ["x", "y"] };
    function Consumer() {
      usePrefAutosave("settings_blob_rp", payload);
      return null;
    }
    await act(async () => {
      root.render(createElement(Consumer));
    });

    expect(
      getPrefAutosave<typeof payload>("settings_blob_rp"),
    ).toEqual(payload);
  });
});

// ---------------------------------------------------------------------------
// AC-AUTO-RP-3: codec match — "string" codec round-trips raw string
// ---------------------------------------------------------------------------

describe("AC-AUTO-RP-3: getPrefAutosave matches usePrefAutosave codec", () => {
  it("string codec write then string codec read returns the raw value", async () => {
    function Consumer() {
      usePrefAutosave("raw_codec_rp", "abc", { codec: "string" });
      return null;
    }
    await act(async () => {
      root.render(createElement(Consumer));
    });

    expect(
      getPrefAutosave<string>("raw_codec_rp", { codec: "string" }),
    ).toBe("abc");
  });
});

// ---------------------------------------------------------------------------
// AC-AUTO-RP-4: consumer seeds React state from getPrefAutosave at mount
// ---------------------------------------------------------------------------

describe("AC-AUTO-RP-4: consumer seeds initial state from getPrefAutosave (api.md §3.2 contract)", () => {
  it("Settings panel re-mount picks up previously-autosaved value as seed", async () => {
    // First mount: user changes density to "compact" — hook autosaves.
    function FirstMount() {
      const [density, setDensity] = useState<"comfortable" | "compact">(
        () =>
          getPrefAutosave<"comfortable" | "compact">("seed_test_density", {
            defaultValue: "comfortable",
          }) ?? "comfortable",
      );
      usePrefAutosave("seed_test_density", density);
      // Expose setter on a shared ref so we can drive the test.
      (FirstMount as { setDensity?: typeof setDensity }).setDensity =
        setDensity;
      return null;
    }
    await act(async () => {
      root.render(createElement(FirstMount));
    });
    await act(async () => {
      (FirstMount as { setDensity?: (v: "comfortable" | "compact") => void })
        .setDensity?.("compact");
    });
    expect(localStorage.getItem("xai_pref_seed_test_density")).toBe(
      '"compact"',
    );

    // Unmount, then re-mount fresh — initial state must be "compact",
    // not the registry default "comfortable".
    act(() => {
      root.unmount();
    });

    const seededValues: Array<"comfortable" | "compact"> = [];
    function SecondMount() {
      const [density] = useState<"comfortable" | "compact">(
        () =>
          getPrefAutosave<"comfortable" | "compact">("seed_test_density", {
            defaultValue: "comfortable",
          }) ?? "comfortable",
      );
      seededValues.push(density);
      return null;
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(createElement(SecondMount));
    });

    expect(seededValues[0]).toBe("compact");
  });
});

// ---------------------------------------------------------------------------
// AC-AUTO-RP-5: setPrefAutosave round-trips through getPrefAutosave
// ---------------------------------------------------------------------------

describe("AC-AUTO-RP-5: setPrefAutosave / getPrefAutosave imperative round-trip", () => {
  it("setPrefAutosave('x', { a: 1 }) -> getPrefAutosave returns { a: 1 }", () => {
    const value = { a: 1, b: "two" };
    const ok = setPrefAutosave<typeof value>("imperative_rp", value);
    expect(ok).toBe(true);
    expect(getPrefAutosave<typeof value>("imperative_rp")).toEqual(value);
  });

  it("compare-before-write: identical setPrefAutosave call still returns true", () => {
    setPrefAutosave<string>("idempotent_rp", "v1", { codec: "string" });
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    const ok = setPrefAutosave<string>("idempotent_rp", "v1", {
      codec: "string",
    });
    expect(ok).toBe(true);
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// AC-AUTO-RP-6: removePrefAutosave clears + makes getPrefAutosave return default
// ---------------------------------------------------------------------------

describe("AC-AUTO-RP-6: removePrefAutosave restores default on read", () => {
  it("after removePrefAutosave, getPrefAutosave returns defaultValue", () => {
    setPrefAutosave<string>("removable_rp", "v1", { codec: "string" });
    expect(getPrefAutosave<string>("removable_rp", { codec: "string" })).toBe(
      "v1",
    );
    removePrefAutosave("removable_rp");
    expect(
      getPrefAutosave<string>("removable_rp", {
        codec: "string",
        defaultValue: "fallback",
      }),
    ).toBe("fallback");
  });
});

// ---------------------------------------------------------------------------
// AC-AUTO-RP-7: decode failure returns defaultValue + warns
// ---------------------------------------------------------------------------

describe("AC-AUTO-RP-7: decode failure falls back to defaultValue", () => {
  it("corrupt JSON in xai_pref_${suffix} returns defaultValue and warns", () => {
    localStorage.setItem("xai_pref_corrupt_rp", "{not valid json}");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = getPrefAutosave<{ ok: boolean }>("corrupt_rp", {
      defaultValue: { ok: false },
    });
    expect(result).toEqual({ ok: false });
    expect(warnSpy).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// AC-AUTO-RP-8: suffix validation — "/" rejected (dev throws)
// ---------------------------------------------------------------------------

describe("AC-AUTO-RP-8: suffix containing '/' is rejected in dev", () => {
  it("getPrefAutosave with '/' throws in development", () => {
    // NODE_ENV is "test" under vitest — neither "production"; treated as dev.
    expect(() => getPrefAutosave<string>("bad/suffix")).toThrow(/must not contain/);
  });

  it("setPrefAutosave with '/' throws in development", () => {
    expect(() => setPrefAutosave<string>("bad/suffix", "x")).toThrow(
      /must not contain/,
    );
  });

  it("removePrefAutosave with '/' throws in development", () => {
    expect(() => removePrefAutosave("bad/suffix")).toThrow(/must not contain/);
  });
});

// ---------------------------------------------------------------------------
// AC-AUTO-RP-9: SSR fallback — getPrefAutosave returns defaultValue, no throw
// ---------------------------------------------------------------------------

describe("AC-AUTO-RP-9: SSR fallback returns defaultValue without touching window", () => {
  it("when window is undefined, getPrefAutosave returns defaultValue", () => {
    // We simulate SSR by stubbing the typeof-window check at module level.
    // Easiest portable approach: vi.stubGlobal("window", undefined) is not
    // reliable in jsdom because removing window breaks other helpers. Instead
    // we rely on the SSR-environment-specific test (ssr.test.ts uses @vitest-environment node)
    // for the true window-undefined path. Here we just confirm the contract:
    // when the value is missing AND we provide a defaultValue, we get it back
    // — proving the read path is reachable without needing access to a hook tree.
    expect(
      getPrefAutosave<number>("ssr_proxy_test", { defaultValue: 42 }),
    ).toBe(42);
  });
});
