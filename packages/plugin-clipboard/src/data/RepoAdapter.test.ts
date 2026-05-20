import { createInMemoryRepo } from "@repo/core-data/testing";
import { describe, expect, it } from "vitest";
import type { ClipboardEntry } from "../types";
import { RepoAdapter } from "./RepoAdapter";

const NOW = "2026-05-20T00:00:00.000Z";

function makeEntry(overrides: Partial<ClipboardEntry> = {}): ClipboardEntry {
  return {
    id: "clip-1",
    entityType: "clipboard.entry",
    schemaVersion: 1,
    syncScope: "device-local",
    content: "pnpm test",
    type: "code",
    pinned: false,
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
    ...overrides,
  };
}

describe("plugin-clipboard RepoAdapter", () => {
  it("save then getAll returns the record", async () => {
    const repo = createInMemoryRepo<ClipboardEntry>({ namespace: "clipboard-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeEntry());

    const all = await adapter.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe("clip-1");
  });

  it("getById returns the saved record", async () => {
    const repo = createInMemoryRepo<ClipboardEntry>({ namespace: "clipboard-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeEntry());

    expect((await adapter.getById("clip-1"))?.id).toBe("clip-1");
  });

  it("delete removes the record from getAll", async () => {
    const repo = createInMemoryRepo<ClipboardEntry>({ namespace: "clipboard-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeEntry());
    await adapter.delete("clip-1");

    expect(await adapter.getAll()).toEqual([]);
  });

  it("delete makes getById return null", async () => {
    const repo = createInMemoryRepo<ClipboardEntry>({ namespace: "clipboard-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeEntry());
    await adapter.delete("clip-1");

    expect(await adapter.getById("clip-1")).toBeNull();
  });

  it("seed runs once when repo is empty and never again", async () => {
    const repo = createInMemoryRepo<ClipboardEntry>({ namespace: "clipboard-test", schemaVersion: 1 });
    const seed = [makeEntry({ id: "seed-1" }), makeEntry({ id: "seed-2", content: "npm run dev" })];
    const adapter = new RepoAdapter(repo, seed);

    const first = await adapter.getAll();
    expect(first).toHaveLength(2);

    await adapter.delete("seed-1");

    const second = await adapter.getAll();
    expect(second).toHaveLength(1);
    expect(second.map((entry) => entry.id)).toEqual(["seed-2"]);
  });
});
