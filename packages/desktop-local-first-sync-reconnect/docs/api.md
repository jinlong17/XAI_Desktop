# desktop-local-first-sync-reconnect - API

## Scope

This row adds reconnect replay contracts for queued row `#13` offline mutations. Names may be refined during build, but the behavior below is the frozen contract for review and verification.

## Core Types

```ts
type ReconnectSyncPreflightStatus =
  | "ready"
  | "network_unavailable"
  | "account_required"
  | "device_required"
  | "transport_unavailable"
  | "queue_empty";

type ReconnectSyncMutationOutcome =
  | "acknowledged"
  | "duplicate"
  | "conflict"
  | "retryable_failure"
  | "deferred";

interface ReconnectSyncContext {
  accountId: string;
  deviceId: string;
  boundaryKey: string;
  online: boolean;
  nowIso?: () => string;
}

interface ReconnectSyncTransport {
  replayMutation(
    entry: OutboxEntry,
    context: ReconnectSyncContext,
  ): Promise<ReconnectSyncTransportResult>;
}

type ReconnectSyncTransportResult =
  | {
      outcome: "acknowledged" | "duplicate";
      remoteRevision?: number;
      remoteCommitSeq?: string;
    }
  | {
      outcome: "conflict";
      message: string;
      remoteRevision?: number;
    }
  | {
      outcome: "retryable_failure" | "deferred";
      code: string;
      message: string;
    };
```

## Replay Runner Contract

```ts
interface ReconnectSyncReplayInput {
  repo: Repo<RepoRecord | OutboxEntry>;
  context?: Partial<ReconnectSyncContext>;
  transport?: ReconnectSyncTransport;
  limit?: number;
}

interface ReconnectSyncReplayResult {
  preflight: ReconnectSyncPreflightStatus;
  attempted: number;
  acknowledged: number;
  duplicates: number;
  conflicts: number;
  retryableFailures: number;
  deferred: number;
  mutationResults: Array<{
    mutationId: string;
    outcome: ReconnectSyncMutationOutcome;
    message?: string;
  }>;
}
```

Rules:

- `preflight !== "ready"` means no mutation is marked successful.
- A missing transport returns `transport_unavailable`.
- Missing account id returns `account_required`.
- Missing device id returns `device_required`.
- Offline network state returns `network_unavailable`.
- No pending rows returns `queue_empty`.
- Replay order is ascending `commitSeq`.

## Durable Outcome Semantics

Successful acknowledgement must persist enough data for debug/status surfaces:

- `ackedAt` or equivalent timestamp;
- remote revision and/or remote commit sequence when provided;
- durable exclusion from pending queue summaries.

Conflict semantics reuse row `#13` conflict markers:

- `queueStatus = "conflict"`;
- `conflictAt` set;
- `lastFailureCode = "conflict"`;
- human-readable `lastFailureMessage`.

Retryable failure semantics reuse row `#13` retry markers:

- `queueStatus = "retryable_failure"` or `replay_deferred`;
- `retryCount` increments for actual attempts;
- `lastAttemptAt`, `lastFailureCode`, `lastFailureMessage`, and `lastFailureAt` are updated.

Rollback semantics are not changed by this row. `rollback_pending` and `rolled_back` rows are not replayed.

## Runtime Bridge Contract

The web/desktop bridge may expose a global or package export for controlled smoke tests:

```ts
interface DesktopReconnectSyncRuntime {
  preflight(): Promise<ReconnectSyncPreflightStatus>;
  runOnce(options?: { limit?: number }): Promise<ReconnectSyncReplayResult>;
}
```

The bridge must be absent or return gated status when:

- desktop repo is unavailable;
- runtime profile is browser-only;
- account state is unauthenticated or unconfigured;
- network/transport is unavailable.

## Package Boundaries

| Package | Allowed role |
|---|---|
| `@repo/core-data` | queue replay types, runner, durable status helpers, tests |
| `@repo/plugin-web-storage` | desktop repo bridge integration and smoke helper if needed |
| `@repo/web-auth-device-session` | account/device state gate only if existing API is insufficient |
| `@repo/plugin-account` | optional adapter to existing sync transport vocabulary |
| `@repo/web` | provider wiring and integration tests only |

No business package should mint its own queue status contract.
