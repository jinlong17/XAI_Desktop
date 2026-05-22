# web-encrypted-indexeddb-cache — Test Plan

## Validation Strategy

Validation focuses on three claims:

1. IndexedDB durable state contains only ciphertext or explicitly allowed non-sensitive metadata.
2. Sentinel/quota/blocked recovery behaves predictably across fake and real browser runtimes.
3. FTS/search/sort plaintext exists only in memory and wipes on lock transitions.

This revise pass also treats two workflow-review claims as explicit regression gates:

4. queued mutations are durable before push and remain encrypted-only at rest
5. locked bootstrap and locked pull do not decrypt durable or remote ciphertext until unlock

## Required Automated Coverage

### Unit coverage

- database open/upgrade helpers
- durable store schema creation and migration guards
- sentinel read/write/reset helpers
- quota snapshot helpers
- lock-triggered in-memory wipe helpers
- queue-store persistence helpers

### Contract coverage

- `entity_blobs` persistence proves ciphertext-only storage
- `entity_index` fixtures prove only non-sensitive metadata persists
- `entity_sort_keys` fixtures prove sensitive sort payloads are encrypted at rest
- `pending_mutations` and `dead_letter_mutations` persist encrypted payloads only
- queued mutation persistence happens before push completion and survives push failure as durable encrypted rows
- `sync_state` sentinel-missing detection triggers rehydrate/reset path
- wipe helpers consume the canonical runtime lock reasons `manual` / `idle` / `unload` / `error`

### IndexedDB runtime coverage

- fake IndexedDB schema upgrades with `fake-indexeddb`
- blocked/open/versionchange paths
- quota-exceeded simulation path where the runtime surfaces typed cache failure
- unexpected-close handling where supported by the test harness

### Memory-only FTS coverage

- unlock-triggered rebuild from encrypted blob fixtures
- search worker contains results only after explicit rebuild/unlock
- lock transition clears the worker index
- no durable store contains FTS tokens or plaintext snippets after rebuild

### Locked-state coverage

- locked bootstrap reads durable stores without calling decrypt
- locked pull persists remote encrypted rows without calling decrypt
- unlocked transition rebuilds decrypted mirror/search state only after the runtime unlock event

### Regression / downstream coverage

- current sync-blob handoff seam can point at the new cache boundary without changing `Repo<T>`
- later search rows can consume the worker adapter without requiring direct IndexedDB access
- later offline queue rows can reuse queue stores without redefining the schema

## Local Mock Strategy

Allowed seams:

- `fake-indexeddb` for Node/Vitest unit coverage
- deterministic encrypted fixtures for blob/sort-key/queue rows
- synthetic runtime transition fixtures from `web-browser-e2e-crypto-runtime` semantics
- mock quota snapshots and blocked/open error injection

Rules:

- do not store plaintext business payloads in test fixtures that claim to validate durable encrypted stores
- do not bypass the wipe contract by clearing worker memory through ad hoc test-only hooks
- do not test queue-policy behavior that belongs to `web-offline-outbox-conflicts`

## Per-Phase Verification Gates

### Phase 1 — Schema and shared cache port

- `test -f docs/reviews/web-encrypted-indexeddb-cache/20260522-feature-brief.md`
- `test -f docs/reviews/web-encrypted-indexeddb-cache/20260522-discovery-review.md`
- `test -f packages/web-encrypted-indexeddb-cache/docs/design.md`
- `test -f packages/web-encrypted-indexeddb-cache/docs/api.md`
- `test -f packages/web-encrypted-indexeddb-cache/docs/test.md`
- `test -f packages/web-encrypted-indexeddb-cache/docs/dev_log.md`
- schema and ownership docs agree on durable store names and queue split

### Phase 2 — Durable cache and recovery

- fake IndexedDB tests for open/upgrade/reset paths
- tests proving `entity_blobs` and `entity_sort_keys` never persist plaintext payloads
- tests proving `entity_index` contains only approved non-sensitive metadata
- sentinel-missing path forces cache reset + rehydrate
- tests proving push failure leaves one durable encrypted `pending_mutations` row and no plaintext optimistic payload

### Phase 3 — Memory-only FTS and wipe

- worker rebuild tests pass after unlock fixtures
- worker wipe tests pass for `manual`, `idle`, `unload`, and `error`
- post-wipe assertions prove no persisted FTS text exists in any store
- locked bootstrap and locked remote pull tests prove decrypt is not called until unlock

## Suggested Commands

```bash
test -f docs/reviews/web-encrypted-indexeddb-cache/20260522-feature-brief.md
test -f docs/reviews/web-encrypted-indexeddb-cache/20260522-discovery-review.md
test -f packages/web-encrypted-indexeddb-cache/docs/design.md
test -f packages/web-encrypted-indexeddb-cache/docs/api.md
test -f packages/web-encrypted-indexeddb-cache/docs/test.md
test -f packages/web-encrypted-indexeddb-cache/docs/dev_log.md
```

## Current Shared-Worktree Evidence

The following implementation tests already exist and should remain aligned with this doc set:

- encrypted-at-rest durable rows
- sentinel-missing reset path
- quota snapshot persistence and private-mode-like quota failure
- lock-triggered wipe for `manual`, `idle`, `unload`, and `error`
- locked bootstrap no-decrypt
- locked remote pull no-decrypt
- push failure leaves encrypted-only pending rows

Parent-session verification already reported these commands as passing against the current shared worktree:

```bash
pnpm --filter @repo/core-data test
pnpm --filter @repo/core-data exec vitest run tests/indexeddb-sync-blob.test.ts
pnpm --filter @repo/core-data check-types
```

## Acceptance Focus

- Reviewers can see one clear path from the current sync-blob mirror to a durable encrypted browser cache without adding host-local data abstractions.
- The durable stores are explicitly classified by sensitivity and do not create a plaintext loophole.
- Quota and sentinel recovery are planned as first-class behavior, not post-hoc fixes.
- Memory-only FTS/search state is enforced by contract and test strategy, not just by convention.
- Reviewers can see that the earlier planning drift (`idb` / `MiniSearch`) has been replaced with the actual raw IndexedDB + custom in-memory worker implementation choice.
