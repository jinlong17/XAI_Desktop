import { accountScope } from "@repo/plugin-web-storage";
import { beforeEach as beforeAccountTest } from "vitest";
/**
 * Vitest global setup for @repo/plugin-web-meditation tests.
 * Clears localStorage + DOM state between tests and resets fake timers.
 */
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// Explicit authenticated context; raw Storage remains unmodified.
beforeAccountTest(() => { accountScope.activate(accountScope.lock("consumer-test"), "fixture"); });

// Explicit unit-only Web Locks model. Native concurrency is checked separately.
beforeEach(() => {
  let queue = Promise.resolve<unknown>(undefined);
  Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: (_name: string, action: () => unknown) => {
    const next = queue.then(action); queue = next.catch(() => undefined); return next;
  } } });
});
