/**
 * Vitest global setup for @repo/plugin-web-habits tests.
 * Clears localStorage + DOM state between tests.
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
