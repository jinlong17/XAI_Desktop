import { beforeEach } from "vitest";

/** Clear localStorage before each test to ensure test isolation. */
beforeEach(() => {
  localStorage.clear();
});

/** Patch window.innerWidth / innerHeight to deterministic defaults (1280 × 800). */
Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1280,
});
Object.defineProperty(window, "innerHeight", {
  writable: true,
  configurable: true,
  value: 800,
});
