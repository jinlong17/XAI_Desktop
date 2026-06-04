import "@testing-library/jest-dom";
import { afterEach, beforeEach, vi } from "vitest";

const TEST_NOW = new Date(2026, 5, 2, 10, 30, 0);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TEST_NOW);
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});
