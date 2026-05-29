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

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { getPref, setPref } from "@repo/plugin-web-storage";
import { useTaskCreateRequestSubscriber } from "../internal/aiCreateSubscriber.js";

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
  setPref("xai_task_cols", initialCols as unknown as import("@repo/plugin-web-storage").TaskColsState);
});

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

    const rawCols = getPref("xai_task_cols") as unknown as Array<{ id: string; tasks: Array<{ title: { en: string } }> }>;
    const next7Col = rawCols.find((c) => c.id === "next7");
    expect(next7Col).toBeDefined();
    expect(next7Col!.tasks).toHaveLength(1);
    expect(next7Col!.tasks[0]!.title.en).toBe("Buy milk");
  });

  it("creates a task with tag in the overdue bucket", () => {
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

    const rawCols = getPref("xai_task_cols") as unknown as Array<{ id: string; tasks: Array<{ title: { en: string }; tag?: string }> }>;
    const overdueCol = rawCols.find((c) => c.id === "overdue");
    expect(overdueCol!.tasks).toHaveLength(1);
    expect(overdueCol!.tasks[0]!.title.en).toBe("Review PR");
    expect(overdueCol!.tasks[0]!.tag).toBe("work");
  });
});

describe("TS-2: idempotency — duplicate requestId does not create a second task", () => {
  it("ignores a second event with the same requestId", () => {
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

    const rawCols = getPref("xai_task_cols") as unknown as Array<{ id: string; tasks: unknown[] }>;
    const next7Col = rawCols.find((c) => c.id === "next7");
    expect(next7Col!.tasks).toHaveLength(1); // deduplicated
  });
});

describe("TS-3: route-independent — subscriber works without TasksModule mounted", () => {
  it("writes to store even when no TasksModule is rendered", () => {
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

    const rawCols = getPref("xai_task_cols") as unknown as Array<{ id: string; tasks: unknown[] }>;
    const laterCol = rawCols.find((c) => c.id === "later");
    expect(laterCol!.tasks).toHaveLength(1);
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
