import {
  applyDesktopBackupBundle,
  countUnresolvedOutboxRows,
  createDesktopBackupBundle,
  createInMemoryRepo,
  verifyDesktopBackupApply,
  verifyDesktopBackupBundleJson,
  type OutboxEntry,
  type Repo,
  type RepoRecord,
} from "@repo/core-data";
import { describe, expect, it } from "vitest";

function baseRecord(input: {
  id: string;
  entityType: string;
  syncScope?: "device-local" | "account-sync";
}): RepoRecord {
  return {
    id: input.id,
    entityType: input.entityType,
    schemaVersion: 1,
    createdAt: "2026-05-29T08:00:00.000Z",
    updatedAt: "2026-05-29T08:00:00.000Z",
    syncScope: input.syncScope ?? "device-local",
  };
}

function todoRecord(id: string, title: string): RepoRecord {
  return {
    ...baseRecord({
      id,
      entityType: "productivity.todo",
      syncScope: "account-sync",
    }),
    title,
    done: false,
    labelIds: [],
  } as RepoRecord;
}

function habitRecord(id: string, title: string): RepoRecord {
  return {
    ...baseRecord({
      id,
      entityType: "productivity.habit",
      syncScope: "account-sync",
    }),
    title,
    cadence: "daily",
    completions: [],
    labelIds: [],
  } as RepoRecord;
}

function outboxRecord(input: {
  id: string;
  mutationId: string;
  queueStatus: OutboxEntry["queueStatus"];
}): RepoRecord {
  return {
    ...baseRecord({
      id: input.id,
      entityType: "sync.outbox",
      syncScope: "account-sync",
    }),
    commitSeq: 1,
    mutationId: input.mutationId,
    targetEntityType: "productivity.todo",
    targetEntityId: "todo:1",
    op: "put",
    payload: "{}",
    retryCount: 0,
    queueStatus: input.queueStatus,
    boundaryKey: "user-a",
    localRevision: 1,
    statusUpdatedAt: "2026-05-29T08:00:00.000Z",
  } as RepoRecord;
}

function importLedgerRecord(id: string): RepoRecord {
  return {
    ...baseRecord({
      id,
      entityType: "desktop.web_import_ledger",
      syncScope: "device-local",
    }),
    surface: "tasks",
    boundaryKey: "user-a",
    sourceFingerprint: "fnv1a64:demo",
    importedRecordIds: [],
    lastStatus: "unchanged",
    lastRunAt: "2026-05-29T08:00:00.000Z",
  } as RepoRecord;
}

async function createRepo(
  records: readonly RepoRecord[],
): Promise<Repo<RepoRecord>> {
  const repo = createInMemoryRepo<RepoRecord>({
    namespace: "desktop-backup-test",
    schemaVersion: 1,
  });
  for (const row of records) {
    await repo.put(row);
  }
  return repo;
}

describe("desktop backup bundle contract", () => {
  it("classifies restorable and excluded records with explicit partial semantics", () => {
    const bundle = createDesktopBackupBundle({
      records: [
        todoRecord("todo:1", "One"),
        habitRecord("habit:1", "Run"),
        outboxRecord({
          id: "__outbox__m1",
          mutationId: "m1",
          queueStatus: "queued",
        }),
        importLedgerRecord("desktop-web-import-ledger:user-a:tasks"),
      ],
      createdAt: "2026-05-29T09:00:00.000Z",
    });

    expect(bundle.manifest.bundleVersion).toBe(1);
    expect(bundle.manifest.restorableRecordCount).toBe(2);
    expect(bundle.manifest.excludedRecordCount).toBe(2);
    expect(bundle.audit.excludedQueueCount).toBe(1);
    expect(bundle.audit.excludedImportLedgerCount).toBe(1);
    expect(bundle.audit.unresolvedOutboxCount).toBe(1);

    const verified = verifyDesktopBackupBundleJson(JSON.stringify(bundle));
    expect(verified.status).toBe("verified_partial");
    expect(verified.excludedRecordCount).toBe(2);
    expect(verified.unresolvedOutboxCount).toBe(1);
    expect(verified.warnings.length).toBeGreaterThan(0);
  });

  it("returns verified_full when no excluded operational state exists", () => {
    const bundle = createDesktopBackupBundle({
      records: [todoRecord("todo:1", "One"), habitRecord("habit:1", "Run")],
    });

    const verified = verifyDesktopBackupBundleJson(JSON.stringify(bundle));
    expect(verified.status).toBe("verified_full");
    expect(verified.warnings).toEqual([]);
    expect(verified.excludedRecordCount).toBe(0);
  });

  it("rejects tampered fingerprints as corrupt", () => {
    const bundle = createDesktopBackupBundle({
      records: [todoRecord("todo:1", "One")],
    });
    bundle.manifest.restorableFingerprint = "fnv1a64:tampered";

    const verified = verifyDesktopBackupBundleJson(JSON.stringify(bundle));
    expect(verified.status).toBe("corrupt");
    expect(verified.reason).toContain("fingerprint mismatch");
  });

  it("rejects incompatible restorable entity types", () => {
    const incompatible = {
      manifest: {
        bundleVersion: 1,
        createdAt: "2026-05-29T10:00:00.000Z",
        sourceApp: "desktop-phase1-offline",
        bridgeNamespace: "xai-web-desktop-local-first-bridge",
        restorableEntityTypes: ["productivity.todo"],
        excludedEntityTypes: ["sync.outbox"],
        warnings: [],
        restorableRecordCount: 1,
        excludedRecordCount: 0,
        restorableFingerprint: "fnv1a64:unknown",
      },
      restorableRecords: [baseRecord({ id: "bad:1", entityType: "organizer.grid" })],
      audit: {
        excludedQueueCount: 0,
        excludedImportLedgerCount: 0,
        excludedImportRunCount: 0,
        unresolvedOutboxCount: 0,
        excludedMutationIds: [],
      },
    };

    const verified = verifyDesktopBackupBundleJson(JSON.stringify(incompatible));
    expect(verified.status).toBe("incompatible");
    expect(verified.reason).toContain("not allowed");
  });

  it("refuses apply when target repo still has unresolved sync.outbox rows", async () => {
    const targetRepo = await createRepo([
      todoRecord("todo:existing", "Old"),
      outboxRecord({
        id: "__outbox__m2",
        mutationId: "m2",
        queueStatus: "queued",
      }),
    ]);

    const bundle = createDesktopBackupBundle({
      records: [todoRecord("todo:1", "One")],
    });

    const apply = await applyDesktopBackupBundle({
      repo: targetRepo,
      bundle,
    });

    expect(apply.status).toBe("failed");
    expect(apply.unresolvedTargetOutboxCount).toBe(1);
  });

  it("applies supported records transactionally and verifies post-restore fingerprint", async () => {
    const targetRepo = await createRepo([
      todoRecord("todo:existing", "Old"),
      outboxRecord({
        id: "__outbox__m3",
        mutationId: "m3",
        queueStatus: "synced",
      }),
    ]);

    const bundle = createDesktopBackupBundle({
      records: [
        todoRecord("todo:new", "New"),
        habitRecord("habit:new", "Meditate"),
        outboxRecord({
          id: "__outbox__m4",
          mutationId: "m4",
          queueStatus: "queued",
        }),
      ],
    });

    const apply = await applyDesktopBackupBundle({
      repo: targetRepo,
      bundle,
    });

    expect(apply.status).toBe("restored_partial");
    expect(apply.restoredRecordCount).toBe(2);

    const verify = await verifyDesktopBackupApply({
      repo: targetRepo,
      bundle,
    });

    expect(verify.match).toBe(true);

    const todos = await targetRepo.list({ entityType: "productivity.todo" });
    expect(todos.map((row) => row.id)).toEqual(["todo:new"]);

    const outboxRows = await targetRepo.list({ entityType: "sync.outbox" });
    expect(outboxRows).toHaveLength(1);
    const unresolved = await countUnresolvedOutboxRows(targetRepo);
    expect(unresolved).toBe(0);
  });
});
