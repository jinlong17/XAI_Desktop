/**
 * usePref hook tests — AC-HOOK-1..12
 * Environment: jsdom (default, from vitest.config.ts)
 *
 * Uses React 19 createRoot + act pattern (same as packages/plugin-project tests).
 * React 19 act import: from "react" (not "react-dom/test-utils").
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { createElement, useState } from "react";
import { usePref } from "../internal/usePref.js";
import { _clearAllListeners } from "../internal/storage.js";
import type { WebPrefKey, WebPrefValue } from "../internal/registry.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

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

// Capture slot: last render snapshot
interface HookSnapshot<K extends WebPrefKey> {
  value: WebPrefValue<K>;
  setValue: (
    next:
      | WebPrefValue<K>
      | ((prev: WebPrefValue<K>) => WebPrefValue<K>),
  ) => void;
  meta: { schemaVersion: number; isDefault: boolean; reset: () => void };
}

function createConsumer<K extends WebPrefKey>(
  key: K,
  defaultOverride?: WebPrefValue<K>,
) {
  const snapshot: HookSnapshot<K> = {} as HookSnapshot<K>;

  function Consumer() {
    const [value, setValue, meta] = usePref(key, defaultOverride);
    snapshot.value = value;
    snapshot.setValue = setValue;
    snapshot.meta = meta;
    return null;
  }

  return { snapshot, Consumer };
}

// ---------------------------------------------------------------------------
// AC-HOOK-1: Initial render with empty storage returns default
// ---------------------------------------------------------------------------

describe("AC-HOOK-1: initial value is registry default when storage empty", () => {
  it("usePref('xai_accent_hue') returns 165", async () => {
    const { snapshot, Consumer } = createConsumer("xai_accent_hue");
    await act(async () => {
      root.render(createElement(Consumer));
    });
    expect(snapshot.value).toBe(165);
  });
});

// ---------------------------------------------------------------------------
// AC-HOOK-2: Initial render with seeded storage returns seeded value
// ---------------------------------------------------------------------------

describe("AC-HOOK-2: initial value from localStorage when key present", () => {
  it("seeded 200 → value === 200", async () => {
    localStorage.setItem("xai_accent_hue", "200");
    const { snapshot, Consumer } = createConsumer("xai_accent_hue");
    await act(async () => {
      root.render(createElement(Consumer));
    });
    expect(snapshot.value).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// AC-HOOK-3: setValue(220) updates state + writes localStorage
// ---------------------------------------------------------------------------

describe("AC-HOOK-3: setValue updates state and writes localStorage", () => {
  it("setValue(220) → value === 220 and localStorage has '220'", async () => {
    const { snapshot, Consumer } = createConsumer("xai_accent_hue");
    await act(async () => {
      root.render(createElement(Consumer));
    });
    await act(async () => {
      snapshot.setValue(220);
    });
    expect(snapshot.value).toBe(220);
    expect(localStorage.getItem("xai_accent_hue")).toBe("220");
  });
});

// ---------------------------------------------------------------------------
// AC-HOOK-4: Functional updater setValue(prev => prev + 1)
// ---------------------------------------------------------------------------

describe("AC-HOOK-4: functional updater works", () => {
  it("from default 165, setValue(prev => prev + 1) yields 166", async () => {
    const { snapshot, Consumer } = createConsumer("xai_accent_hue");
    await act(async () => {
      root.render(createElement(Consumer));
    });
    await act(async () => {
      snapshot.setValue((prev) => (prev as number) + 1 as never);
    });
    expect(snapshot.value).toBe(166);
  });
});

// ---------------------------------------------------------------------------
// AC-HOOK-5: meta.isDefault is true when key absent
// ---------------------------------------------------------------------------

describe("AC-HOOK-5: meta.isDefault true when key absent", () => {
  it("empty storage → meta.isDefault === true", async () => {
    const { snapshot, Consumer } = createConsumer("xai_accent_hue");
    await act(async () => {
      root.render(createElement(Consumer));
    });
    expect(snapshot.meta.isDefault).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// AC-HOOK-6: meta.isDefault flips to false after setValue
// ---------------------------------------------------------------------------

describe("AC-HOOK-6: meta.isDefault flips to false after setValue", () => {
  it("after setValue → meta.isDefault === false", async () => {
    const { snapshot, Consumer } = createConsumer("xai_accent_hue");
    await act(async () => {
      root.render(createElement(Consumer));
    });
    await act(async () => {
      snapshot.setValue(220);
    });
    expect(snapshot.meta.isDefault).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AC-HOOK-7: meta.reset() restores default and removes key
// ---------------------------------------------------------------------------

describe("AC-HOOK-7: meta.reset restores default and removes localStorage key", () => {
  it("set then reset → value=165, key absent, isDefault=true", async () => {
    const { snapshot, Consumer } = createConsumer("xai_accent_hue");
    await act(async () => {
      root.render(createElement(Consumer));
    });
    await act(async () => {
      snapshot.setValue(220);
    });
    expect(snapshot.value).toBe(220);

    await act(async () => {
      snapshot.meta.reset();
    });
    expect(snapshot.value).toBe(165);
    expect(localStorage.getItem("xai_accent_hue")).toBeNull();
    expect(snapshot.meta.isDefault).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// AC-HOOK-8: Cross-tab storage event updates value
// ---------------------------------------------------------------------------

describe("AC-HOOK-8: cross-tab storage event updates value", () => {
  it("dispatching StorageEvent updates value", async () => {
    const { snapshot, Consumer } = createConsumer("xai_accent_hue");
    await act(async () => {
      root.render(createElement(Consumer));
    });
    expect(snapshot.value).toBe(165);

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "xai_accent_hue",
          newValue: "300",
          storageArea: localStorage,
        }),
      );
    });
    expect(snapshot.value).toBe(300);
  });
});

// ---------------------------------------------------------------------------
// AC-HOOK-9: storage event with key===null (localStorage.clear) resets value
// ---------------------------------------------------------------------------

describe("AC-HOOK-9: storage event with key=null resets to default", () => {
  it("key=null event resets value to 165", async () => {
    localStorage.setItem("xai_accent_hue", "300");
    const { snapshot, Consumer } = createConsumer("xai_accent_hue");
    await act(async () => {
      root.render(createElement(Consumer));
    });
    expect(snapshot.value).toBe(300);

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: null,
          newValue: null,
          storageArea: localStorage,
        }),
      );
    });
    expect(snapshot.value).toBe(165);
  });
});

// ---------------------------------------------------------------------------
// AC-HOOK-10: Two hook instances in same tab observe same-tab writes
// ---------------------------------------------------------------------------

describe("AC-HOOK-10: two hook instances observe same-tab writes via pub/sub", () => {
  it("setValue from instance A is observed by instance B", async () => {
    const snapshotA: { value: number; setValue: ((n: number) => void) } = {
      value: 0,
      setValue: () => {},
    };
    const snapshotB: { value: number } = { value: 0 };

    function ConsumerA() {
      const [value, setValue] = usePref("xai_accent_hue");
      snapshotA.value = value as number;
      snapshotA.setValue = setValue as (n: number) => void;
      return null;
    }

    function ConsumerB() {
      const [value] = usePref("xai_accent_hue");
      snapshotB.value = value as number;
      return null;
    }

    function Both() {
      return createElement("div", null, createElement(ConsumerA), createElement(ConsumerB));
    }

    await act(async () => {
      root.render(createElement(Both));
    });

    expect(snapshotA.value).toBe(165);
    expect(snapshotB.value).toBe(165);

    await act(async () => {
      snapshotA.setValue(400);
    });

    expect(snapshotA.value).toBe(400);
    expect(snapshotB.value).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// AC-HOOK-11: defaultOverride takes precedence over registry default
// ---------------------------------------------------------------------------

describe("AC-HOOK-11: defaultOverride overrides registry default when storage empty", () => {
  it("usePref('xai_accent_hue', 99) returns 99 when storage empty", async () => {
    const { snapshot, Consumer } = createConsumer("xai_accent_hue", 99);
    await act(async () => {
      root.render(createElement(Consumer));
    });
    expect(snapshot.value).toBe(99);
    expect(snapshot.meta.isDefault).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// AC-HOOK-12: JSON parse failure on initial mount logs and returns default
// ---------------------------------------------------------------------------

describe("AC-HOOK-12: JSON parse failure returns default and logs", () => {
  it("corrupt xai_zones value returns [] and warns", async () => {
    localStorage.setItem("xai_zones", "{broken");
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const { snapshot, Consumer } = createConsumer("xai_zones");
    await act(async () => {
      root.render(createElement(Consumer));
    });
    expect(snapshot.value).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Bonus: meta.schemaVersion reflects registry entry
// ---------------------------------------------------------------------------

describe("meta.schemaVersion", () => {
  it("is 1 for xai_accent_hue in v1", async () => {
    const { snapshot, Consumer } = createConsumer("xai_accent_hue");
    await act(async () => {
      root.render(createElement(Consumer));
    });
    expect(snapshot.meta.schemaVersion).toBe(1);
  });
});
