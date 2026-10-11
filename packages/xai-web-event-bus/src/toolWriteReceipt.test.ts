// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { onWebEvent } from "./emitter";
import { executeToolWrite } from "./toolWriteReceipt";

const owner = { kind: "account" as const, accountId: "A", generation: "g1", epoch: 2 };
const payload = {
  requestId: "request-1",
  attemptId: "attempt-2",
  owner,
  title: "Task",
  bucket: "nodate" as const,
  requestedAt: "2026-09-09T00:00:00.000Z",
};

describe("executeToolWrite durable bridge", () => {
  it("publishes the correlated receipt only after durable execution resolves", async () => {
    let resolve!: (value: { ok: true; targetId: string }) => void;
    const durable = new Promise<{ ok: true; targetId: string }>(done => { resolve = done; });
    const receipts: unknown[] = [];
    const off = onWebEvent("web:ai:tool-write-receipt", receipt => receipts.push(receipt));
    const pending = executeToolWrite("web:tasks:create-requested", payload, owner, () => durable);
    expect(receipts).toEqual([]);
    resolve({ ok: true, targetId: "task-1" });
    await expect(pending).resolves.toEqual({ ok: true, targetId: "task-1" });
    expect(receipts).toEqual([expect.objectContaining({
      requestId: "request-1",
      requestChannel: "web:tasks:create-requested",
      attemptId: "attempt-2",
      owner,
      ok: true,
      targetId: "task-1",
    })]);
    off();
  });

  it("turns rejected execution into one honest storage failure", async () => {
    const receipts: unknown[] = [];
    const off = onWebEvent("web:ai:tool-write-receipt", receipt => receipts.push(receipt));
    await expect(executeToolWrite("web:tasks:create-requested", payload, owner, async () => {
      throw new Error("commit rejected");
    })).resolves.toEqual({ ok: false, reason: "storage" });
    expect(receipts).toEqual([expect.objectContaining({ ok: false, reason: "storage" })]);
    off();
  });

  it("rejects stale transport ownership before durable execution", async () => {
    const perform = vi.fn(async () => ({ ok: true as const, targetId: "wrong" }));
    const current = { ...owner, epoch: owner.epoch + 1 };
    await expect(executeToolWrite("web:tasks:create-requested", payload, current, perform))
      .resolves.toEqual({ ok: false, reason: "account-changed" });
    expect(perform).not.toHaveBeenCalled();
  });

  it("does not answer from page memory and delegates every attempt to durable state", async () => {
    const perform = vi.fn(async () => ({ ok: true as const, targetId: "task-1", replay: true }));
    await executeToolWrite("web:tasks:create-requested", payload, owner, perform);
    await executeToolWrite("web:tasks:create-requested", { ...payload, attemptId: "attempt-3" }, owner, perform);
    expect(perform).toHaveBeenCalledTimes(2);
  });
});
