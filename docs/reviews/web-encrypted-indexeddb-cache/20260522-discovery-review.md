# Discovery Review — web-encrypted-indexeddb-cache

| 字段 | 值 |
|---|---|
| Feature | `web-encrypted-indexeddb-cache` |
| 日期 | 2026-05-22 |
| 执行者 | Codex (`feature-plan` inline, revise pass) |
| 外部调研 | Historical only. This revise pass did not refresh web research because the decision is now constrained by the live shared-worktree implementation in `packages/core-data/`. |

## Problem Framing

这次 revise 的目标不是重新选型，而是把计划文档收敛到已经落在共享工作树里的实现现实，并关闭 `feature-review` 退回的 4 类问题：

1. queue 持久化是否仍有明文或半明文残留
2. queue 是否在 `pushPending()` 前已经 durable 落盘
3. locked state 下 bootstrap / pull 是否仍会触发解密或明文 mirror 重建
4. 文档是否还在描述 `idb` / `MiniSearch`，而实际运行时已经是 raw IndexedDB + 自定义内存搜索 worker

因此这次 discovery 的结论必须以 **live implementation evidence** 为准，而不是继续保留早期方案扫描里的候选默认值。

## Live Implementation Evidence

### Shared runtime ownership is now concrete in `@repo/core-data`

- `packages/core-data/src/indexeddb-sync-blob.ts`
  - already implements the runtime in shared data infrastructure instead of `apps/web`
  - owns the durable store family:
    - `entity_blobs`
    - `entity_index`
    - `entity_sort_keys`
    - `pending_mutations`
    - `dead_letter_mutations`
    - `sync_state`
  - keeps decrypted mirrors and search state in memory only

### Review blocker 1: encrypted queue persistence is closed

- `mutateAndPersist()` appends to the in-memory pending queue, writes durable state with `persistState()`, and only then calls `pushPending()`
- `PendingMutationRow` persists `encryptedPayload` only
- the earlier plaintext-style optimistic payload drift is gone; restored pending rows rehydrate from encrypted payload only

### Review blocker 2: durable-before-push ordering is closed

- `mutateAndPersist()` now persists queue state before attempting network push
- `pushPending()` removes rows from memory only for the in-flight attempt and restores them on failure before persisting again
- this means push failure or restart still has a durable `pending_mutations` source of truth

### Review blocker 3: locked-state decrypt behavior is closed

- `loadStores()` reads durable rows and sentinel state while locked, but skips `rebuildDecryptedMirrorFromMemory()`
- `pull()` persists remote encrypted blob/index rows while locked and does not call `crypto.decryptRecord(...)`
- `onUnlock()` is the point that rebuilds decrypted mirror state and then rebuilds the search worker

### Review blocker 4: docs/runtime drift is real and must be corrected

- current runtime is not using `idb`
- current runtime is not using `MiniSearch`
- current runtime uses:
  - raw IndexedDB open/store/index operations
  - `fake-indexeddb` tests
  - a minimal in-memory token-map search worker that rebuilds from decrypted records only after unlock

## Current Repo Context

### Upstream rows still define the handoff seams

- `packages/web-sync-blob-driver/docs/api.md`
  - still defines the browser sync handoff seam that this row replaces with durable encrypted storage
- `packages/web-browser-e2e-crypto-runtime/docs/api.md`
  - remains the lock-transition authority for `manual` / `idle` / `unload` / `error`
- `packages/web-auth-device-session/src/storage.ts`
  - still uses `idb-keyval` for small auth/session storage only and should not be treated as the cache-layer pattern

### Web planning constraints remain unchanged

- `docs/planning/sub-prds/web/PRD.md`
  - still requires encrypted-at-rest local cache state for user-derived content
- `docs/planning/sub-prds/web/dev-plan.md`
  - still expects the six durable store families and memory-only FTS behavior

## Options Re-evaluated Against Live Code

### Option A — raw IndexedDB + shared runtime in `@repo/core-data`

Shape:

- docs anchor remains `packages/web-encrypted-indexeddb-cache/docs/`
- runtime remains in `packages/core-data/src/indexeddb-sync-blob.ts`
- schema, recovery, quota, and wipe behavior stay explicit and repo-owned
- search remains a narrow in-memory worker seam with no persisted plaintext index

Pros:

- matches the code already implemented in the shared worktree
- avoids reopening build work just to conform to an earlier planning preference
- keeps the durable schema and recovery logic explicit
- maintains the project rule that browser data infrastructure belongs in shared packages, not `apps/web`

Cons:

- more manual IndexedDB ceremony than `idb` or Dexie
- current search worker is intentionally minimal and not yet a parity-oriented search engine

Assessment:

- selected

### Option B — revert the plan back to `idb` + `MiniSearch`

Pros:

- cleaner wrapper ergonomics on paper
- stronger off-the-shelf search story on paper

Cons:

- contradicts the implemented runtime
- would reopen build work without a reviewer asking for that functional change
- does not help close the actual review blockers, which were about correctness and drift, not missing dependency adoption

Assessment:

- reject for this revise pass

### Option C — adopt Dexie / FlexSearch now

Pros:

- richer helper layers

Cons:

- introduces new dependency and abstraction churn after the implementation already exists
- expands scope beyond the review feedback
- increases the chance of accidentally moving later feature code onto direct table/index access

Assessment:

- reject

## Recommendation

Freeze the row on **Option A**:

- runtime boundary: `packages/core-data/src/indexeddb-sync-blob.ts`
- durable storage engine: raw IndexedDB
- unit/runtime test harness: `fake-indexeddb`
- quota/persistence observation: `navigator.storage.*`
- search boundary: custom minimal in-memory token-map worker, rebuilt only after unlock
- docs anchor: `packages/web-encrypted-indexeddb-cache/docs/`

`idb` and `MiniSearch` remain historical candidate directions only. They are not the reviewed implementation choice for this row anymore.

## Durable Store Contract

### Durable stores

- `entity_blobs`
  - encrypted blob source of truth
- `entity_index`
  - non-sensitive metadata only
- `entity_sort_keys`
  - encrypted sort/filter payload only
- `pending_mutations`
  - encrypted queued mutation payload only
- `dead_letter_mutations`
  - encrypted failed mutation payload only
- `sync_state`
  - cursor, sentinel, quota snapshot, and account commit metadata

### Memory-only state

- decrypted record mirror
- decrypted sort mirrors
- search worker token map
- transient rebuild state

## Risks And Open Questions

- the current token-map search worker is intentionally minimal; parity-driven search quality may still justify a later dedicated engine row
- real browser quota/eviction and multi-tab blocked/versionchange behavior still need browser verification even though the unit seams are in place
- later rows must not widen `entity_index` into a plaintext convenience cache
- queue policy remains deferred to `web-offline-outbox-conflicts`; this row owns storage seams only

## Reviewer Focus

- confirm the planning docs now describe the implemented raw IndexedDB + custom in-memory search seam instead of the older `idb` / `MiniSearch` preference
- confirm encrypted-only queue persistence and durable-before-push ordering are captured clearly
- confirm locked bootstrap and locked pull are documented as no-decrypt paths
- confirm future enhancement ideas are left as follow-up options, not treated as the current accepted design
