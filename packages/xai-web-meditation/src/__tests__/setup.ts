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
//
// Native Web Locks accepts both `request(name, run)` and
// `request(name, options, run)`. Session control uses the two-argument form,
// but account-scoped canonical writes (browserAccountLock) use the
// three-argument one, so resolve the callback from either position.
//
// Queue per lock name rather than globally: account writes nest — the shared
// account lifecycle lock is held while an inner lock is requested — and a
// single queue would make the inner request await the outer request's own
// result and deadlock. Same-name requests stay serialized.
beforeEach(() => {
  const tails = new Map<string, Promise<unknown>>();
  Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: (name: string, optionsOrRun: unknown, maybeRun?: () => unknown) => {
    const action = (typeof optionsOrRun === 'function' ? optionsOrRun : maybeRun!) as () => unknown;
    const next = (tails.get(name) ?? Promise.resolve<unknown>(undefined)).then(action);
    tails.set(name, next.catch(() => undefined));
    return next;
  } } });
});
