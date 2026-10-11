/**
 * aiCreateSubscriber.test.tsx — TS-1..TS-4
 *
 * Tests for useTaskCreateRequestSubscriber:
 * TS-1: store mutation — web:tasks:create-requested → addCard + setPref
 * TS-2: idempotency — duplicate requestId → only one task created
 * TS-3: route-independent (hook is standalone; not dependent on TasksModule)
 * TS-4: no cross-plugin import from ai-chat (structural — import graph check)
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 TS tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { emitWebEvent, onWebEvent } from "@repo/xai-web-event-bus";
import { accountScope, getPref } from "@repo/plugin-web-storage";
import { useTaskCreateRequestSubscriber } from "../internal/aiCreateSubscriber.js";
import { disableCanonicalSubscriberTests, enableCanonicalSubscriberTests, settleCanonicalCommands } from "./canonicalSubscriberHarness.js";

beforeEach(() => {
  localStorage.clear();
  // Seed a basic task store with the standard 4 buckets.
  // Cast through unknown: registry type (TaskColsState) is a legacy placeholder;
  // real runtime value is TaskCol[].
  const initialCols = [
    { id: "overdue",  key: "overdue",     count: 0, tasks: [] },
    { id: "next7",    key: "next_7_days", count: 0, tasks: [] },
    { id: "later",    key: "later",       count: 0, tasks: [] },
    { id: "nodate",   key: "no_date",     count: 0, tasks: [] },
  ];
  localStorage.setItem(accountScope.physicalKey("xai_task_cols"), JSON.stringify(initialCols));
  enableCanonicalSubscriberTests();
});

afterEach(disableCanonicalSubscriberTests);

describe("TS-1: store mutation — event handler calls addCard + setPref", () => {
  it("creates a task in the next7 bucket", async () => {
    renderHook(() => useTaskCreateRequestSubscriber());

    act(() => {
      emitWebEvent("web:tasks:create-requested", {
        requestId: "req-001",
        title: "Buy milk",
        bucket: "next7",
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const rawCols = getPref("xai_task_cols") as unknown as Array<{ id: string; tasks: Array<{ title: { en: string } }> }>;
    const next7Col = rawCols.find((c) => c.id === "next7");
    expect(next7Col).toBeDefined();
    expect(next7Col!.tasks).toHaveLength(1);
    expect(next7Col!.tasks[0]!.title.en).toBe("Buy milk");
  });

  it("creates a task with tag in the overdue bucket", async () => {
    renderHook(() => useTaskCreateRequestSubscriber());

    act(() => {
      emitWebEvent("web:tasks:create-requested", {
        requestId: "req-002",
        title: "Review PR",
        bucket: "overdue",
        tag: "work",
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const rawCols = getPref("xai_task_cols") as unknown as Array<{ id: string; tasks: Array<{ title: { en: string }; tag?: string }> }>;
    const overdueCol = rawCols.find((c) => c.id === "overdue");
    expect(overdueCol!.tasks).toHaveLength(1);
    expect(overdueCol!.tasks[0]!.title.en).toBe("Review PR");
    expect(overdueCol!.tasks[0]!.tag).toBe("work");
  });
});

describe("TS-2: idempotency — duplicate requestId does not create a second task", () => {
  it("ignores a second event with the same requestId", async () => {
    renderHook(() => useTaskCreateRequestSubscriber());

    act(() => {
      emitWebEvent("web:tasks:create-requested", {
        requestId: "req-dup",
        title: "Unique task",
        bucket: "next7",
        requestedAt: new Date().toISOString(),
      });
      emitWebEvent("web:tasks:create-requested", {
        requestId: "req-dup",
        title: "Unique task",
        bucket: "next7",
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const rawCols = getPref("xai_task_cols") as unknown as Array<{ id: string; tasks: unknown[] }>;
    const next7Col = rawCols.find((c) => c.id === "next7");
    expect(next7Col!.tasks).toHaveLength(1); // deduplicated
  });
});

describe("TS-3: route-independent — subscriber works without TasksModule mounted", () => {
  it("writes to store even when no TasksModule is rendered", async () => {
    // Only the subscriber hook is rendered (no TasksModule or routing context).
    renderHook(() => useTaskCreateRequestSubscriber());

    act(() => {
      emitWebEvent("web:tasks:create-requested", {
        requestId: "req-standalone",
        title: "Standalone task",
        bucket: "later",
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const rawCols = getPref("xai_task_cols") as unknown as Array<{ id: string; tasks: unknown[] }>;
    const laterCol = rawCols.find((c) => c.id === "later");
    expect(laterCol!.tasks).toHaveLength(1);
  });
});

describe("TS-5: unseeded store — subscriber seeds bucket columns so the task is not dropped", () => {
  // Regression for the 2026-05-29 live Gemini in-app smoke: on a profile that
  // never opened the Tasks page, xai_task_cols is the registry default `{}`
  // (or `[]` if poisoned by a prior empty write). addCard into a missing bucket
  // would no-op and silently DROP the AI-created task. The subscriber must seed
  // from SEED_TASK_COLS when the store is not a non-empty TaskCol[].
  it("initializes only a physically absent task domain", async () => {
    localStorage.removeItem(accountScope.physicalKey("xai_task_cols"));
    renderHook(() => useTaskCreateRequestSubscriber());
    act(() => {
      emitWebEvent("web:tasks:create-requested", {
        requestId: "req-physically-absent",
        title: "First command task",
        bucket: "next7",
        requestedAt: new Date().toISOString(),
      });
    });
    await settleCanonicalCommands();
    const rawCols = getPref("xai_task_cols") as unknown as Array<{ id: string; tasks: Array<{ title: { en: string } }> }>;
    expect(rawCols.find(col => col.id === "next7")?.tasks.some(task => task.title.en === "First command task")).toBe(true);
  });

  it("refuses a present invalid empty object instead of replacing it with a seed", async () => {
    localStorage.setItem(accountScope.physicalKey("xai_task_cols"), "{}");
    renderHook(() => useTaskCreateRequestSubscriber());

    act(() => {
      emitWebEvent("web:tasks:create-requested", {
        requestId: "req-empty-obj",
        title: "买牛奶",
        bucket: "next7",
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    expect(getPref("xai_task_cols")).toEqual({});
  });

  it("refuses a present invalid empty array instead of replacing it with a seed", async () => {
    localStorage.setItem(accountScope.physicalKey("xai_task_cols"), "[]");
    renderHook(() => useTaskCreateRequestSubscriber());

    act(() => {
      emitWebEvent("web:tasks:create-requested", {
        requestId: "req-empty-arr",
        title: "买牛奶",
        bucket: "next7",
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    expect(getPref("xai_task_cols")).toEqual([]);
  });
});

describe("TS-6: malformed create semantics", () => {
  it("rejects an explicitly invalid bucket without changing storage", async () => {
    renderHook(() => useTaskCreateRequestSubscriber());
    const key = accountScope.physicalKey("xai_task_cols");
    const before = localStorage.getItem(key);
    const receipts: Array<{ ok: boolean; reason?: string }> = [];
    const off = onWebEvent("web:ai:tool-write-receipt", receipt => receipts.push(receipt));
    act(() => {
      emitWebEvent("web:tasks:create-requested", {
        requestId: "req-invalid-bucket",
        title: "Must not move",
        bucket: "unknown" as "next7",
        requestedAt: new Date().toISOString(),
      });
    });
    await settleCanonicalCommands();
    expect(receipts).toEqual([expect.objectContaining({ ok: false, reason: "invalid" })]);
    expect(localStorage.getItem(key)).toBe(before);
    off();
  });
});

describe("TS-4: no cross-plugin import — module does not use runtime import from plugin-web-ai-chat", () => {
  it("aiCreateSubscriber does not have an import statement from @repo/plugin-web-ai-chat", async () => {
    // Static assertion: the source file has no `from "@repo/plugin-web-ai-chat"` import statement.
    // Comments mentioning the package name are acceptable (RED LINE documentation).
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/internal/aiCreateSubscriber.ts",
      ),
      "utf-8",
    );
    // Check for actual import statement, not just string presence.
    expect(src).not.toMatch(/from\s+["']@repo\/plugin-web-ai-chat["']/);
  });
});
