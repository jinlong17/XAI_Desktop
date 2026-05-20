import { describe, expect, it } from "vitest";

import type { Repo, RepoRecord } from "../src/types";

export interface ContractRecord extends RepoRecord {
  title: string;
  priority: number;
  tag: string;
}

export function runRepositoryContractTests(
  name: string,
  createRepo: () => Repo<ContractRecord>,
): void {
  describe(name, () => {
    it("performs CRUD roundtrip and preserves metadata fields", async () => {
      const repo = createRepo();
      const record = makeRecord("todo-1", { title: "first" });

      await expect(repo.get("missing")).resolves.toBeUndefined();
      await repo.put(record);

      await expect(repo.get("todo-1")).resolves.toEqual(record);
      await repo.delete("todo-1");
      await expect(repo.get("todo-1")).resolves.toBeUndefined();
    });

    it("filters list queries and applies explicit stable ordering", async () => {
      const repo = createRepo();

      await repo.put(makeRecord("todo-2", { priority: 2, tag: "work" }));
      await repo.put(makeRecord("todo-1", { priority: 1, tag: "work" }));
      await repo.put(
        makeRecord("clip-1", {
          entityType: "clipboard.item",
          priority: 3,
          syncScope: "device-local",
          tag: "local",
        }),
      );

      await expect(
        repo.list({
          entityType: "productivity.todo",
          syncScope: "account-sync",
          orderBy: { field: "priority", direction: "asc" },
        }),
      ).resolves.toEqual([
        makeRecord("todo-1", { priority: 1, tag: "work" }),
        makeRecord("todo-2", { priority: 2, tag: "work" }),
      ]);
    });

    it("lists records by index and honors query options", async () => {
      const repo = createRepo();

      await repo.put(makeRecord("todo-2", { priority: 2, tag: "work" }));
      await repo.put(makeRecord("todo-1", { priority: 1, tag: "work" }));
      await repo.put(makeRecord("todo-3", { priority: 3, tag: "home" }));

      await expect(
        repo.listByIndex("tag", "work", {
          orderBy: { field: "id", direction: "asc" },
          limit: 1,
        }),
      ).resolves.toEqual([makeRecord("todo-1", { priority: 1, tag: "work" })]);
    });

    it("rolls back transaction writes when the callback throws", async () => {
      const repo = createRepo();

      await expect(
        repo.transaction(async (tx) => {
          await tx.put(makeRecord("todo-1"));
          throw new Error("boom");
        }),
      ).rejects.toThrow("boom");

      await expect(repo.get("todo-1")).resolves.toBeUndefined();
    });

    it("applies migrations once and exposes metadata", async () => {
      const repo = createRepo();

      await expect(
        repo.migrate({
          id: "migrate-v1",
          fromVersion: 0,
          toVersion: 1,
          steps: [
            async (tx) => {
              await tx.put(makeRecord("todo-1"));
            },
          ],
        }),
      ).resolves.toMatchObject({
        id: "migrate-v1",
        fromVersion: 0,
        toVersion: 1,
        applied: true,
      });

      await expect(
        repo.migrate({
          id: "migrate-v1",
          fromVersion: 0,
          toVersion: 1,
          steps: [
            async (tx) => {
              await tx.put(makeRecord("todo-2"));
            },
          ],
        }),
      ).resolves.toMatchObject({
        id: "migrate-v1",
        applied: false,
      });

      await expect(repo.get("todo-2")).resolves.toBeUndefined();
      await expect(repo.metadata()).resolves.toMatchObject({
        schemaVersion: 1,
        migrationVersion: 1,
        recordCount: 1,
      });
    });

    // ── Negative-path contract (P1 D2) ─────────────────────────────────────
    //
    // Every Repo<T> driver MUST reject malformed records and bad migration
    // plans with the documented `E3005` / `E3006` codes, and `listByIndex`
    // on an unknown field MUST return an empty array rather than throwing
    // or returning `undefined`.

    it("rejects invalid records with E3005 (missing entityType / bad schemaVersion)", async () => {
      const repo = createRepo();

      // Missing entityType.
      const missingEntity = {
        ...makeRecord("bad-1"),
        entityType: "",
      } as ContractRecord;
      await expect(repo.put(missingEntity)).rejects.toThrow(/E3005/);

      // schemaVersion = 0 (below the minimum positive integer).
      const badSchema = {
        ...makeRecord("bad-2"),
        schemaVersion: 0,
      } as ContractRecord;
      await expect(repo.put(badSchema)).rejects.toThrow(/E3005/);
    });

    it("rejects a migration plan whose fromVersion does not match the current migrationVersion (E3006)", async () => {
      const repo = createRepo();

      // Repo is freshly created at migrationVersion=0, so a plan claiming
      // fromVersion=5 → toVersion=6 must surface `E3006: ... expected version`.
      await expect(
        repo.migrate({
          id: "bad-migration",
          fromVersion: 5,
          toVersion: 6,
          steps: [],
        }),
      ).rejects.toThrow(/E3006:.*expected version/);
    });

    it("returns an empty array for listByIndex with a non-existent field", async () => {
      const repo = createRepo();

      // Even with no records the call must resolve to an array, never throw.
      await expect(
        repo.listByIndex("nonExistentField" as never, "x" as never),
      ).resolves.toEqual([]);

      // Same with records present — unknown indexed field still returns [].
      await repo.put(makeRecord("todo-1"));
      await repo.put(makeRecord("todo-2"));
      const result = await repo.listByIndex(
        "nonExistentField" as never,
        "x" as never,
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });
  });
}

export function makeRecord(
  id: string,
  overrides: Partial<ContractRecord> = {},
): ContractRecord {
  return {
    id,
    entityType: "productivity.todo",
    schemaVersion: 1,
    createdAt: "2026-05-19T00:00:00.000Z",
    updatedAt: "2026-05-19T00:00:00.000Z",
    syncScope: "account-sync",
    title: id,
    priority: 1,
    tag: "work",
    ...overrides,
  };
}
