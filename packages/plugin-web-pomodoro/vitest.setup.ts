import { accountScope } from "@repo/plugin-web-storage";
import { beforeEach as beforeAccountTest } from "vitest";
import { vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";

// requestAnimationFrame polyfill driven by fake timers
if (typeof globalThis.requestAnimationFrame !== "function") {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback): number => {
    return setTimeout(() => cb(Date.now()), 16) as unknown as number;
  };
}
if (typeof globalThis.cancelAnimationFrame !== "function") {
  globalThis.cancelAnimationFrame = (id: number): void => {
    clearTimeout(id);
  };
}

// Set a stable test "now"
const TEST_NOW = new Date(2026, 4, 23, 14, 30, 0); // 2026-05-23 14:30 local

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TEST_NOW);
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

// Explicit authenticated context; raw Storage remains unmodified.
beforeAccountTest(() => { accountScope.activate(accountScope.lock("consumer-test"), "fixture"); });

// Browser primitive fixture: exclusive callbacks run sequentially, as Web Locks do.
// Product code never substitutes this when the real API is unavailable.
beforeEach(() => {
  const queues = new Map<string, Promise<unknown>>();
  Object.defineProperty(navigator, "locks", { configurable: true, value: {
    request: (name: string, run: () => unknown) => {
      const previous = queues.get(name) ?? Promise.resolve();
      const result = previous.then(run);
      queues.set(name, result.catch(() => undefined));
      return result;
    },
  } });
});
