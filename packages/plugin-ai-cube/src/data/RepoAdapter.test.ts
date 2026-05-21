import { createInMemoryRepo } from "@repo/core-data/testing";
import { describe, expect, it } from "vitest";
import type { AiMessage } from "../types";
import { RepoAdapter } from "./RepoAdapter";

const NOW = "2026-05-20T00:00:00.000Z";

function makeMessage(overrides: Partial<AiMessage> = {}): AiMessage {
  return {
    id: "msg-1",
    entityType: "ai-cube.message",
    schemaVersion: 1,
    syncScope: "account-sync",
    role: "user",
    content: "Summarize this workspace",
    redacted: false,
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
    ...overrides,
  };
}

describe("plugin-ai-cube RepoAdapter", () => {
  it("save then getAll returns the record", async () => {
    const repo = createInMemoryRepo<AiMessage>({ namespace: "ai-cube-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo, "ai-cube.message");

    await adapter.save(makeMessage());

    const all = await adapter.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe("msg-1");
  });

  it("getById returns the saved record", async () => {
    const repo = createInMemoryRepo<AiMessage>({ namespace: "ai-cube-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo, "ai-cube.message");

    await adapter.save(makeMessage());

    expect((await adapter.getById("msg-1"))?.id).toBe("msg-1");
  });

  it("delete removes the record from getAll", async () => {
    const repo = createInMemoryRepo<AiMessage>({ namespace: "ai-cube-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo, "ai-cube.message");

    await adapter.save(makeMessage());
    await adapter.delete("msg-1");

    expect(await adapter.getAll()).toEqual([]);
  });

  it("delete makes getById return null", async () => {
    const repo = createInMemoryRepo<AiMessage>({ namespace: "ai-cube-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo, "ai-cube.message");

    await adapter.save(makeMessage());
    await adapter.delete("msg-1");

    expect(await adapter.getById("msg-1")).toBeNull();
  });

  it("filters soft-deleted records from getAll and getById", async () => {
    const repo = createInMemoryRepo<AiMessage>({ namespace: "ai-cube-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo, "ai-cube.message");

    await adapter.save(makeMessage({ deletedAt: "2026-05-20T02:00:00.000Z" }));

    expect(await adapter.getAll()).toEqual([]);
    expect(await adapter.getById("msg-1")).toBeNull();
  });
});
