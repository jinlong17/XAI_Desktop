/**
 * Vitest global setup for @repo/plugin-web-dashboard-grid tests.
 * Clears localStorage + DOM state between tests.
 * Mirrors xai-web-matrix/src/__tests__/setup.ts.
 */
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
