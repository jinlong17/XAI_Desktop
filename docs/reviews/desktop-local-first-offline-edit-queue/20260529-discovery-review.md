# Discovery Review - desktop-local-first-offline-edit-queue

## Sources Read

- `docs/adr/0012-phase3-local-first-storage.md`
- `packages/core-data/src/types.ts`
- `packages/core-data/src/sync-outbox.ts`
- `packages/core-data/src/entities.ts`
- `packages/core-data/src/desktop-web-import.ts`
- `packages/desktop-local-first-repository-bridge/docs/api.md`
- `packages/desktop-local-first-web-data-migration/docs/api.md`
- `packages/desktop-local-first-repository-bridge/docs/dev_log.md`
- `packages/desktop-local-first-web-data-migration/docs/dev_log.md`
- `packages/plugin-web-storage/src/internal/desktopRepoBridge.ts`
- `apps/web/src/providers/AppProviders.tsx`

## Current Contract Facts

- ADR-0012 requires Desktop SQLite as the local-first durability plane and says durable sync log/outbox must share the same durability plane as entity records.
- ADR-0012 requires `account-sync` writes to couple entity changes and queue state transactionally.
- ADR-0012 forbids silent last-write-wins and requires conflict/failure to remain explicit and auditable.
- `@repo/core-data` already owns `Repo<T>`, `RepoRecord`, `Repo.transaction`, `OutboxEntry`, `enqueueOutboxEntry`, `nextOutboxBatch`, and `createMockCommitSeqAuthority`.
- `enqueueOutboxEntry` already enforces same-repo atomicity for entity rows plus `sync.outbox` rows.
- Row `#11` now writes canonical `account-sync` records for `productivity.todo`, `productivity.habit`, `project.board`, and `project.card`.
- Row `#11` keeps pomodoro, board auxiliary state, pet, and settings as `device-local` records.
- Row `#12` adds import run/ledger records and imports representative browser data without queueing or replaying sync.

## Option A - Extend Existing Sync Outbox

Use `sync.outbox` as the durable sync log and add row `#13` helper APIs around it for local queue state, retry status, conflict markers, and rollback metadata.

Pros:

- Matches ADR-0012's requirement to use the `sync-outbox` seam.
- Keeps queue ordering and mutation idempotency in one canonical location.
- Avoids creating a second plugin-private queue contract.

Cons:

- Existing `OutboxEntry` lacks explicit status and rollback fields, so the contract must be extended carefully.

## Option B - Add A Separate Queue State Sidecar

Keep `sync.outbox` rows immutable and add `sync.queue_state` sidecar rows keyed by mutation id for conflict/retry/rollback state.

Pros:

- Lower risk to existing `sync.outbox` baseline.
- Lets row `#14` update replay state without rewriting payload rows.

Cons:

- Adds a second row family that must remain transactionally consistent with the outbox row.
- More surface area for build and verify.

## Recommendation

Use Option A with a minimal sidecar escape hatch only if implementation proves the current `OutboxEntry` cannot be extended compatibly. The preferred row `#13` build should:

- keep `enqueueOutboxEntry` as the atomic entity-plus-outbox write path;
- add a small typed status model for queued/retry/conflict/rollback state;
- expose helper APIs that stage local edits and list/update queue state without remote replay;
- make device-local mutation attempts return an explicit non-queueable result.

## Scope Boundaries

- Row `#13` may create and update durable local queue rows.
- Row `#13` may mark entries as conflict/failed/rolled back locally.
- Row `#13` must not contact cloud APIs, drain to a remote, mark remote acknowledgement, or implement reconnect scheduling.
- Row `#13` must not perform browser import, backup/export, or hidden notes work.

## Main Risks

- The build may accidentally treat local queue creation as successful remote sync.
- Rollback could delete a newer local edit unless it checks mutation ownership and current entity state.
- Device-local row families could be mistakenly queued.
- Commit sequence authority may remain test-only unless the build defines a deterministic desktop fallback for this row.

## Review Recommendation

Approve the plan if the API locks the existing `sync.outbox` seam, explicitly refuses device-local queueing, and keeps replay/acknowledgement deferred to row `#14`.
