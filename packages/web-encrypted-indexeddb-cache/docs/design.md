# web-encrypted-indexeddb-cache — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A (revised to match live implementation) — docs anchor under `packages/web-encrypted-indexeddb-cache/`, runtime in `@repo/core-data` using raw IndexedDB durable stores, encrypted queue persistence before push, locked-mode no-decrypt paths, and a minimal in-memory token-map search worker |
| Review Doc Path | `docs/reviews/web-encrypted-indexeddb-cache/20260522-discovery-review.md` |
| Review Date/Version | 2026-05-22 |
| Feature Type | W5 Web encrypted local cache and FTS-boundary planning |
| Roadmap | `web-ticktick-parity` · feature #9 · W5 |

## Frozen Assumptions

- This row does not create a second repository abstraction outside `@repo/core-data`.
- `packages/web-encrypted-indexeddb-cache/docs/` is the workflow anchor package only; runtime ownership is already concretely exercised in `packages/core-data/src/indexeddb-sync-blob.ts`.
- `idb-keyval` remains acceptable for tiny auth/session buckets, but is intentionally **not** the cache-layer tool for this row.
- The reviewed implementation choice is raw IndexedDB, not `idb`.
- IndexedDB durable state is split by sensitivity:
  - `entity_blobs` = encrypted source of truth
  - `entity_index` = non-sensitive metadata only
  - `entity_sort_keys` = encrypted sensitive sort/filter payloads
  - queue stores = encrypted payload storage only
  - `sync_state` = cursor/sentinel/cache-health metadata
- `pending_mutations` must be durable before any `pushPending()` attempt and must persist encrypted payload only.
- Locked bootstrap and locked remote pull may populate durable ciphertext/index rows, but must not rebuild decrypted mirrors until unlock.
- Full-text search text, decrypted sort mirrors, and any decrypted blob cache are memory-only and must wipe on runtime lock transitions.
- This row may define queue-store schemas (`pending_mutations`, `dead_letter_mutations`), but retry/replay/conflict behavior stays deferred to `web-offline-outbox-conflicts`.
- `apps/web` must remain a thin host consumer and must not own IndexedDB schema logic directly.

## Scope Boundary

This feature owns planning for:

- `docs/reviews/web-encrypted-indexeddb-cache/`
- `packages/web-encrypted-indexeddb-cache/docs/`
- the future encrypted cache/runtime seam inside `packages/core-data/`
- the store-schema split for durable encrypted cache data
- quota/sentinel/wipe behavior
- the memory-only FTS worker boundary

This feature does not own:

- search UI, keyboard UX, or browser routing
- offline replay policy or dead-letter UI
- auth/session storage
- live Supabase schema changes
- business feature rendering inside `apps/web`

## Dependency Overview

- Upstream source: `docs/reviews/web-encrypted-indexeddb-cache/20260521-roadmap-seed.md`
- Governing docs:
  - `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
  - `docs/PLUGIN_MAP.md`
- `docs/planning/sub-prds/web/{PRD.md,dev-plan.md}`
- `packages/web-sync-blob-driver/docs/{design.md,api.md}`
- `packages/web-browser-e2e-crypto-runtime/docs/{design.md,api.md}`
- `packages/web-auth-device-session/src/storage.ts`
- Runtime evidence:
  - `packages/core-data/src/indexeddb-sync-blob.ts`
  - `packages/core-data/tests/indexeddb-sync-blob.test.ts`
- Supporting runtime/test choices:
  - raw IndexedDB API in `@repo/core-data`
  - `fake-indexeddb`
  - minimal in-memory token-map search worker
  - `MiniSearch`: follow-up candidate only, not current selected runtime

## Runtime Shape Recommendation

### Shared cache/runtime inside `@repo/core-data`

Current responsibilities / frozen direction:

- open and migrate the browser cache database
- define and protect the durable store schema
- replace the current process-local sync mirror with an encrypted durable backing store
- expose typed cache state and wipe helpers to downstream Web rows
- subscribe to browser-crypto lock transitions and wipe decrypted in-memory mirrors
- persist encrypted pending rows before attempting push
- restore pending rows durably on push failure

### Durable store families

- `entity_blobs`
- `entity_index`
- `entity_sort_keys`
- `pending_mutations`
- `dead_letter_mutations`
- `sync_state`

### Memory-only surfaces

- decrypted FTS index
- decrypted sort mirrors
- transient rebuild state
- any currently displayed plaintext cache

## Implementation Notes

- Raw IndexedDB is the current reviewed implementation, not just a preference. Planning now follows that implementation instead of the earlier `idb` proposal.
- Queue-store schemas must be available before `web-offline-outbox-conflicts`, but queue policy must remain outside this row to avoid roadmap overlap.
- The worker search engine stays behind a narrow adapter; a minimal in-memory token map is the implemented default, while `MiniSearch` remains only a possible future upgrade candidate once parity requirements justify it.
- Sentinel loss is treated as cache-integrity loss. Recovery should prefer reset + rehydrate over optimistic partial reuse.

## Phase Mapping

### Phase 1 — Shared encrypted cache port and schema freeze

Status: DONE.

- freeze runtime ownership in `@repo/core-data`
- freeze durable store families and sensitive/non-sensitive split
- freeze queue-schema ownership boundaries

### Phase 2 — Mirror replacement, quota, and recovery

Status: DONE.

- define how the current sync mirror hands off into the encrypted cache
- freeze quota observation and persistence-request behavior
- freeze sentinel, blocked, and unexpected-close recovery rules
- freeze durable-before-push queue persistence and failure recovery behavior

### Phase 3 — Memory-only FTS and lock-driven wipe

Status: DONE.

- freeze the worker adapter and rebuild flow
- freeze lock/idle/unload/error wipe integration
- freeze locked bootstrap / locked pull as no-decrypt paths
- prove no FTS/search plaintext persists

## Reviewer Focus

- Confirm the docs-anchor plus `@repo/core-data` runtime split is the least risky boundary.
- Confirm `entity_index` remains strictly non-sensitive and does not become a loophole for plaintext drift.
- Confirm queue-store schema ownership is separated cleanly from later offline conflict behavior.
- Confirm the minimal in-memory search worker implementation is acceptable for the first secure version and that any future `MiniSearch` adoption is treated as a separate follow-up, not a hidden requirement of this row.
