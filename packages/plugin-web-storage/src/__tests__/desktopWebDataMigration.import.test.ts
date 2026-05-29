import {
  createInMemoryRepo,
  type Repo,
  type RepoRecord,
} from "@repo/core-data";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const repoState = vi.hoisted(() => {
  return {
    repos: new Map<string, Repo<RepoRecord>>(),
  };
});

vi.mock("@repo/core-data", async () => {
  const actual = await vi.importActual<typeof import("@repo/core-data")>(
    "@repo/core-data",
  );

  return {
    ...actual,
    createTauriRepo: vi.fn(
      (_invoke: unknown, options: { namespace: string; schemaVersion: number }) => {
        const existing = repoState.repos.get(options.namespace);
        if (existing) {
          return existing;
        }
        const repo = actual.createInMemoryRepo<RepoRecord>({
          namespace: options.namespace,
          schemaVersion: options.schemaVersion,
        });
        repoState.repos.set(options.namespace, repo);
        return repo;
      },
    ),
  };
});

import {
  __resetDesktopWebImportStateForTests,
  runDesktopWebDataImport,
  setDesktopWebImportRuntimeEnabled,
} from "../internal/desktopWebDataMigration.js";
import { DESKTOP_REPO_NAMESPACE } from "../internal/desktopRepoBridge.js";

const IMPORT_LEDGER_NAMESPACE = "xai-web-desktop-local-first-import";

function setTauriInvokeStub(): void {
  const win = window as Window & {
    __TAURI_INTERNALS__?: {
      invoke?: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
    };
  };
  win.__TAURI_INTERNALS__ = {
    invoke: async <T>() => undefined as T,
  };
}

function getRepo(namespace: string): Repo<RepoRecord> {
  const repo = repoState.repos.get(namespace);
  if (!repo) {
    throw new Error(`repo not initialized for namespace: ${namespace}`);
  }
  return repo;
}

beforeEach(() => {
  repoState.repos.clear();
  localStorage.clear();
  __resetDesktopWebImportStateForTests();
  setDesktopWebImportRuntimeEnabled(true);
  setTauriInvokeStub();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("desktop web data import reconcile", () => {
  it("imports representative tasks and writes per-surface ledger", async () => {
    localStorage.setItem(
      "xai_task_cols",
      JSON.stringify([
        {
          id: "overdue",
          tasks: [{ id: "t1", title: { en: "Task 1", zh: "任务1" } }],
          completed: [],
        },
      ]),
    );

    const report = await runDesktopWebDataImport({ boundaryKey: "user-a" });

    const taskResult = report.results.find((entry) => entry.surface === "tasks");
    expect(taskResult?.status).toBe("imported");

    const bridgeRepo = getRepo(DESKTOP_REPO_NAMESPACE);
    const todos = await bridgeRepo.list({ entityType: "productivity.todo" });
    expect(todos).toHaveLength(1);

    const importRepo = getRepo(IMPORT_LEDGER_NAMESPACE);
    const ledgers = await importRepo.list({
      entityType: "desktop.web_import_ledger",
    });
    expect(ledgers.some((entry) => (entry as { surface?: string }).surface === "tasks")).toBe(true);
  });

  it("keeps unchanged rerun as no-op without rewriting timestamps", async () => {
    localStorage.setItem(
      "xai_task_cols",
      JSON.stringify([
        {
          id: "overdue",
          tasks: [{ id: "t1", title: { en: "Task 1", zh: "任务1" } }],
          completed: [],
        },
      ]),
    );

    const first = await runDesktopWebDataImport({ boundaryKey: "user-a" });
    expect(first.results.find((entry) => entry.surface === "tasks")?.status).toBe("imported");

    const bridgeRepo = getRepo(DESKTOP_REPO_NAMESPACE);
    const firstTodos = await bridgeRepo.list({ entityType: "productivity.todo" });
    const firstUpdatedAt = firstTodos[0]?.updatedAt;

    const second = await runDesktopWebDataImport({ boundaryKey: "user-a" });
    expect(second.results.find((entry) => entry.surface === "tasks")?.status).toBe("unchanged");

    const secondTodos = await bridgeRepo.list({ entityType: "productivity.todo" });
    expect(secondTodos[0]?.updatedAt).toBe(firstUpdatedAt);
  });

  it("reconciles stale imported ids without deleting unrelated records", async () => {
    localStorage.setItem(
      "xai_task_cols",
      JSON.stringify([
        {
          id: "overdue",
          tasks: [
            { id: "t1", title: { en: "Task 1", zh: "任务1" } },
            { id: "t2", title: { en: "Task 2", zh: "任务2" } },
          ],
          completed: [],
        },
      ]),
    );

    await runDesktopWebDataImport({ boundaryKey: "user-a" });

    const bridgeRepo = getRepo(DESKTOP_REPO_NAMESPACE);
    await bridgeRepo.put({
      id: "manual-outside-import",
      entityType: "productivity.todo",
      schemaVersion: 1,
      createdAt: "2026-05-29T00:00:00.000Z",
      updatedAt: "2026-05-29T00:00:00.000Z",
      syncScope: "account-sync",
      title: "Manual",
      done: false,
      labelIds: [],
    } as RepoRecord);

    localStorage.setItem(
      "xai_task_cols",
      JSON.stringify([
        {
          id: "overdue",
          tasks: [{ id: "t1", title: { en: "Task 1", zh: "任务1" } }],
          completed: [],
        },
      ]),
    );

    const second = await runDesktopWebDataImport({ boundaryKey: "user-a" });
    const taskResult = second.results.find((entry) => entry.surface === "tasks");

    expect(taskResult?.status).toBe("imported");
    expect(taskResult?.deletedCount).toBeGreaterThanOrEqual(1);

    const todos = await bridgeRepo.list({ entityType: "productivity.todo" });
    const todoIds = todos.map((entry) => entry.id);
    expect(todoIds).toContain("manual-outside-import");
    expect(todoIds.some((id) => id.includes("t2"))).toBe(false);
  });

  it("does not delete prior imported data when source becomes corrupt", async () => {
    localStorage.setItem(
      "xai_task_cols",
      JSON.stringify([
        {
          id: "overdue",
          tasks: [{ id: "t1", title: { en: "Task 1", zh: "任务1" } }],
          completed: [],
        },
      ]),
    );

    await runDesktopWebDataImport({ boundaryKey: "user-a" });

    const bridgeRepo = getRepo(DESKTOP_REPO_NAMESPACE);
    const before = await bridgeRepo.list({ entityType: "productivity.todo" });

    localStorage.setItem("xai_task_cols", "{bad-json");

    const report = await runDesktopWebDataImport({ boundaryKey: "user-a" });
    expect(report.results.find((entry) => entry.surface === "tasks")?.status).toBe("corrupt");

    const after = await bridgeRepo.list({ entityType: "productivity.todo" });
    expect(after).toEqual(before);
  });

  it("warns boundary conflict and allows explicit override", async () => {
    localStorage.setItem(
      "xai_task_cols",
      JSON.stringify([
        {
          id: "overdue",
          tasks: [{ id: "t1", title: { en: "Task 1", zh: "任务1" } }],
          completed: [],
        },
      ]),
    );

    await runDesktopWebDataImport({ boundaryKey: "user-a" });

    localStorage.setItem(
      "xai_task_cols",
      JSON.stringify([
        {
          id: "overdue",
          tasks: [{ id: "t2", title: { en: "Task 2", zh: "任务2" } }],
          completed: [],
        },
      ]),
    );

    const blocked = await runDesktopWebDataImport({ boundaryKey: "user-b" });
    const blockedTask = blocked.results.find((entry) => entry.surface === "tasks");
    expect(blocked.boundaryConflict).toBe(true);
    expect(blockedTask?.status).toBe("skipped");
    expect(blockedTask?.skippedReason).toBe("boundary_conflict");

    const allowed = await runDesktopWebDataImport({
      boundaryKey: "user-b",
      allowBoundaryOverride: true,
    });
    expect(allowed.results.find((entry) => entry.surface === "tasks")?.status).toBe(
      "imported",
    );
  });
});
