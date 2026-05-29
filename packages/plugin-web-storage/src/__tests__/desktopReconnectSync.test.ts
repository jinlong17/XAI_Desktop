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
  getDesktopLocalFirstReconnectSyncPreflight,
  getDesktopLocalFirstCalendarProviderState,
  mountDesktopLocalFirstRepositoryBridge,
  runDesktopLocalFirstCalendarProviderReconnect,
  runDesktopLocalFirstReconnectSync,
  setPref,
} from "../internal/storage.js";
import {
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
    namespace: `desktop-reconnect-sync-test-${Date.now()}`,
  });
  setTauriInvokeStub();
  Object.defineProperty(window.navigator, "onLine", {
    value: true,
    configurable: true,
  });
  (globalThis as typeof globalThis & {
    __XAI_WEB_TODO_SESSION__?: { accountId?: string; deviceId?: string };
    __XAI_DESKTOP_RECONNECT_SYNC_TRANSPORT__?: unknown;
    __XAI_DESKTOP_CALENDAR_SYNC_TRANSPORT__?: unknown;
  }).__XAI_WEB_TODO_SESSION__ = {
    accountId: "user-a",
    deviceId: "device-a",
  };
  mountDesktopLocalFirstRepositoryBridge(true);
});

afterEach(() => {
  unmountDesktopRepoBridge();
  mountDesktopLocalFirstRepositoryBridge(false);
  delete (globalThis as { __XAI_WEB_TODO_SESSION__?: unknown }).__XAI_WEB_TODO_SESSION__;
  delete (globalThis as { __XAI_DESKTOP_RECONNECT_SYNC_TRANSPORT__?: unknown }).__XAI_DESKTOP_RECONNECT_SYNC_TRANSPORT__;
  delete (globalThis as { __XAI_DESKTOP_CALENDAR_SYNC_TRANSPORT__?: unknown }).__XAI_DESKTOP_CALENDAR_SYNC_TRANSPORT__;
  vi.clearAllMocks();
});

describe("desktop reconnect sync runtime", () => {
  it("returns transport_unavailable when queue exists but transport is missing", async () => {
    await writeDesktopRepoValue("xai_task_cols", [
      {
        id: "overdue",
        key: "overdue",
        count: 1,
        tasks: [
          {
            id: "t1",
            title: { en: "Task one", zh: "任务一" },
          },
        ],
      },
    ]);

    const preflight = await getDesktopLocalFirstReconnectSyncPreflight();
    expect(preflight).toBe("transport_unavailable");
  });

  it("replays queued mutations through injected mock transport", async () => {
    await writeDesktopRepoValue("xai_task_cols", [
      {
        id: "overdue",
        key: "overdue",
        count: 1,
        tasks: [
          {
            id: "t2",
            title: { en: "Task two", zh: "任务二" },
          },
        ],
      },
    ]);

    (globalThis as typeof globalThis & {
      __XAI_DESKTOP_RECONNECT_SYNC_TRANSPORT__?: {
        replayMutation: (entry: { mutationId: string }) => Promise<{
          outcome: "acknowledged";
          remoteCommitSeq: string;
        }>;
      };
    }).__XAI_DESKTOP_RECONNECT_SYNC_TRANSPORT__ = {
      replayMutation: async (entry) => ({
        outcome: "acknowledged",
        remoteCommitSeq: `mock-${entry.mutationId}`,
      }),
    };

    const preflight = await getDesktopLocalFirstReconnectSyncPreflight();
    expect(preflight).toBe("ready");

    const replay = await runDesktopLocalFirstReconnectSync();
    expect(replay.preflight).toBe("ready");
    expect(replay.attempted).toBeGreaterThan(0);
    expect(replay.acknowledged).toBe(replay.attempted);

    const after = await getDesktopLocalFirstReconnectSyncPreflight();
    expect(after).toBe("queue_empty");
  });

  it("marks provider state reconnect-needed when reconnect preflight is blocked", async () => {
    setPref("xai_pref_integrations_connected_gcal", true);
    const result = await runDesktopLocalFirstCalendarProviderReconnect({
      providerIds: ["gcal"],
    });
    expect(result.preflight).toBe("transport_unavailable");
    expect(result.reconciledProviders).toEqual([]);
    expect(result.deferredProviders).toEqual(["gcal"]);
    expect(result.failures[0]?.code).toBe("transport_unavailable");

    const state = getDesktopLocalFirstCalendarProviderState("gcal");
    expect(state?.needsReconnectRefresh).toBe(true);
    expect(state?.availability).toBe("transport-unavailable");
  });

  it("reconciles provider state after reconnect runtime is eligible", async () => {
    setPref("xai_pref_integrations_connected_gcal", true);
    (globalThis as typeof globalThis & {
      __XAI_DESKTOP_RECONNECT_SYNC_TRANSPORT__?: {
        replayMutation: (entry: { mutationId: string }) => Promise<{
          outcome: "acknowledged";
          remoteCommitSeq: string;
        }>;
      };
      __XAI_DESKTOP_CALENDAR_SYNC_TRANSPORT__?: {
        reconcileProvider: (
          providerId: "gcal",
        ) => Promise<{ outcome: "reconciled" }>;
      };
    }).__XAI_DESKTOP_RECONNECT_SYNC_TRANSPORT__ = {
      replayMutation: async (entry) => ({
        outcome: "acknowledged",
        remoteCommitSeq: `mock-${entry.mutationId}`,
      }),
    };
    (globalThis as typeof globalThis & {
      __XAI_DESKTOP_CALENDAR_SYNC_TRANSPORT__?: {
        reconcileProvider: (
          providerId: "gcal",
        ) => Promise<{ outcome: "reconciled" }>;
      };
    }).__XAI_DESKTOP_CALENDAR_SYNC_TRANSPORT__ = {
      reconcileProvider: async () => ({ outcome: "reconciled" }),
    };

    const result = await runDesktopLocalFirstCalendarProviderReconnect({
      providerIds: ["gcal"],
    });
    expect(result.preflight).toBe("queue_empty");
    expect(result.attemptedProviders).toEqual(["gcal"]);
    expect(result.reconciledProviders).toEqual(["gcal"]);
    expect(result.failures).toEqual([]);

    const state = getDesktopLocalFirstCalendarProviderState("gcal");
    expect(state?.availability).toBe("ready");
    expect(state?.needsReconnectRefresh).toBe(false);
    expect(state?.lastSuccessAt).toBeTruthy();
  });
});
