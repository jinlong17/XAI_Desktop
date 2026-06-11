import {
  OFFLINE_QUEUE_REPLAYABLE_STATUSES,
  listOfflineQueueMutations,
  runReconnectSyncReplay,
  type ReconnectSyncContext,
  type ReconnectSyncPreflightStatus,
  type ReconnectSyncReplayResult,
  type ReconnectSyncTransport,
} from "@repo/core-data";

import { readDesktopRepoBridgeRepo } from "./desktopRepoBridge.js";

type ReconnectRuntimeTransportProvider =
  | ReconnectSyncTransport
  | ((
      context: ReconnectSyncContext,
    ) => ReconnectSyncTransport | null | Promise<ReconnectSyncTransport | null>);

let reconnectRuntimeEnabled = false;

export function setDesktopReconnectSyncRuntimeEnabled(enabled: boolean): void {
  reconnectRuntimeEnabled = enabled;
}

export async function preflightDesktopReconnectSync(): Promise<ReconnectSyncPreflightStatus> {
  const resolved = await resolveRuntimeDependencies();
  if (!resolved.online) {
    return "network_unavailable";
  }
  if (!resolved.accountId) {
    return "account_required";
  }
  if (!resolved.deviceId) {
    return "device_required";
  }
  if (!resolved.transport) {
    return "transport_unavailable";
  }
  if (!resolved.repo) {
    return "transport_unavailable";
  }

  const pendingRows = await listOfflineQueueMutations(resolved.repo, {
    boundaryKey: resolved.boundaryKey,
    statuses: OFFLINE_QUEUE_REPLAYABLE_STATUSES,
    limit: 1,
  });

  return pendingRows.length > 0 ? "ready" : "queue_empty";
}

export async function runDesktopReconnectSyncOnce(input?: {
  limit?: number;
}): Promise<ReconnectSyncReplayResult> {
  const resolved = await resolveRuntimeDependencies();
  if (!resolved.repo) {
    return {
      preflight: "transport_unavailable",
      attempted: 0,
      acknowledged: 0,
      duplicates: 0,
      conflicts: 0,
      retryableFailures: 0,
      deferred: 0,
      mutationResults: [],
    };
  }

  return runReconnectSyncReplay({
    repo: resolved.repo,
    context: {
      accountId: resolved.accountId,
      deviceId: resolved.deviceId,
      boundaryKey: resolved.boundaryKey,
      online: resolved.online,
    },
    transport: resolved.transport,
    limit: input?.limit,
  });
}

async function resolveRuntimeDependencies(): Promise<{
  repo: ReturnType<typeof readDesktopRepoBridgeRepo>;
  accountId: string;
  deviceId: string;
  boundaryKey: string;
  online: boolean;
  transport: ReconnectSyncTransport | undefined;
}> {
  const repo = reconnectRuntimeEnabled ? readDesktopRepoBridgeRepo() : null;
  const runtime = globalThis as typeof globalThis & {
    __XAI_WEB_TODO_SESSION__?: {
      accountId?: string;
      deviceId?: string;
    };
    __XAI_DESKTOP_RECONNECT_SYNC_TRANSPORT__?: ReconnectRuntimeTransportProvider;
  };

  const accountId = normalizeText(runtime.__XAI_WEB_TODO_SESSION__?.accountId);
  const deviceId = normalizeText(runtime.__XAI_WEB_TODO_SESSION__?.deviceId);
  const boundaryKey = accountId || "local-session";
  const online =
    reconnectRuntimeEnabled && typeof navigator !== "undefined"
      ? navigator.onLine !== false
      : false;
  const context: ReconnectSyncContext = {
    accountId,
    deviceId,
    boundaryKey,
    online,
  };

  return {
    repo,
    accountId,
    deviceId,
    boundaryKey,
    online,
    transport: await resolveTransport(
      runtime.__XAI_DESKTOP_RECONNECT_SYNC_TRANSPORT__,
      context,
    ),
  };
}

async function resolveTransport(
  provider: ReconnectRuntimeTransportProvider | undefined,
  context: ReconnectSyncContext,
): Promise<ReconnectSyncTransport | undefined> {
  if (!provider) {
    return undefined;
  }

  if (typeof provider === "function") {
    const resolved = await provider(context);
    return resolved ?? undefined;
  }

  return provider;
}

function normalizeText(value: string | undefined): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}
