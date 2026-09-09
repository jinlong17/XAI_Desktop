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
