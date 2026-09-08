/**
 * Vitest global setup for @repo/xai-web-shell tests.
 * Resets DOM state and localStorage between tests.
 */
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.removeAttribute("data-bg-tone");
  document.documentElement.removeAttribute("data-rail-pos");
  document.documentElement.style.cssText = "";
  vi.clearAllMocks();
});
