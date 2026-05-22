# web-encrypted-indexeddb-cache — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | web-encrypted-indexeddb-cache |
| Title | W5 Encrypted IndexedDB cache and memory-only FTS boundary for Web |
| Roadmap | `web-ticktick-parity` · feature #9 · W5 |
| Current Phase | FEATURE_VERIFY |
| Status | READY_TO_SHIP |
| Suggested Next | ship |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | feature-verify (Codex gpt-5.4 inline) |
| Updated | 2026-05-22 11:17 PDT |
| Blockers | — |
| Review Notes | Verification passed on the current shared worktree. The revised discovery/design/api/test docs still match the live `@repo/core-data` boundary: raw IndexedDB durable stores, encrypted-only queue rows, durable-before-push persistence, locked bootstrap/pull no-decrypt behavior, and a memory-only search worker. Fresh verification on this pass reran the targeted IndexedDB suite (11/11), full `@repo/core-data` suite (104/104), and `check-types` successfully. Roadmap tracker can remain `PENDING` until `ship` records the final state transition.

## Phase Plan

### Phase 1 — Shared encrypted cache port and schema freeze

Status: DONE.

- initialize the docs anchor package and freeze the runtime split (`packages/web-encrypted-indexeddb-cache/docs/` + later `@repo/core-data` implementation)
- freeze durable store families and the sensitive/non-sensitive split
- freeze queue-store schema ownership before later offline conflict work begins

Gate:

- reviewer can confirm where cache runtime code belongs and which stores are durable versus memory-only

### Phase 2 — Mirror replacement, quota, and recovery

Status: DONE.

- define how the current sync-blob mirror hands off into durable encrypted cache stores
- freeze sentinel, blocked/open/versionchange, and quota recovery behavior
- freeze the local test strategy around `fake-indexeddb`

Gate:

- reviewer can see one clear recovery story for Safari/private-mode and eviction-related failure

### Phase 3 — Memory-only FTS and lock-driven wipe

Status: DONE.

- freeze the worker adapter and rebuild-from-encrypted-blob flow
- freeze lock/idle/unload/error wipe behavior from the browser crypto runtime
- keep persistent FTS text explicitly out of scope

Gate:

- reviewer can confirm plaintext search/sort state never needs durable browser storage

## Risks

- later feature rows may try to over-expand `entity_index` into a plaintext convenience store unless review keeps the sensitivity boundary strict
- browser quota and eviction rules vary, so sentinel recovery must remain authoritative even if persistence requests succeed
- queue-store schema overlap with `web-offline-outbox-conflicts` must remain limited to storage seams only
- Safari/private-mode and multi-tab upgrade behavior remain implementation risks that docs alone cannot retire
- the current token-map search worker is intentionally minimal and may need a later parity-focused upgrade row, but that is not required to approve this boundary revision

## Review Notes

- Resolved blocker: queue payload persistence is encrypted-only and durable pending rows no longer carry optimistic plaintext fields.
- Resolved blocker: `mutateAndPersist()` persists queue state before calling `pushPending()`, so push failure leaves a durable encrypted pending row.
- Resolved blocker: `loadStores()` and `pull()` respect locked state and avoid decrypting durable or remote payloads while locked.
- Resolved blocker: docs now describe the actual selected runtime boundary: raw IndexedDB + minimal in-memory search worker in `@repo/core-data`; `idb` / `MiniSearch` remain follow-up candidates only.
- Intentionally not changed in this revise pass: no new production feature code, no new dependency adoption, and no expansion of queue policy into `web-offline-outbox-conflicts` scope.

## Implementation Evidence

- Reviewed implementation work from `2026-05-22` in shared worktree:
  - `packages/core-data/src/indexeddb-sync-blob.ts`
  - `packages/core-data/tests/indexeddb-sync-blob.test.ts`
- Parent-session verification already passed for:
  - `pnpm --filter @repo/core-data test`
  - `pnpm --filter @repo/core-data exec vitest run tests/indexeddb-sync-blob.test.ts`
  - `pnpm --filter @repo/core-data check-types`
- File-contract checks required by this planning row are present:
  - `docs/reviews/web-encrypted-indexeddb-cache/20260522-feature-brief.md`
  - `docs/reviews/web-encrypted-indexeddb-cache/20260522-discovery-review.md`
  - `packages/web-encrypted-indexeddb-cache/docs/design.md`
  - `packages/web-encrypted-indexeddb-cache/docs/api.md`
  - `packages/web-encrypted-indexeddb-cache/docs/test.md`
  - `packages/web-encrypted-indexeddb-cache/docs/dev_log.md`
- Review-relevant implementation facts now reflected in docs:
  - no durable plaintext queue blobs
  - queue persistence before push
  - locked-mode bootstrap/pull avoids decrypting blob cache
  - docs/runtime boundary aligned to current raw IndexedDB implementation

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-22 01:28 PDT | feature-plan (Codex gpt-5.3-codex inline) | Fresh plan: created the formal feature brief from the roadmap seed, produced the discovery review plus docs four-pack, and froze the recommended boundary where this row stays a workflow/docs anchor while the runtime cache later lands in `@repo/core-data` using `idb` + `fake-indexeddb`, with durable encrypted stores, schema-only queue ownership, and a memory-only MiniSearch worker wipe seam driven by browser-crypto lock transitions. | — | feature-review |
| 2026-05-22 01:46 PDT | feature-review (Codex gpt-5.4) | Approved planning set for execution. Confirmed design-api-test-docs consistency across store split, contracts, sensitivity boundaries, and recovery/wipe expectations. | — | feature-build |
| 2026-05-22 01:49 PDT | feature-review (Codex gpt-5.4) | Re-reviewed against the live `@repo/core-data` worktree implementation and returned REVISE. Found blocking drift in encrypted queue persistence, locked-state handling, and the reviewed implementation choice (`idb` + MiniSearch) versus the current raw-IDB/custom-worker runtime. Rechecked with `pnpm --filter @repo/core-data test` (101 passing), but the missing restart/locked-state coverage means approval cannot stand. | — | feature-plan |
| 2026-05-22 01:53 PDT | feature-build (Codex gpt-5.3-codex inline) | Executed remaining approved build work: removed durable queue optimistic plaintext persistence, made queue persistence durable before push attempts, enforced locked-mode bootstrap/pull behavior, and aligned docs to the raw IndexedDB + minimal in-memory search seam. Added tests for locked bootstrap and push-failure queue persistence. | — | feature-verify |
| 2026-05-22 01:58 PDT | feature-verify (Codex gpt-5.3-codex inline) | Verification passed: encrypted-only queue rows confirmed, queue persistence-before-push regression covered, locked bootstrap/pull avoids decrypt on lock, and doc/contract alignment is clean for docs + runtime seam. Validation run: `pnpm --filter @repo/core-data test -- indexeddb-sync-blob.test.ts` (11 passed), `pnpm --filter @repo/core-data test` (104 passed), and `pnpm --filter @repo/core-data check-types`. | — | ship |
| 2026-05-22 11:03 PDT | feature-plan (Codex gpt-5.3-codex inline) | Revise pass: updated discovery/design/api/test/dev_log to match the live `@repo/core-data` implementation and close the prior `feature-review` blockers. The accepted planning boundary is now raw IndexedDB durable stores plus a minimal in-memory search worker, with encrypted-only queue persistence, durable-before-push ordering, and locked-mode no-decrypt behavior explicitly documented. | — | feature-review |
| 2026-05-22 11:09 PDT | feature-review (Codex gpt-5.4 inline) | Approved the revised planning set. Rechecked discovery/design/api/test docs against `packages/core-data/src/indexeddb-sync-blob.ts` and `packages/core-data/tests/indexeddb-sync-blob.test.ts`; the prior blocker areas are now aligned and executable. Validation rerun on this pass: `pnpm --filter @repo/core-data exec vitest run tests/indexeddb-sync-blob.test.ts` (11 passed), `pnpm --filter @repo/core-data test` (104 passed), and `pnpm --filter @repo/core-data check-types`. | — | feature-build |
| 2026-05-22 11:17 PDT | feature-verify (Codex gpt-5.4 inline) | Verify-after-phases pass on the current shared worktree: rechecked the revised docs package against the live `packages/core-data` implementation, confirmed the encrypted queue / durable-before-push / locked no-decrypt guarantees still hold, and reran `pnpm --filter @repo/core-data exec vitest run tests/indexeddb-sync-blob.test.ts` (11 passed), `pnpm --filter @repo/core-data test` (104 passed), and `pnpm --filter @repo/core-data check-types` (passed). No new blockers found; feature is ready for ship and the roadmap row should stay `PENDING` until ship updates it. | — | ship |
