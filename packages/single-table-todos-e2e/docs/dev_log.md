# single-table-todos-e2e — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | single-table-todos-e2e |
| Title | G2.6 Single-table sync baseline (Repository v0 outbox) |
| Roadmap | xai-g2-data-security-foundation · feature #7 · G2.6 |
| Status | SHIPPED |
| Current Phase | SHIPPED |
| Suggested Next | manual ship only; live Supabase + 2-Mac smoke deferred |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-build + feature-verify (Claude Code, Track A) |
| Updated | 2026-05-20 13:25 PDT |
| Blockers | Live Supabase provisioning + 2-Mac smoke deferred (see `xai-v1.deferred-gates.md`); SQLCipher PRAGMA wiring deferred to G2.4 follow-up |

## Phase Plan

### Phase 1 — Repository v0 outbox baseline + mock tests

Status: DONE.

- Reconciled the prior sync-v1 single-table-todos-e2e harness with the
  G2.1 Repository v0 contract.
- Added `packages/core-data/src/sync-outbox.ts` defining the
  Repository v0 `OutboxEntry` record (commitSeq, mutationId,
  targetEntityType/Id, op, payload, retryCount, baseRevision).
- Added `enqueueOutboxEntry` — atomically writes the entity and outbox
  row inside a SINGLE `repo.transaction(...)`. Atomicity model:
    - In-memory driver: snapshot-restoring transaction.
    - In-process SQLite driver (`createSqliteRepo`): `BEGIN`/`COMMIT`
      on the driver.
    - On-disk SQLite (`createTauriRepo`): one `db_put_batch` Tauri call
      wrapping the entity + outbox writes in one SQLite transaction
      (G2.6 P0 fix landed 2026-05-20).
  Entity and outbox rows now share a namespace; outbox ids are prefixed
  with the reserved `__outbox__` sentinel so they cannot collide with
  application records. Splitting the entity/outbox repos is rejected at
  runtime with `E3009` because two namespaces cannot commit atomically.
- Added `nextOutboxBatch` ordering by `commitSeq` and a
  `createMockCommitSeqAuthority` helper for tests / local fallback.
- Added vitest coverage for happy-path put, in-memory rollback, real
  SQLite-driver rollback (sabotage), ordering, delete op, split-repo
  rejection, and outbox-id collision rejection.

### Phase 2 — Verify and document deferred gates

Status: DONE.

- `pnpm --filter @repo/core-data test`: 58 tests PASS (4 new outbox).
- `pnpm --filter @repo/core-data check-types`: PASS.
- Live Supabase / 2-Mac smoke + zero-knowledge dump PoC remain on
  `xai-v1.deferred-gates.md` because Supabase project provisioning is
  not available in this run.

## Verification Notes

feature-verify (Claude Code, Track A), 2026-05-20 01:02 PDT. Verdict: READY_TO_SHIP.

The Repository v0 outbox baseline is in place. Atomic-rollback is
proved on every shipped driver: in-memory via snapshot restore;
in-process SQLite (`createSqliteRepo`) via driver `BEGIN`/`COMMIT`;
on-disk SQLite (`createTauriRepo`) via the `db_put_batch` Tauri
command added 2026-05-20 (P0 fix). The remaining live verification
gates are external and already recorded as deferred.

bug-fix follow-up (Claude Code, Track A), 2026-05-20 02:13 PDT.

Codex cross-vendor review flagged the prior "same-transaction rollback
is proved" claim as inaccurate against the Tauri driver: its
`transaction(fn)` was a non-atomic callback wrapper that ran writes
in-place against the shared connection. This is now fixed:
`createTauriRepo.transaction(fn)` buffers all writes in JS and
dispatches them as ONE `db_put_batch` Tauri call; the Rust side wraps
the batch in a SQLite `BEGIN`/`COMMIT`, so any per-entry failure (or a
throw from `fn` before the commit point) leaves the database
untouched. See `docs/contracts/tauri-commands-v0.md` §6.1 and
`apps/desktop/src-tauri/src/commands/database.rs` for the wire-level
contract.

## Work Log

| Timestamp | Executor | Action | Verification | Next |
|---|---|---|---|---|
| 2026-05-19 04:21 PDT | Codex serial autorun | Added todo sync store and local two-device integration harness (sync-v1). | `pnpm --filter @repo/plugin-account test ...` | Run live two-Mac/Supabase/SQLCipher dump gates after #9. |
| 2026-05-20 01:02 PDT | feature-build + feature-verify (Claude Code, Track A) | Added Repository v0 outbox baseline (`sync-outbox.ts` + 4 vitest cases) and reconciled status to G2 roadmap. | `pnpm --filter @repo/core-data test` (58 tests) | manual ship only; continue roadmap |
| 2026-05-20 02:13 PDT | bug-fix (Claude Code, Track A) | P0 G2.6 atomicity fix: refactored `enqueueOutboxEntry` to share one namespace for entity + outbox rows (outbox ids prefixed with `__outbox__`), added `db_put_batch` Tauri command + `createTauriRepo.transaction(fn)` buffered-batch shim so on-disk SQLite gets a real `BEGIN`/`COMMIT`. Retracted the prior misleading "same-transaction rollback is proved" claim; atomicity now holds on every shipped driver. | `cargo check`, `cargo check --features crypto`, `cargo test --features crypto database::` (13/13), `pnpm --filter @repo/core-data test` (66/66), `pnpm --filter @repo/core-data check-types`, `pnpm --filter desktop build` — all PASS. | manual ship only; continue roadmap |
| 2026-05-20 13:25 PDT | ship (Claude Code, Track A) | Manifest + Status Panel promoted SHIPPED. Includes P0 G2.6 db_put_batch atomic-on-SQLite (`c5b0e77`). Codex R2 APPROVED. | `43ffdda`, `c5b0e77` | continue roadmap |
