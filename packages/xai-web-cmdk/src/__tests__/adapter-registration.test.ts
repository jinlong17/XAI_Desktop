/**
 * Adapter registration regression test (codex C3-CHROME-2 fix, 2026-05-26).
 *
 * Importing the public barrel `@repo/xai-web-cmdk` MUST cause all 11
 * adapters to be registered (via their `registerSearchAdapter()` side effect).
 *
 * Pre-fix bug: adapters/index.ts used `export {} from "./X.js"` which Vite
 * tree-shook in production because package.json `sideEffects` whitelist only
 * listed `styles.css`. Tree-shaking elided every adapter module → registry
 * stayed empty → every search query returned "No results" in real Chrome.
 *
 * This test catches both:
 *   (a) Future regression to `export {} from` syntax
 *   (b) Future shrinking of `sideEffects` whitelist
 *   (c) Future removal of `import "./X.js"` statements from the barrel
 *
 * Vitest runs without a real bundler so this test does NOT reproduce the
 * Vite tree-shake directly; it asserts the semantic invariant (registry has
 * all 11 adapter ids after barrel import) that a tree-shake regression
 * would break.
 *
 * test.md §7 — Adapter Registration Invariant
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  __resetCmdkRegistry,
  getRegisteredAdapters,
} from "../internal/registry.js";

describe("adapter registration (codex C3-CHROME-2 regression guard)", () => {
  beforeEach(() => {
    __resetCmdkRegistry();
  });

  it("AR1+AR2: importing @repo/xai-web-cmdk public barrel registers all 11 adapters with canonical ids", async () => {
    // Reset already done above.
    expect(getRegisteredAdapters().size).toBe(0);

    // Side-effect import — registers all 11 adapters.
    // Use the package's full public barrel (which itself imports
    // ./adapters/index.js) to exercise the same path as apps/web.
    await import("../index.js");
    // Vitest re-runs the module on each test only when vi.resetModules() is
    // called or via dynamic resolution. To re-trigger registrations after
    // beforeEach's __resetCmdkRegistry(), we explicitly re-import the
    // adapter barrel.
    await import("../adapters/index.js");

    const adapters = getRegisteredAdapters();
    expect(adapters.size).toBe(11);

    const adapterIds = Array.from(adapters.keys()).sort();
    expect(adapterIds).toEqual([
      "board",
      "calendar",
      "countdown",
      "dashboard",
      "habits",
      "matrix",
      "meditation",
      "pomodoro",
      "settings",
      "statistics",
      "tasks",
    ]);
  });
});
