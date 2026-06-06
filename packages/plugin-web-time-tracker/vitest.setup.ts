import { afterEach, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";

const TEST_NOW = new Date(2026, 4, 23, 10, 30, 0);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TEST_NOW);
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});
