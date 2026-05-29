import { beforeEach, describe, expect, it } from "vitest";

import {
  __resetDesktopWebImportStateForTests,
  scanDesktopWebImportEligibility,
  setDesktopWebImportRuntimeEnabled,
} from "../internal/desktopWebDataMigration.js";

beforeEach(() => {
  localStorage.clear();
  __resetDesktopWebImportStateForTests();
});

describe("desktop web data import eligibility scan", () => {
  it("keeps scan read-only and reports skipped browser-owned indexeddb stores", () => {
    localStorage.setItem(
      "xai_task_cols",
      JSON.stringify([
        {
          id: "overdue",
          tasks: [{ id: "t1", title: { en: "Task", zh: "任务" } }],
        },
      ]),
    );
    localStorage.setItem("xai_pref_demo", JSON.stringify({ enabled: true }));

    const before = localStorage.getItem("xai_task_cols");

    setDesktopWebImportRuntimeEnabled(true);
    const report = scanDesktopWebImportEligibility({
      boundaryKey: "user-1",
      trigger: "first-run-scan",
    });

    expect(localStorage.getItem("xai_task_cols")).toBe(before);
    expect(report.wrote).toBe(false);
    expect(report.boundaryKey).toBe("user-1");

    const tasks = report.results.find((entry) => entry.surface === "tasks");
    const settings = report.results.find(
      (entry) => entry.surface === "settings",
    );

    expect(tasks?.status).toBe("unchanged");
    expect(settings?.status).toBe("unchanged");
    expect(report.skippedIndexedDbStores).toEqual([
      { name: "web-encrypted-cache", reason: "browser_owned_store" },
      { name: "xai-web-ai-secrets", reason: "browser_owned_store" },
      { name: "xai-web-auth", reason: "browser_owned_store" },
    ]);
  });

  it("marks unreadable json surfaces as corrupt", () => {
    localStorage.setItem("xai_task_cols", "{bad json");

    setDesktopWebImportRuntimeEnabled(true);
    const report = scanDesktopWebImportEligibility();
    const tasks = report.results.find((entry) => entry.surface === "tasks");

    expect(tasks?.status).toBe("corrupt");
    expect(tasks?.message).toMatch(/unreadable/);
    expect(report.counts.corrupt).toBeGreaterThan(0);
  });

  it("stays inactive when desktop runtime is not enabled", () => {
    localStorage.setItem(
      "xai_task_cols",
      JSON.stringify([{ id: "overdue", tasks: [{ id: "t1" }] }]),
    );

    const report = scanDesktopWebImportEligibility();
    expect(report.results.every((entry) => entry.status === "skipped")).toBe(
      true,
    );
    expect(report.results.every((entry) => entry.skippedReason === "unsupported_surface")).toBe(
      true,
    );
  });
});
