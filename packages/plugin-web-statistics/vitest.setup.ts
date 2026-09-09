import { accountScope } from "@repo/plugin-web-storage";
import { beforeEach as beforeAccountTest } from "vitest";
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// Explicit authenticated context; raw Storage remains unmodified.
beforeAccountTest(() => { accountScope.activate(accountScope.lock("consumer-test"), "fixture"); });
