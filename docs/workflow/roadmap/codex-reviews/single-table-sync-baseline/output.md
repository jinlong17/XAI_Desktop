## Codex Cross-vendor Review

**Feature**: single-table-sync-baseline
**Commit(s)**: 43ffdda
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: BLOCKED

### Strengths (max 4 bullets)
- `sync-outbox.ts` keeps the outbox surface in `@repo/core-data` and re-exports it cleanly via `packages/core-data/src/index.ts:57-68`; no Host/plugin boundary violation in this diff.
- The API shape is small and composable: enqueue, ordered drain, and an injected commit-seq allocator seam instead of hard-wiring sync transport.
- The new vitest file covers the main happy-path behaviors plus failure, ordering, and delete paths (`packages/core-data/tests/sync-outbox.test.ts`).
- Workflow hygiene is solid: commit message includes Why/What/Scope/Risk/Docs/Tests, and the dev log / roadmap row were updated.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P0] The core contract claim is not true on the desktop driver. `enqueueOutboxEntry()` nests `entityRepo.transaction(...)` and `outboxRepo.transaction(...)` (`packages/core-data/src/sync-outbox.ts:95-108`), but `createTauriRepo().transaction()` is explicitly a non-atomic callback wrapper (`packages/core-data/src/tauri-sqlite.ts:148-159`; `packages/core-data-sqlite-driver/docs/dev_log.md:54-56`). If `db_put` for the entity succeeds and the outbox write fails, the entity can persist alone. The feature/dev-log statements that same-transaction rollback is “proved” are therefore incorrect (`packages/single-table-todos-e2e/docs/dev_log.md:31-38,54-55`).
- [P1] The docs are materially out of sync with the shipped surface. `packages/single-table-todos-e2e/docs/api.md:3-24`, `design.md:7-19`, and `test.md:5-19` still describe the old `plugin-account` todo sync store, one-driver transaction grouping, plaintext outbox rows, and end-to-end push/pull coverage, none of which is what this commit added.
- [P1] `OutboxEntry.commitSeq` and `nextCommitSeq` are typed as `number` (`packages/core-data/src/sync-outbox.ts:33,61`), while the existing sync transport already standardizes commit seq as BIGINT strings (`packages/plugin-account/src/sync-engine.ts:57,81,93`). This bakes in a breaking contract change before the Rust/Supabase authority lands.
- [P2] Re-enqueueing the same `mutationId` overwrites `id: outbox_<mutationId>` and resets retry metadata (`packages/core-data/src/sync-outbox.ts:78-90`). That may be intended idempotency, but it is currently undocumented and untested.
- [P2] The payload security boundary is comment-only: `payload` is any string, with no guard/test ensuring encrypted-envelope-only input or forbidding cleartext/PII (`packages/core-data/src/sync-outbox.ts:42-43,57`).
- [P2] No test exercises `baseRevision` / conditional-write conflict semantics, despite the field being part of the contract (`packages/core-data/src/sync-outbox.ts:48-49`; tests only cover put/delete/order/failure).

### Concrete next-phase targets (max 6 bullets)
- Introduce a real shared-transaction seam for multi-repo writes, or hard-block `enqueueOutboxEntry()` from Tauri-backed repos until `db_transaction_begin/commit` exists.
- Add a regression test using the SQLite/Tauri driver boundary that proves entity rollback when the outbox write fails.
- Align `packages/single-table-todos-e2e/docs/{api,design,test}.md` with the actual G2.6 scope and remove stale sync-v1 claims.
- Change the outbox commit-seq surface to a typed authority interface returning BIGINT strings, matching `plugin-account` transport contracts.
- Define and test same-`mutationId` semantics: overwrite vs preserve `retryCount` / `lastAttemptAt`.
- Add one focused test for `baseRevision` propagation and one guard/doc for payload cleartext policy.

### Out of scope confirmed
- Live Supabase/PostgREST/Realtime verification remains deferred.
- Real 2-Mac sync smoke remains deferred.
- Real SQLCipher copied-file / dump verification remains deferred.
- DMG/MAS sandbox dry-run evidence remains a separate G2.7 gate.