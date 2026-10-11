import "@testing-library/jest-dom/vitest";
// fake-indexeddb MUST be imported before any IDB-using module — it patches
// globalThis.indexedDB in-process so tests can run without a real browser.
import "fake-indexeddb/auto";
import { afterEach, beforeEach, vi } from "vitest";

// WebCrypto guard — fail fast if jsdom is missing crypto.subtle.
if (typeof globalThis.crypto?.subtle === "undefined") {
  throw new Error(
    "[vitest.setup] WebCrypto (crypto.subtle) not available — upgrade jsdom or use a newer Node version.",
  );
}

// Defensive rAF polyfill — jsdom provides one but we keep the seam for clarity.
if (typeof globalThis.requestAnimationFrame !== "function") {
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback): number => {
    return setTimeout(() => cb(performance.now()), 16) as unknown as number;
  }) as typeof globalThis.requestAnimationFrame;
  globalThis.cancelAnimationFrame = ((id: number): void => {
    clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
  }) as typeof globalThis.cancelAnimationFrame;
}

// jsdom does not implement scrollIntoView — provide a no-op so the bottom-
// sentinel scroll effect doesn't throw.
if (!("scrollIntoView" in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    value: function scrollIntoViewStub() {
      /* no-op */
    },
    writable: true,
    configurable: true,
  });
}

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
  // Note: fake-indexeddb is isolated per test FILE (each file runs in its own
  // vm context), so database cleanup between tests within a file is handled
  // by per-test beforeEach in the secretStore / no-plaintext-key test files.
  // We do NOT call indexedDB.deleteDatabase() here because idb-keyval's
  // createStore memoizes the DB promise in a closure, and deleting the DB
  // makes subsequent opens hang until the delete request resolves.
});

// Tests explicitly enter an isolated committed account; production starts locked.
beforeEach(async () => {
 const { accountScope, generationMarkerKey } = await import("@repo/plugin-web-storage");
 const transition=accountScope.lock("ai-test-account");
 localStorage.setItem(generationMarkerKey("ai-test-account"),JSON.stringify({generation:"test",migrationId:"test",previous:null}));
 accountScope.activate(transition,"test");
});
