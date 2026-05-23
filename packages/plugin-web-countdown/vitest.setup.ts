import { vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";

// jsdom doesn't implement HTMLDialogElement methods — shim:
if (typeof HTMLDialogElement !== "undefined") {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
}

// Set a stable test "now" for date math
const TEST_NOW = new Date(2026, 4, 23, 14, 30, 0); // 2026-05-23 14:30 local

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TEST_NOW);
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});
