/**
 * Vitest global setup for @repo/plugin-web-matrix tests.
 * Clears localStorage + DOM state between tests.
 * Mirrors xai-web-shell/src/__tests__/setup.ts.
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
