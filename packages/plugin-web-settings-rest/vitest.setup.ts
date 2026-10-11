import { accountScope } from "@repo/plugin-web-storage";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// Feature fixtures own a demo generation; raw legacy keys remain quarantined.
beforeEach(() => {
  accountScope.activate(accountScope.lock("settings-fixture"), "fixture-generation", true);
});
