import { vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";

// Set a stable test "now" — 2026-05-23 14:30 local (matches countdown precedent)
const TEST_NOW = new Date(2026, 4, 23, 14, 30, 0); // 2026-05-23 14:30 local

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TEST_NOW);
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});
