import { accountScope } from "@repo/plugin-web-storage";
import { afterEach, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";

const TEST_NOW = new Date(2026, 4, 25, 8, 30, 0);

beforeEach(() => {
  accountScope.activate(accountScope.lock("repository-test"), "fixture");
  vi.useFakeTimers();
  vi.setSystemTime(TEST_NOW);
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});
