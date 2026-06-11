# desktop-local-first-offline-edit-queue - API

## Scope

This row defines durable offline edit queue and sync-log staging contracts for local-first desktop records. It does not define reconnect/cloud replay, remote conflict resolution, backup/export/import, or browser migration.

## Upstream Interfaces

| Surface | Role |
|---|---|
| `docs/adr/0012-phase3-local-first-storage.md` | storage, queue, and conflict authority |
| `packages/core-data/src/types.ts` | `Repo<T>`, `RepoRecord`, `Repo.transaction`, `SyncScope` |
| `packages/core-data/src/sync-outbox.ts` | canonical outbox seam and atomic enqueue helper |
| `packages/core-data/src/entities.ts` | representative account-sync and device-local entity contracts |
| `packages/desktop-local-first-repository-bridge/docs/api.md` | row `#11` canonical entity targets |
| `packages/desktop-local-first-web-data-migration/docs/api.md` | row `#12` import ledger context |

## Downstream Consumers

| Consumer | Expected use |
|---|---|
| active desktop write paths | stage local account-sync edits durably |
| `desktop-local-first-sync-reconnect` | later drains/replays queued entries and sets remote outcomes |
| settings/debug UI consumer | displays queued/conflict/rollback summaries |
| `desktop-phase3-integrated-rc-gate` | verifies relaunch durability and no hidden success state |

## Implemented API Surface (2026-05-29)

Row `#13` runtime contracts are implemented in `@repo/core-data` and consumed by
desktop bridge write paths:

- `stageOfflineEditMutation`
- `stageTodoOfflineEdit`
- `stageHabitOfflineEdit`
- `stageProjectBoardOfflineEdit`
- `stageProjectCardOfflineEdit`
- `listOfflineQueueMutations`
- `getOfflineQueueSummary`
- `markOfflineMutationRetryableFailure`
- `markOfflineMutationConflict`
- `markOfflineMutationRollbackPending`
- `applyOfflineMutationRollback`

`@repo/plugin-web-storage/src/internal/desktopRepoBridge.ts` now calls the staging
helpers only for queueable `account-sync` entity families and keeps device-local
records non-queueable.

## Contract Assumptions

### Queueable Scope

Only `account-sync` records are queueable:

- `productivity.todo`
- `productivity.habit`
- `project.board`
- `project.card`

Device-local records must return an explicit non-queueable result:

- `productivity.pomodoro_sessions`
- `project.workspace_state`
- `pet.state`
- `settings.pref`
- notes or unknown surfaces

### Request Shape Assumptions

```ts
type OfflineEditOperation = "put" | "delete";

interface OfflineEditQueueRequest<T extends RepoRecord> {
  entity: T;
  op: OfflineEditOperation;
  boundaryKey: string;
  baseRevision?: number;
  mutationId?: string;
  nowIso?: () => string;
}
```

### Result Shape Assumptions

```ts
type OfflineEditQueueStatus =
  | "queued"
  | "replay_deferred"
  | "retryable_failure"
  | "conflict"
  | "rollback_pending"
  | "rolled_back";

type OfflineEditQueueResult =
  | {
      status: "queued";
      mutationId: string;
      outboxId: string;
      commitSeq: number;
    }
  | {
      status: "not_queueable";
      reason: "device_local" | "unsupported_surface";
      entityType: string;
    }
  | {
      status: "failed";
      reason: "repo_unavailable" | "write_failed" | "contract_mismatch";
      message: string;
    };
```

Build may refine names, but behavior must remain aligned.

## Queue Row Rules

- Entity row and queue row must commit in one `Repo.transaction`.
- Queue rows must retain deterministic `mutationId` and monotonic `commitSeq`.
- Queue rows must include target entity type, target entity id, operation, payload envelope, retry count, and optional base revision.
- Queue status must never imply remote success in row `#13`.
- Outbox ids continue using the reserved `__outbox__` prefix.

## Retry Semantics

- Retry count is durable and monotonic.
- Local retry updates are allowed only for queue bookkeeping.
- Remote replay attempts and acknowledgement are deferred to row `#14`.
- A failed local staging transaction must leave neither entity mutation nor queue row committed.

## Conflict Semantics

| State | Meaning |
|---|---|
| `queued` | local edit is staged and awaiting replay |
| `retryable_failure` | staging/replay can be retried and remains visible |
| `conflict` | mutation cannot be considered successful without user or later sync resolution |
| `rollback_pending` | local rollback has been requested but not applied |
| `rolled_back` | local rollback was applied and retained as audit history |
| `replay_deferred` | queue entry is valid but row `#14` owns remote replay |

## Rollback Semantics

- Rollback must be explicit; no implicit rollback on failure.
- Rollback can apply only when the current entity still matches the queued local mutation metadata.
- Unsafe rollback must mark `conflict`, not delete or overwrite newer local state.
- Rollback must preserve an audit trail with mutation id, target id, timestamp, and reason.

## Error Semantics

| Kind | Meaning | Expected handling |
|---|---|---|
| `not_queueable` | record is `device-local` or unsupported | return explicit non-queueable result |
| `repo_unavailable` | desktop repo seam is unavailable | fail visibly; do not fake queue success |
| `contract_mismatch` | entity/outbox shape violates shared contract | fail fast; requires code fix |
| `write_failed` | transactional staging failed | preserve existing repo state |
| `rollback_not_safe` | current entity diverged from queued mutation metadata | mark conflict |
| `replay_deferred` | remote replay is outside this row | keep queued and visible |

## Permission and Boundary Notes

- Browser runtime remains browser-only.
- Desktop runtime may stage queue rows only through `@repo/core-data` helpers.
- Business packages must not create a parallel queue contract.
- Row `#13` must not call cloud APIs, schedule reconnect, or mark remote acknowledgement.
