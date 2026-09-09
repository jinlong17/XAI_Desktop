import { testStorage } from "./accountTestHarness.js";
/**
 * usePrefAutosave tests — AC-AUTO-1..5
 * Environment: jsdom (from vitest.config.ts)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { createElement, useState } from "react";
import { usePrefAutosave } from "../internal/usePrefAutosave.js";
import { isPrefKey } from "../internal/storage.js";
import { _clearAllListeners } from "../internal/storage.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

it("reports failed autosave and retries the latest value", async () => {
  let result: unknown;
  function Consumer({ value }: { value: string }) {
    result = usePrefAutosave("pomodoro_sound", value);
    return null;
  }
  const original = Storage.prototype.setItem;
  const fault = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === "xai_pref_pomodoro_sound") throw new DOMException("quota", "QuotaExceededError");
    original.call(this, key, value);
  });
  await act(async () => { root.render(createElement(Consumer, { value: "first" })); });
  expect((result as { saved: boolean } | undefined)?.saved).toBe(false);
  await act(async () => { root.render(createElement(Consumer, { value: "latest" })); });
  fault.mockRestore();
  await act(async () => { (result as { retry: () => boolean }).retry(); });
  expect((result as { saved: boolean }).saved).toBe(true);
  expect(localStorage.getItem("xai_pref_pomodoro_sound")).toBe('"latest"');
});

it("resaves when the key changes even if the value is unchanged", async () => {
  function Consumer({ suffix }: { suffix: string }) {
    usePrefAutosave(suffix, "same");
    return null;
  }
  await act(async () => { root.render(createElement(Consumer, { suffix: "pomodoro_sound" })); });
  await act(async () => { root.render(createElement(Consumer, { suffix: "pomodoro_theme" })); });
  expect(localStorage.getItem("xai_pref_pomodoro_theme")).toBe('"same"');
});

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
// AC-AUTO-1: First render writes xai_pref_${suffix}
// ---------------------------------------------------------------------------

describe("AC-AUTO-1: first render writes to xai_pref_${suffix}", () => {
  it("renders with value 'compact' → xai_pref_appearance_density === '\"compact\"'", async () => {
    function Consumer() {
      usePrefAutosave("appearance_density", "compact");
      return null;
    }
    await act(async () => {
      root.render(createElement(Consumer));
    });
    expect(testStorage.getItem("xai_pref_appearance_density")).toBe(
      '"compact"',
    );
  });
});

// ---------------------------------------------------------------------------
// AC-AUTO-2: Subsequent value changes write again
// ---------------------------------------------------------------------------

describe("AC-AUTO-2: re-render with new value updates stored value", () => {
  it("changing from compact to comfortable updates localStorage", async () => {
    let setValue: (v: string) => void = () => {};

    function Consumer() {
      const [val, setVal] = useState("compact");
      setValue = setVal;
      usePrefAutosave("appearance_density", val);
      return null;
    }

    await act(async () => {
      root.render(createElement(Consumer));
    });
    expect(testStorage.getItem("xai_pref_appearance_density")).toBe(
      '"compact"',
    );

    await act(async () => {
      setValue("comfortable");
    });
    expect(testStorage.getItem("xai_pref_appearance_density")).toBe(
      '"comfortable"',
    );
  });
});

// ---------------------------------------------------------------------------
// AC-AUTO-3: Same value does NOT write twice (idempotency)
// ---------------------------------------------------------------------------

describe("AC-AUTO-3: same value re-render does NOT call setItem again", () => {
  it("rendering same value twice skips second setItem call", async () => {
    let triggerRender: () => void = () => {};

    function Consumer() {
      const [, setTick] = useState(0);
      triggerRender = () => setTick((t) => t + 1);
      usePrefAutosave("idempotency_test", "fixed-value");
      return null;
    }

    await act(async () => {
      root.render(createElement(Consumer));
    });
    // First write happened
    expect(testStorage.getItem("xai_pref_idempotency_test")).toBe(
      '"fixed-value"',
    );

    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    // Re-render with same value
    await act(async () => {
      triggerRender();
    });
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// AC-AUTO-4: options.codec: "string" writes raw string (not JSON-quoted)
// ---------------------------------------------------------------------------

describe("AC-AUTO-4: options.codec='string' writes raw string", () => {
  it("usePrefAutosave('x', 'abc', { codec: 'string' }) stores 'abc', not '\"abc\"'", async () => {
    function Consumer() {
      usePrefAutosave("raw_string_test", "abc", { codec: "string" });
      return null;
    }
    await act(async () => {
      root.render(createElement(Consumer));
    });
    expect(testStorage.getItem("xai_pref_raw_string_test")).toBe("abc");
  });
});

// ---------------------------------------------------------------------------
// AC-AUTO-5: isPrefKey regex guard
// ---------------------------------------------------------------------------

describe("AC-AUTO-5: isPrefKey regex guard", () => {
  it("isPrefKey('xai_pref_x') === true", () => {
    expect(isPrefKey("xai_pref_x")).toBe(true);
  });

  it("isPrefKey('xai_accent_hue') === false", () => {
    expect(isPrefKey("xai_accent_hue")).toBe(false);
  });

  it("isPrefKey('random') === false", () => {
    expect(isPrefKey("random")).toBe(false);
  });

  it("isPrefKey('xai_pref_appearance_density') === true", () => {
    expect(isPrefKey("xai_pref_appearance_density")).toBe(true);
  });
});
