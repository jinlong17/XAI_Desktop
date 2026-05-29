import {
  createInMemoryRepo,
  type OutboxEntry,
  type Repo,
  type RepoRecord,
} from "@repo/core-data";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let currentRepo: Repo<RepoRecord>;

vi.mock("@repo/core-data", async () => {
  const actual = await vi.importActual<typeof import("@repo/core-data")>(
    "@repo/core-data",
  );
  return {
    ...actual,
    createTauriRepo: vi.fn(() => currentRepo),
  };
});

import {
  __resetDesktopBackupStateForTests,
  createDesktopBackupArtifact,
  importDesktopBackupArtifact,
  setDesktopBackupRuntimeEnabled,
} from "../internal/desktopBackup.js";

const files = new Map<string, string>();
let managedSeq = 0;

function setTauriInvokeStub(): void {
  const win = window as Window & {
    __TAURI_INTERNALS__?: {
      invoke?: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
    };
  };
  win.__TAURI_INTERNALS__ = {
    invoke: async <T>(cmd: string, args?: Record<string, unknown>) => {
      if (cmd === "db_backup_write_bundle") {
        const input = (args?.input ?? {}) as {
          destinationPath?: string;
          json?: string;
        };
        const json = input.json ?? "";
        const path =
          typeof input.destinationPath === "string" && input.destinationPath.length > 0
            ? input.destinationPath
            : `/managed/xai-backup-${++managedSeq}.json`;
        files.set(path, json);
        return {
          path,
          bytes: json.length,
          managedPath: !input.destinationPath,
        } as T;
      }

      if (cmd === "db_backup_read_bundle") {
        const input = (args?.input ?? {}) as { path?: string };
        const path = input.path ?? "";
        const json = files.get(path);
        if (json === undefined) {
          throw new Error(`missing backup file: ${path}`);
        }
        return {
          path,
          json,
          bytes: json.length,
        } as T;
      }

      if (cmd === "db_backup_verify_bundle") {
        const input = (args?.input ?? {}) as { path?: string };
        const path = input.path ?? "";
        const json = files.get(path);
        if (json === undefined) {
          throw new Error(`missing backup file: ${path}`);
        }
        let validJson = true;
        try {
          JSON.parse(json);
        } catch {
          validJson = false;
        }
        return {
          path,
          bytes: json.length,
          validJson,
          managedPath: path.startsWith("/managed/"),
        } as T;
      }

      throw new Error(`unexpected invoke command: ${cmd}`);
    },
  };
}

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

async function repoWith(records: readonly RepoRecord[]): Promise<Repo<RepoRecord>> {
  const repo = createInMemoryRepo<RepoRecord>({
    namespace: "desktop-backup-runtime-test",
    schemaVersion: 1,
  });
  for (const row of records) {
    await repo.put(row);
  }
  return repo;
}

beforeEach(async () => {
  files.clear();
  managedSeq = 0;
  currentRepo = await repoWith([]);
  setTauriInvokeStub();
  __resetDesktopBackupStateForTests();
  setDesktopBackupRuntimeEnabled(true);
});

afterEach(() => {
  __resetDesktopBackupStateForTests();
  vi.clearAllMocks();
});

describe("desktop backup runtime", () => {
  it("exports bundle and surfaces partial metadata when source has excluded queue/import state", async () => {
    currentRepo = await repoWith([
      todoRecord("todo:1", "One"),
      outboxRecord({
        id: "__outbox__m1",
        mutationId: "m1",
        queueStatus: "queued",
      }),
      importLedgerRecord("desktop-web-import-ledger:user-a:tasks"),
    ]);

    const report = await createDesktopBackupArtifact();

    expect(report.status).toBe("verified_partial");
    expect(report.path).toBe("/managed/xai-backup-1.json");
    expect(report.managedPath).toBe(true);
    expect(report.excludedRecordCount).toBe(2);
    expect(report.unresolvedSourceOutboxCount).toBe(1);
  });

  it("refuses restore-apply when target repo has unresolved outbox rows", async () => {
    const sourceRepo = await repoWith([todoRecord("todo:1", "One")]);
    currentRepo = sourceRepo;
    const exportReport = await createDesktopBackupArtifact();

    currentRepo = await repoWith([
      outboxRecord({
        id: "__outbox__m2",
        mutationId: "m2",
        queueStatus: "queued",
      }),
    ]);

    const importReport = await importDesktopBackupArtifact({
      path: exportReport.path ?? "",
      apply: true,
    });

    expect(importReport.status).toBe("failed");
    expect(importReport.error?.code).toBe("target_outbox_not_empty");
    expect(importReport.unresolvedTargetOutboxCount).toBe(1);
  });

  it("restores supported records and leaves excluded operational state untouched", async () => {
    currentRepo = await repoWith([
      todoRecord("todo:new", "From backup"),
      habitRecord("habit:new", "Meditate"),
      outboxRecord({
        id: "__outbox__m3",
        mutationId: "m3",
        queueStatus: "queued",
      }),
    ]);

    const exportReport = await createDesktopBackupArtifact({
      destinationPath: "/tmp/backup-runtime-test.json",
    });

    currentRepo = await repoWith([
      todoRecord("todo:old", "Old"),
      outboxRecord({
        id: "__outbox__m4",
        mutationId: "m4",
        queueStatus: "synced",
      }),
    ]);

    const importReport = await importDesktopBackupArtifact({
      path: exportReport.path ?? "",
      apply: true,
    });

    expect(importReport.status).toBe("restored_partial");

    const todos = await currentRepo.list({ entityType: "productivity.todo" });
    expect(todos.map((row) => row.id)).toEqual(["todo:new"]);

    const habits = await currentRepo.list({ entityType: "productivity.habit" });
    expect(habits).toHaveLength(1);

    const outboxRows = await currentRepo.list({ entityType: "sync.outbox" });
    expect(outboxRows).toHaveLength(1);
    expect(outboxRows[0]?.id).toBe("__outbox__m4");
  });
});
