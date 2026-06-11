# desktop-local-first-offline-edit-queue - Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Extend the existing `@repo/core-data` sync-outbox seam with offline queue state helpers. |
| Review Doc Path | `docs/reviews/desktop-local-first-offline-edit-queue/20260529-discovery-review.md` |
| Review Date/Version | 2026-05-29 |
| Feature Type | P1 Phase 3 offline edit queue and sync-log staging |
| Governing ADR | `docs/adr/0012-phase3-local-first-storage.md` |

## Frozen Assumptions

- Desktop SQLite remains the local-first durability plane.
- `@repo/core-data` owns repository, outbox, and queue-state contracts.
- Row `#11` canonical `account-sync` entities are the mutation targets.
- Row `#12` import ledger may provide existing local records, but row `#13` does not import or migrate browser data.
- Row `#14` owns reconnect/cloud replay, remote conflict detection, and remote acknowledgement.
- Device-local records never enter remote sync.

## Boundary Decision

- Keep `packages/desktop-local-first-offline-edit-queue/` as the workflow/docs anchor.
- Put generic queue/outbox extensions in `@repo/core-data`.
- Put active desktop runtime wiring in `@repo/plugin-web-storage` or the owning web bridge seams only where edits are already written.
- Use `apps/web/src/providers/AppProviders.tsx` only for mount/observability wiring if needed.
- Do not introduce plugin-private queue contracts.

## Required Runtime Outcome

- Offline edits to representative `account-sync` local-first records create durable queue entries in the same transaction as the entity write.
- Relaunch can list queued, failed, conflict, rollback-pending, and rolled-back entries.
- Queue entries are never marked remotely synced in this row.
- Device-local records return an explicit not-queueable result.
- Rollback records are auditable and refuse unsafe rollback when the current entity no longer matches the queued mutation's local revision.

## Queue Model

The existing `sync.outbox` row remains the durable sync-log entry. Row `#13` should add the smallest additional status metadata necessary to represent:

- `queued`: local mutation staged and waiting for row `#14` replay.
- `retryable_failure`: local staging or later replay can retry without losing the entity row.
- `conflict`: conflict is visible and blocks silent success.
- `rollback_pending`: rollback requested but not yet applied.
- `rolled_back`: rollback applied locally and retained as audit evidence.
- `replay_deferred`: local queue entry is valid, but cloud replay is outside this row.

## Mutation Semantics

- `put` writes entity plus queue entry transactionally.
- `delete` deletes entity plus queue entry transactionally.
- mutation ids are deterministic from target entity, operation, boundary key, and a local nonce or commit sequence.
- commit sequence order controls replay order.
- payload can remain opaque to the outbox, but row `#13` must preserve enough before/after metadata for safe rollback.

## Conflict and Rollback Semantics

- No silent last-write-wins.
- Local conflict markers can be set by validation or tests, but remote conflict detection waits for row `#14`.
- Rollback may only apply when the target entity still reflects the queued local mutation.
- Unsafe rollback must mark a visible conflict instead of deleting or overwriting current data.
- Rollback does not delete queue history; it changes queue status and writes an audit timestamp/reason.

## Build Phases

### Phase 1 - Queue contract hardening

- extend or wrap `sync.outbox` types with row `#13` queue status fields
- define mutation id, boundary key, base revision, local revision, and rollback metadata
- add tests for same-repo atomicity, device-local refusal, and status transitions

### Phase 2 - Representative offline staging helpers

- add helper API to stage `put`/`delete` mutations for representative `account-sync` entities
- cover `productivity.todo`, `productivity.habit`, `project.board`, and `project.card`
- ensure device-local records such as settings, pet, pomodoro, and board auxiliary state are not queued for remote sync

### Phase 3 - Retry/conflict/rollback observability

- add local queue listing and status update helpers
- implement safe rollback checks
- expose queue summaries for desktop runtime consumers without row `#14` remote replay

### Phase 4 - Desktop wiring and verification

- wire queue-aware write paths only in desktop runtime if needed by active surfaces
- keep browser runtime behavior unchanged
- rerun core-data, storage, web, and desktop gates
- audit that row `#14`, `#16`, `#17`, overlay/control/grid, and hidden notes work did not leak in

## Implementation Snapshot (2026-05-29)

- `@repo/core-data/src/sync-outbox.ts` now carries row `#13` queue metadata on canonical `sync.outbox` rows:
  - `queueStatus`
  - `boundaryKey`
  - `localRevision`
  - rollback safety + audit timestamps
- `@repo/core-data/src/offline-edit-queue.ts` now owns row `#13` staging/observability helpers:
  - representative staging wrappers for todo/habit/project board/card
  - explicit non-queueable results for device-local and unsupported surfaces
  - ordered queue listing + summary
  - local retry/conflict/rollback markers
  - rollback safety enforcement (divergence -> conflict)
- `@repo/plugin-web-storage/src/internal/desktopRepoBridge.ts` now routes only account-sync entity families through queue staging:
  - `productivity.todo`
  - `productivity.habit`
  - `project.board`
  - `project.card`
- Device-local bridge records remain direct non-queue writes:
  - `productivity.pomodoro_sessions`
  - `project.workspace_state`
  - `pet.state`
  - `settings.pref`
- Browser import ledger behavior remains in row `#12` path (`desktopWebDataMigration`) and is unchanged by row `#13` staging.

## Non-goals

- no reconnect scheduler
- no remote push, pull, merge, acknowledgement, or cloud account transport
- no backup/export/import UX
- no new browser migration/import
- no note-content model
