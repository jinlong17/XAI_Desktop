import { accountScope } from "@repo/plugin-web-storage";
import { beforeEach as beforeAccountTest } from "vitest";
import { vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";

// Set a stable test "now" — 2026-05-23 14:30 local (matches countdown precedent)
const TEST_NOW = new Date(2026, 4, 23, 14, 30, 0); // 2026-05-23 14:30 local

// jsdom lacks showModal/close — polyfill for dialog-based components (TaskComposer).
// Mirrors packages/xai-web-calendar/src/__tests__/setup.ts pattern.
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

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TEST_NOW);
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
  cleanup();
});

// Explicit authenticated context; raw Storage remains unmodified.
beforeAccountTest(() => { accountScope.activate(accountScope.lock("consumer-test"), "fixture"); });
