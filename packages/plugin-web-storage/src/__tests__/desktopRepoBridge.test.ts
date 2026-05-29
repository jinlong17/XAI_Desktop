import {
  createInMemoryRepo,
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
  mountDesktopRepoBridge,
  patchCalendarProviderState,
  readCalendarProviderState,
  unmountDesktopRepoBridge,
  writeDesktopRepoValue,
} from "../internal/desktopRepoBridge.js";

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

beforeEach(() => {
  currentRepo = createInMemoryRepo<RepoRecord>({
    namespace: `desktop-repo-bridge-test-${Date.now()}`,
  });
  setTauriInvokeStub();
  mountDesktopRepoBridge({
    enabled: true,
    publish: () => undefined,
  });
});

afterEach(() => {
  unmountDesktopRepoBridge();
  vi.clearAllMocks();
});

describe("desktopRepoBridge canonical record mapping", () => {
  it("writes tasks and habits into canonical productivity records", async () => {
    await writeDesktopRepoValue("xai_task_cols", [
      {
        id: "overdue",
        key: "overdue",
        count: 1,
        tasks: [
          {
            id: "t1",
            title: { en: "Task one", zh: "任务一" },
            tag: "work",
          },
        ],
        completed: [
          {
            id: "t2",
            title: { en: "Task two", zh: "任务二" },
            tag: "study",
          },
        ],
      },
    ]);

    await writeDesktopRepoValue("xai_habits_state", {
      schemaVersion: 1,
      habits: [
        {
          id: "h1",
          title: { en: "Read", zh: "阅读" },
        },
      ],
      checkIns: {
        h1: {
          "2026-05-29": true,
        },
      },
      diaries: {},
    });

    const todos = await currentRepo.list({ entityType: "productivity.todo" });
    const habits = await currentRepo.list({ entityType: "productivity.habit" });
    const legacyTaskBlob = await currentRepo.list({
      entityType: "productivity.tasks_state",
    });
    const legacyHabitBlob = await currentRepo.list({
      entityType: "productivity.habits_state",
    });
    const outboxRows = await currentRepo.list({ entityType: "sync.outbox" });

    expect(todos.length).toBe(2);
    expect(todos.map((row) => row.entityType)).toEqual([
      "productivity.todo",
      "productivity.todo",
    ]);
    expect(habits.length).toBe(1);
    expect(habits[0]?.entityType).toBe("productivity.habit");
    expect(legacyTaskBlob).toEqual([]);
    expect(legacyHabitBlob).toEqual([]);
    expect(outboxRows.length).toBe(3);
    expect(
      outboxRows.every((row) => {
        const typed = row as RepoRecord & { queueStatus?: unknown };
        return typed.queueStatus === "queued";
      }),
    ).toBe(true);
  });

  it("normalizes xai_boards_v2 into canonical project.board and project.card", async () => {
    await writeDesktopRepoValue("xai_boards_v2", [
      {
        id: "b1",
        workspaceId: "personal",
        name: { en: "Roadmap", zh: "路线图" },
        cover: "linear-gradient(red, blue)",
        template: "kanban",
        lists: [
          {
            id: "list-todo",
            key: "todo",
            cards: [
              {
                id: "c1",
                title: { en: "Card one", zh: "卡片一" },
                labels: ["l1"],
              },
            ],
          },
          {
            id: "list-doing",
            key: "doing",
            cards: [
              {
                id: "c2",
                title: { en: "Card two", zh: "卡片二" },
                members: ["u1"],
              },
            ],
          },
        ],
      },
    ]);

    await writeDesktopRepoValue("xai_active_board", "b1");

    const boards = await currentRepo.list({ entityType: "project.board" });
    const cards = await currentRepo.list({ entityType: "project.card" });
    const workspaceRows = await currentRepo.list({
      entityType: "project.workspace_state",
    });
    const outboxRows = await currentRepo.list({ entityType: "sync.outbox" });

    expect(boards.length).toBe(1);
    expect(boards[0]?.entityType).toBe("project.board");
    expect(cards.length).toBe(2);
    expect(cards.every((row) => row.entityType === "project.card")).toBe(true);

    const workspaceKeys = workspaceRows
      .map((row) => {
        const typedRow = row as RepoRecord & { storageKey?: unknown };
        return typedRow.storageKey;
      })
      .filter((value): value is string => typeof value === "string");

    expect(workspaceKeys).toContain("xai_active_board");
    expect(workspaceKeys).not.toContain("xai_boards_v2");
    expect(outboxRows.length).toBe(3);
  });

  it("writes calendar provider state as calendar.provider_state device-local records", async () => {
    const created = await patchCalendarProviderState("gcal", {
      connectionState: "connected",
      availability: "offline",
      needsReconnectRefresh: true,
      lastFailureCode: "network_unavailable",
      lastFailureMessage: "Offline mode",
    });

    expect(created).toBeTruthy();
    expect(created?.entityType).toBe("calendar.provider_state");
    expect(created?.syncScope).toBe("device-local");
    expect(created?.providerId).toBe("gcal");
    expect(created?.syncMode).toBe("online-only");
    expect(created?.needsReconnectRefresh).toBe(true);

    const rows = await currentRepo.list({ entityType: "calendar.provider_state" });
    expect(rows).toHaveLength(1);
    const record = rows[0] as RepoRecord & {
      providerId?: unknown;
      availability?: unknown;
      storageKey?: unknown;
    };
    expect(record.providerId).toBe("gcal");
    expect(record.availability).toBe("offline");
    expect(record.storageKey).toBeUndefined();

    const cached = readCalendarProviderState("gcal");
    expect(cached?.lastFailureCode).toBe("network_unavailable");
    expect(cached?.lastFailureMessage).toBe("Offline mode");
  });
});
