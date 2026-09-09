/**
 * aiMutateSubscriber.test.tsx — TS-DEL-1..TS-DEL-3, TS-UPD-1..TS-UPD-4
 *
 * Tests for useTaskMutateRequestSubscriber:
 * TS-DEL-1: delete event handler calls deleteCard + setPref
 * TS-DEL-2: delete idempotency — duplicate requestId → only one delete
 * TS-DEL-3: delete unknown id → no-op (store unchanged)
 * TS-UPD-1: update event handler calls updateCard + setPref; preserve done
 * TS-UPD-2: bucket change → moveCard composition (ED-6)
 * TS-UPD-3: update idempotency — duplicate requestId → only one update
 * TS-UPD-4: no cross-plugin import from ai-chat (structural check)
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §9 TS-DEL/TS-UPD tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { accountScope, getPref } from "@repo/plugin-web-storage";
import { useTaskMutateRequestSubscriber } from "../internal/aiMutateSubscriber.js";
import type { TaskCol } from "../types.js";
import { disableCanonicalSubscriberTests, enableCanonicalSubscriberTests, settleCanonicalCommands } from "./canonicalSubscriberHarness.js";

type ColsRaw = Array<{ id: string; count: number; tasks: Array<{ id: string; title: { en: string; zh: string }; tag?: string; done?: boolean }> }>;

function seedCols(): TaskCol[] {
  return [
    {
      id: "overdue",
      key: "overdue",
      count: 2,
      tasks: [
        { id: "t-del-a", title: { en: "Task A", zh: "Task A" }, tag: "work", done: true },
        { id: "t-upd-a", title: { en: "Task B", zh: "Task B" }, tag: "study" },
      ],
      action: "postpone",
    },
    { id: "next7", key: "next_7_days", count: 0, tasks: [], action: "add" },
    { id: "later", key: "later", count: 0, tasks: [] },
    { id: "nodate", key: "no_date", count: 0, tasks: [] },
  ];
}

function writeSeed(): void {
  localStorage.setItem(accountScope.physicalKey("xai_task_cols"), JSON.stringify(seedCols()));
}

beforeEach(() => {
  localStorage.clear();
  enableCanonicalSubscriberTests();
});

afterEach(disableCanonicalSubscriberTests);

describe("TS-DEL-1: delete event → deleteCard + setPref (card removed, count decremented)", () => {
  it("removes the targeted task and decrements column count", async () => {
    writeSeed();
    renderHook(() => useTaskMutateRequestSubscriber());

    act(() => {
      emitWebEvent("web:tasks:delete-requested", {
        requestId: "req-del-001",
        id: "t-del-a",
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const cols = getPref("xai_task_cols") as unknown as ColsRaw;
    const overdue = cols.find((c) => c.id === "overdue")!;
    expect(overdue.tasks.find((t) => t.id === "t-del-a")).toBeUndefined();
    expect(overdue.count).toBe(1); // was 2, now 1
  });
});

describe("TS-DEL-2: delete idempotency — duplicate requestId → only one delete", () => {
  it("ignores second event with same requestId", async () => {
    writeSeed();
    renderHook(() => useTaskMutateRequestSubscriber());

    act(() => {
      emitWebEvent("web:tasks:delete-requested", {
        requestId: "req-del-dup",
        id: "t-del-a",
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const firstCount = (getPref("xai_task_cols") as unknown as ColsRaw)
      .find((c) => c.id === "overdue")!.tasks.length;

    act(() => {
      emitWebEvent("web:tasks:delete-requested", {
        requestId: "req-del-dup", // same requestId
        id: "t-del-a",
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const secondCount = (getPref("xai_task_cols") as unknown as ColsRaw)
      .find((c) => c.id === "overdue")!.tasks.length;

    expect(secondCount).toBe(firstCount); // no change — idempotent
  });
});

describe("TS-DEL-3: delete unknown id → store unchanged (no-op)", () => {
  it("returns store unchanged when id not found", async () => {
    writeSeed();
    renderHook(() => useTaskMutateRequestSubscriber());

    const before = JSON.stringify(getPref("xai_task_cols"));

    act(() => {
      emitWebEvent("web:tasks:delete-requested", {
        requestId: "req-del-noop",
        id: "DOES_NOT_EXIST",
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const after = JSON.stringify(getPref("xai_task_cols"));
    expect(after).toBe(before); // no change
  });
});

describe("TS-UPD-1: update event → updateCard + setPref; done preserved (T-10 lifeline)", () => {
  it("updates title; preserve done:true on t-del-a (done lifeline)", async () => {
    writeSeed();
    renderHook(() => useTaskMutateRequestSubscriber());

    act(() => {
      emitWebEvent("web:tasks:update-requested", {
        requestId: "req-upd-001",
        id: "t-del-a", // has done:true
        patch: { title: "Updated Task A" },
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const cols = getPref("xai_task_cols") as unknown as ColsRaw;
    const overdue = cols.find((c) => c.id === "overdue")!;
    const card = overdue.tasks.find((t) => t.id === "t-del-a")!;
    expect(card.title.en).toBe("Updated Task A");
    expect(card.done).toBe(true); // preserved!
  });

  it("updates tag without touching title or done", async () => {
    writeSeed();
    renderHook(() => useTaskMutateRequestSubscriber());

    act(() => {
      emitWebEvent("web:tasks:update-requested", {
        requestId: "req-upd-002",
        id: "t-upd-a",
        patch: { tag: "personal" },
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const cols = getPref("xai_task_cols") as unknown as ColsRaw;
    const card = cols.find((c) => c.id === "overdue")!.tasks.find((t) => t.id === "t-upd-a")!;
    expect(card.tag).toBe("personal");
    expect(card.title.en).toBe("Task B"); // unchanged
  });
});

describe("TS-UPD-2: bucket change → moveCard composition (ED-6)", () => {
  it("moves task to next7 when bucket changes from overdue", async () => {
    writeSeed();
    renderHook(() => useTaskMutateRequestSubscriber());

    act(() => {
      emitWebEvent("web:tasks:update-requested", {
        requestId: "req-upd-move",
        id: "t-upd-a",
        patch: { bucket: "next7", title: "Moved and renamed" },
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();
    const cols = getPref("xai_task_cols") as unknown as ColsRaw;
    const overdue = cols.find((c) => c.id === "overdue")!;
    const next7 = cols.find((c) => c.id === "next7")!;
    expect(overdue.tasks.find((t) => t.id === "t-upd-a")).toBeUndefined(); // moved out
    const movedCard = next7.tasks.find((t) => t.id === "t-upd-a");
    expect(movedCard).toBeDefined();
    expect(movedCard!.title.en).toBe("Moved and renamed");
  });
});

describe("TS-UPD-3: update idempotency — duplicate requestId → only one update", () => {
  it("applies title update once; second event with same requestId is no-op", async () => {
    writeSeed();
    renderHook(() => useTaskMutateRequestSubscriber());

    act(() => {
      emitWebEvent("web:tasks:update-requested", {
        requestId: "req-upd-dup",
        id: "t-upd-a",
        patch: { title: "First update" },
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();

    act(() => {
      emitWebEvent("web:tasks:update-requested", {
        requestId: "req-upd-dup", // same requestId
        id: "t-upd-a",
        patch: { title: "Second update — should be ignored" },
        requestedAt: new Date().toISOString(),
      });
    });

    await settleCanonicalCommands();

    const cols = getPref("xai_task_cols") as unknown as ColsRaw;
    const card = cols.find((c) => c.id === "overdue")!.tasks.find((t) => t.id === "t-upd-a");
    // First update applied, second is no-op
    expect(card?.title.en).toBe("First update");
  });
});

describe("TS-UPD-4: no cross-plugin import — aiMutateSubscriber does not import from plugin-web-ai-chat", () => {
  it("source file has no runtime import from @repo/plugin-web-ai-chat", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.join(process.cwd(), "src/internal/aiMutateSubscriber.ts"),
      "utf-8",
    );
    expect(src).not.toMatch(/from\s+["']@repo\/plugin-web-ai-chat["']/);
  });
});
