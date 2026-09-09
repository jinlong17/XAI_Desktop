import { accountScope } from "@repo/plugin-web-storage";
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
});

// Explicit authenticated context; raw Storage remains unmodified.
beforeAccountTest(() => { accountScope.activate(accountScope.lock("consumer-test"), "fixture"); });
