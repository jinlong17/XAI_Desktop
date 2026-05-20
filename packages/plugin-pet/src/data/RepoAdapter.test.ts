import { createInMemoryRepo } from "@repo/core-data/testing";
import { describe, expect, it } from "vitest";
import type { PetEntity } from "../types";
import { RepoAdapter } from "./RepoAdapter";

const NOW = "2026-05-20T00:00:00.000Z";

function makePet(overrides: Partial<PetEntity> = {}): PetEntity {
  return {
    id: "pet-1",
    entityType: "pet.pet",
    schemaVersion: 1,
    syncScope: "device-local",
    name: "Mochi",
    mood: "happy",
    energy: 80,
    lastFed: NOW,
    personality: {
      name: "Coach",
      voiceTone: "gentle",
      reminderStyle: "celebrate",
    },
    hidden: false,
    state: "idle",
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
    ...overrides,
  };
}

describe("plugin-pet RepoAdapter", () => {
  it("save then getAll returns the record", async () => {
    const repo = createInMemoryRepo<PetEntity>({ namespace: "pet-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makePet());

    const all = await adapter.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe("pet-1");
  });

  it("getById returns the saved record", async () => {
    const repo = createInMemoryRepo<PetEntity>({ namespace: "pet-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makePet());

    expect((await adapter.getById("pet-1"))?.id).toBe("pet-1");
  });

  it("delete removes the record from getAll", async () => {
    const repo = createInMemoryRepo<PetEntity>({ namespace: "pet-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makePet());
    await adapter.delete("pet-1");

    expect(await adapter.getAll()).toEqual([]);
  });

  it("delete makes getById return null", async () => {
    const repo = createInMemoryRepo<PetEntity>({ namespace: "pet-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makePet());
    await adapter.delete("pet-1");

    expect(await adapter.getById("pet-1")).toBeNull();
  });

  it("filters soft-deleted records from getAll and getById", async () => {
    const repo = createInMemoryRepo<PetEntity>({ namespace: "pet-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makePet({ deletedAt: "2026-05-20T02:00:00.000Z" }));

    expect(await adapter.getAll()).toEqual([]);
    expect(await adapter.getById("pet-1")).toBeNull();
  });
});
