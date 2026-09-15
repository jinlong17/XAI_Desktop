import { accountScope, generationMarkerKey, setCanonicalCommandActivationForTests } from "@repo/plugin-web-storage";
import { beforeEach as beforeAccountTest } from "vitest";
/**
 * Vitest global setup for @repo/plugin-web-calendar tests.
 *
 * - Clears localStorage + DOM state between tests.
 * - Polyfills HTMLDialogElement methods (jsdom lacks showModal/close).
 *   Per `plugin-web-board-workspaces/__tests__/CardDetailDialog.test.tsx`
 *   pattern; required by the EventComposer dialog (P2+).
 */
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom lacks showModal/close — polyfill once for the whole suite. Tests
// may also call HTMLDialogElement.prototype.showModal as a spy if they
// want to assert the call shape; the no-op default toggles `open` so
// downstream `if (el.open)` guards stay consistent.
if (typeof HTMLDialogElement !== "undefined") {
  if (typeof HTMLDialogElement.prototype.showModal !== "function") {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
  }
  if (typeof HTMLDialogElement.prototype.close !== "function") {
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    };
  }
}

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  setCanonicalCommandActivationForTests(true);
  // Native Web Locks accepts both `request(name, run)` and `request(name, options, run)`.
  // Account-scoped canonical writes use the three-argument form (browserAccountLock),
  // so the shim must resolve the callback from either position.
  vi.stubGlobal("navigator", { locks: { request: vi.fn(async (_name: string, optionsOrRun: unknown, maybeRun?: () => Promise<unknown>) => (typeof optionsOrRun === "function" ? optionsOrRun as () => Promise<unknown> : maybeRun!)()) } });
});

// Explicit authenticated context; raw Storage remains unmodified.
beforeAccountTest(() => {
  accountScope.activate(accountScope.lock("consumer-test"), "fixture");
  localStorage.setItem(generationMarkerKey("consumer-test"), JSON.stringify({ generation: "fixture", migrationId: "test", previous: null }));
});
