# single-table-todos-e2e — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | single-table-todos-e2e |
| Title | G2.6 Single-table sync baseline (Repository v0 outbox) |
| Roadmap | xai-g2-data-security-foundation · feature #7 · G2.6 |
| Status | READY_TO_SHIP |
| Current Phase | VERIFY |
| Suggested Next | manual ship only; live Supabase + 2-Mac smoke deferred |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-build + feature-verify (Claude Code, Track A) |
| Updated | 2026-05-20 01:02 PDT |
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
  row inside an outer `entityRepo.transaction(...)` so a crash mid-
  state cannot leave one without the other (FR-SY-32 M-12 in the
  sync-v1 PRD).
- Added `nextOutboxBatch` ordering by `commitSeq` and a
  `createMockCommitSeqAuthority` helper for tests / local fallback.
- Added 4 vitest cases covering happy-path put, rollback on outbox
  failure, ordering, and delete op.

### Phase 2 — Verify and document deferred gates

Status: DONE.

- `pnpm --filter @repo/core-data test`: 58 tests PASS (4 new outbox).
- `pnpm --filter @repo/core-data check-types`: PASS.
- Live Supabase / 2-Mac smoke + zero-knowledge dump PoC remain on
  `xai-v1.deferred-gates.md` because Supabase project provisioning is
  not available in this run.

## Verification Notes

feature-verify (Claude Code, Track A), 2026-05-20 01:02 PDT. Verdict: READY_TO_SHIP.

The Repository v0 outbox baseline is in place and the same-transaction
invariant has a proven test. The remaining live verification gates are
external and already recorded as deferred.

## Work Log

| Timestamp | Executor | Action | Verification | Next |
|---|---|---|---|---|
| 2026-05-19 04:21 PDT | Codex serial autorun | Added todo sync store and local two-device integration harness (sync-v1). | `pnpm --filter @repo/plugin-account test ...` | Run live two-Mac/Supabase/SQLCipher dump gates after #9. |
| 2026-05-20 01:02 PDT | feature-build + feature-verify (Claude Code, Track A) | Added Repository v0 outbox baseline (`sync-outbox.ts` + 4 vitest cases) and reconciled status to G2 roadmap. | `pnpm --filter @repo/core-data test` (58 tests) | manual ship only; continue roadmap |
