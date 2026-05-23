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
