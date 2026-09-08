# Feature Brief — web-encrypted-indexeddb-cache

| 字段 | 值 |
|---|---|
| Feature Slug | `web-encrypted-indexeddb-cache` |
| 创建日期 | 2026-05-22 |
| 作者 | Codex (`feature-plan` inline) |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_DISCOVERY` |
| Source | `docs/reviews/web-encrypted-indexeddb-cache/20260521-roadmap-seed.md` |
| 关联文档 | `docs/workflow/roadmap/web-ticktick-parity.md`、`packages/web-sync-blob-driver/docs/{design.md,api.md}`、`packages/web-browser-e2e-crypto-runtime/docs/{design.md,api.md}`、`packages/web-auth-device-session/src/storage.ts`、`packages/core-data/src/{types.ts,sync-blob.ts}`、`apps/release-site/app/lib/indexedDbRepo.ts`、`docs/planning/sub-prds/web/{PRD.md,dev-plan.md}` |

---

## Structured Brief

### Feature Title

W5 Encrypted IndexedDB cache and memory-only FTS boundary for Web

### Canonical Name And Rationale

- Canonical slug: `web-encrypted-indexeddb-cache`
- Package docs anchor: `packages/web-encrypted-indexeddb-cache/docs/`
- Why this name fits:
  - the roadmap row already uses it
  - the feature is Web-only and browser-runtime specific
  - the row owns the encrypted local cache boundary, not a general repository rewrite or search UI

### Problem / Motivation

`web-sync-blob-driver` currently freezes a process-local mirror inside `@repo/core-data`, which is enough to prove repository semantics but not enough to support the later Web roadmap.

The next Web rows need a durable browser-local data plane that can:

1. persist encrypted entity blobs without storing plaintext user content
2. keep only non-sensitive metadata queryable while locked
3. rebuild sensitive sort/search structures only after unlock
4. survive refresh/offline/resume with sentinel-based recovery
5. expose quota, eviction, and wipe behavior explicitly

If this row does not first freeze that boundary, later rows will likely split responsibility incorrectly:

- `apps/web` or route-level code will start owning IndexedDB schemas
- later feature rows will persist plaintext fields ad hoc for convenience
- queue storage (`pending_mutations`, `dead_letter_mutations`) will be implemented twice
- FTS and sort-key wipe semantics will drift from `web-browser-e2e-crypto-runtime` lock events

### Desired Outcome

Plan one conservative browser cache boundary where:

- workflow docs live under `packages/web-encrypted-indexeddb-cache/docs/`
- runtime cache code later lands inside `packages/core-data/`, not `apps/web`
- IndexedDB stores are split by sensitivity (`entity_blobs`, `entity_index`, `entity_sort_keys`, queue stores, `sync_state`)
- lock/idle/unload transitions from `web-browser-e2e-crypto-runtime` wipe decrypted in-memory mirrors and the FTS worker
- quota, sentinel-missing, and Safari/private-mode fallback behavior are explicit before implementation starts

### Scope

- Define the canonical runtime boundary between the docs anchor package and later implementation work in `packages/core-data/`.
- Choose the IndexedDB schema/tooling approach for a multi-store encrypted cache with typed migrations and transactions.
- Freeze the ownership split between durable cache stores and memory-only decrypted search/sort mirrors.
- Define how `web-sync-blob-driver` hands off mirror state into the encrypted cache without changing the `Repository<T>` contract.
- Define the cache-store contract for:
  - `entity_blobs`
  - `entity_index`
  - `entity_sort_keys`
  - `pending_mutations`
  - `dead_letter_mutations`
  - `sync_state`
- Define quota observation, persistence requests, sentinel recovery, and wipe semantics.
- Initialize `design.md`, `api.md`, `test.md`, and `dev_log.md` for this feature.

### Non-goals

- No production code in this run.
- No search UI, keyboard UI, or router work; those belong to later rows.
- No offline replay policy, retry backoff policy, or 409 three-way diff UI; those belong to `web-offline-outbox-conflicts`.
- No auth/session storage redesign; `idb-keyval` remains upstream for `web-auth-device-session`.
- No change to the public `Repository<T>` contract already frozen by `@repo/core-data`.
- No plaintext FTS persistence, plaintext sort-key persistence, or business logic in `apps/web`.

### Constraints

- IndexedDB must not persist plaintext user content, plaintext sensitive sort keys, or persistent FTS text.
- Locked mode must still allow non-sensitive metadata views via `entity_index`, but any decrypted search/sort state must be memory-only and wipeable.
- Runtime implementation must consume the lock transition seam from `web-browser-e2e-crypto-runtime` rather than inventing a second timer/wipe authority.
- The cache boundary must remain compatible with the existing `web-sync-blob-driver` handoff seam and keep implementation inside shared data infrastructure rather than host code.
- Safari/private-mode and sentinel-missing recovery must be testable with local/fake IndexedDB plus browser E2E where available.
- `pending_mutations` and `dead_letter_mutations` may be introduced here as schema/storage seams only; higher-level queue orchestration stays deferred to `web-offline-outbox-conflicts`.

### Acceptance Criteria

1. `docs/reviews/web-encrypted-indexeddb-cache/20260522-discovery-review.md` records candidate cache/FTS/tooling options with repo evidence plus current external-source evidence.
2. `packages/web-encrypted-indexeddb-cache/docs/{design,api,test,dev_log}.md` exist and agree on one implementation boundary.
3. `design.md` freezes whether this row is a docs anchor plus `@repo/core-data` runtime split, and identifies the recommended IndexedDB and FTS tooling choices.
4. `api.md` defines the persistent store contracts, lock/wipe observation seam, sentinel/quota semantics, and downstream interfaces for `web-sync-blob-driver`, later search UI rows, and `web-offline-outbox-conflicts`.
5. `test.md` defines local coverage for encrypted-at-rest guarantees, fake IndexedDB/schema migration paths, sentinel reset behavior, quota warnings, and memory-only FTS wipe behavior.
6. `dev_log.md` ends with `Status = NEEDS_REVIEW` and `Suggested Next = feature-review`.

### Open Questions

1. Whether the cache runtime should expose one new `createEncryptedIndexedDbCache(...)` seam inside `@repo/core-data`, or split lower-level store helpers from a higher-level mirror adapter.
2. Whether encrypted sort-key payloads should be stored as one per-record aggregate blob or one row per sortable field for cheaper partial rebuilds.
3. Whether the first build phase should include the worker adapter abstraction immediately, or defer the concrete FTS engine choice behind a typed port until the later search row consumes it.

### Planner Handoff

- Recommended direction: keep `packages/web-encrypted-indexeddb-cache/docs/` as the workflow anchor only, but land runtime code in `packages/core-data/` so the Web cache remains a repository/data-plane concern instead of a second host-local abstraction.
- Key review focus: IndexedDB tool choice, queue-schema ownership split versus `web-offline-outbox-conflicts`, lock-driven wipe semantics, sentinel/quota recovery, and whether the proposed memory-only FTS seam is strict enough to prevent plaintext persistence drift.
- Expected next output: discovery review + docs four-pack in `NEEDS_REVIEW`, ready for `feature-review`.
