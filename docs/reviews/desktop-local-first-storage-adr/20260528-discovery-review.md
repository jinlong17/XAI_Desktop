# Discovery Review - desktop-local-first-storage-adr

> Feature: `desktop-local-first-storage-adr`
> Date: 2026-05-28
> Executor: feature-plan (Codex, gpt-5.4 inline)
> Research mode: internal repo evidence only

## 1. Problem Framing

ADR-0011 redefined the desktop product as a React + Tauri + local-first hybrid app and left Phase 3 storage as a separate architecture gate. The repo now has three relevant persistence families:

1. Browser-owned persistence:
   - `@repo/plugin-web-storage` localStorage registry and migration hook
   - `@repo/core-data` browser Sync Blob + IndexedDB cache runtime
2. Shared repository contracts:
   - `repository-v0-contract`
   - `@repo/core-data` repo types, migration helpers, outbox helpers
3. Desktop-native evidence:
   - `sqlcipher-local-db`
   - `core-data-sqlite-driver`
   - Tauri `db_*` commands using `app_data_dir`

Those surfaces are useful, but they do not yet answer the Phase 3 architecture questions:

- What is the desktop system of record?
- Does desktop share browser IndexedDB or import from it?
- Where do conflict and queue semantics live?
- What is the live on-disk location and what counts as backup/export?
- Which interfaces are shared, and which are desktop-only adapters?

This row must freeze those answers before any Phase 3 implementation row starts.

## 2. Evidence Summary

### 2.1 Governing authority

- ADR-0011 explicitly treats SQLite as an advisory candidate only and calls for a dedicated Phase 3 ADR before implementation.
- The roadmap manifest marks this row as the architecture gate for Waves W2-W7.

### 2.2 Existing desktop evidence

- `packages/sqlcipher-local-db` proves the Rust side can open and validate a SQLCipher-backed SQLite file derived from a KEK, but it deliberately defers repository/schema ownership.
- `packages/core-data-sqlite-driver` proves `@repo/core-data` can bridge a Tauri SQLite command surface and that the file can live under `app_data_dir/xai-repo-v0.db`, but its historical review shows transaction/migration honesty and boundary rigor matter.
- `docs/reviews/desktop-basic-macos-menu-config-store/...` already establishes a host-owned `app_config_dir` policy for config-only JSON, which is a precedent that config files and Phase 3 entity storage should stay separate.

### 2.3 Existing shared contract evidence

- `packages/repository-v0-contract` and `packages/core-data/src/types.ts` already define a reusable `Repo<T extends RepoRecord>` contract with `transaction`, `migrate`, `metadata`, `syncScope`, and typed record metadata.
- `packages/core-data/src/sync-outbox.ts` already defines a durable outbox shape with stable mutation ids and same-transaction enqueue expectations. That is the strongest existing precedent for the future sync-log model.

### 2.4 Existing browser/Web evidence

- `packages/plugin-web-storage` and `packages/xai-web-persistence-contract` freeze localStorage ownership for Web preferences and module-scoped browser state.
- `packages/web-encrypted-indexeddb-cache` freezes browser durable cache expectations around IndexedDB, encrypted payloads, and durable pending mutations.
- `packages/web-sync-blob-driver` freezes browser sync transport and mirror semantics behind `@repo/core-data`.

### 2.5 Key implication

The repo already trends toward a split architecture:

- shared contracts in `@repo/core-data`
- browser persistence owned by browser-friendly implementations
- desktop-native durability owned by the Tauri/Rust side

The Phase 3 ADR should formalize that split rather than force one storage engine to serve both Web and desktop equally.

## 3. Candidate Options

## Option A - Desktop-primary SQLite through Tauri/Rust, with one-way browser import and shared `@repo/core-data` contracts

Desktop keeps its own primary durable store in SQLite under the native app data directory. Browser localStorage and IndexedDB remain browser-owned and are imported into desktop through explicit migration/import flows rather than shared live storage. Shared repository contracts stay in `@repo/core-data`; desktop implements a native driver and queue/outbox tables beneath that seam.

### Pros

- Best match for a desktop local-first system of record:
  - durable
  - queryable
  - observable in tests
  - suitable for schema migrations
  - suitable for append-only sync logs and conflict markers
- Aligns with existing evidence:
  - `sqlcipher-local-db`
  - `core-data-sqlite-driver`
  - Repository v0 and outbox contracts
- Keeps Web browser behavior stable because browser data is imported rather than repointed
- Gives backup/export/import a clean native file policy
- Supports later Phase 3 rows without reopening the engine choice

### Cons

- Highest implementation cost
- Requires careful migration/import tooling
- Requires desktop-specific schema/version management
- Requires the ADR to define a clearer account-vs-device boundary than the current Web storage rows needed

## Option B - Reuse browser IndexedDB as the desktop primary store

Desktop keeps the existing Web/browser persistence model as the canonical store, possibly by running the same browser-facing code inside the Tauri window and avoiding a native DB.

### Pros

- Lowest apparent migration cost
- Maximum reuse of current browser persistence code
- Less Rust-side schema work at the start

### Cons

- Weak native observability and backup ergonomics
- Poor fit for desktop import/export, restore verification, and cross-process/native control
- Forces the desktop product to keep browser storage ownership as its core data plane even after ADR-0011 explicitly moved the product toward a hybrid native app
- Makes queue/conflict and filesystem policy harder to verify
- Conflicts with the existing Tauri/SQLite evidence direction without actually retiring that evidence

## Option C - File-first JSON/documents as the primary local store

Desktop stores entity state in JSON files or document bundles and treats SQLite or IndexedDB as unnecessary complexity.

### Pros

- Fastest initial implementation
- Easy to inspect manually
- Natural fit for explicit export artifacts

### Cons

- Weak concurrency semantics
- Weak query/index/migration story
- Weak fit for append-only sync logs and conflict tracking
- Likely to re-create ad hoc repository logic already better modeled by SQLite + Repository v0
- Encourages mixing live storage with export/backup artifacts

## 4. Recommendation

Recommend Option A.

### Selected architecture direction

- Desktop primary store: SQLite, owned by the Tauri/Rust layer
- Encryption posture: keep the live path compatible with the existing SQLCipher direction, but do not let prior proof-of-concept packages substitute for the new ADR
- Shared contracts: keep `@repo/core-data` as the canonical TypeScript repository contract surface
- Browser boundary: Web keeps owning browser localStorage and IndexedDB; desktop imports from those stores but does not share them as a live system of record
- Export boundary: JSON/archive formats are for backup/export/import artifacts, not the live canonical store

### Why this fits the repo best

Option A matches the strongest current evidence without pretending the evidence already closed the Phase 3 decision. It uses the repo's existing shared contract work, keeps the Web/browser surfaces intact, and gives later rows the path they need for migrations, offline queue durability, reconnect sync, and restore verification.

## 5. Required ADR Contents

The build-phase ADR must not be a generic narrative. It must explicitly contain and decide the following.

### 5.1 Storage choice and live location

- Canonical live desktop entity store is SQLite
- Live file policy:
  - host-owned under `app.path().app_data_dir()`
  - not under `app_config_dir()`
  - not inside a user export directory
- Recommended initial filename policy:
  - `xai-local-first-v1.sqlite3` for the main store
  - separate backup/export artifacts, not in-place copies of the live path by default

### 5.2 Backup and export location policy

- Internal app-managed snapshots may live under an app-data sibling such as `app_data_dir()/backups/`
- User-visible exports must be explicit artifacts written to a user-chosen path
- Restore/import must flow through repository validation and must not replace the live DB by blind file copy

### 5.3 Repository interfaces

- `@repo/core-data` remains the canonical shared repository contract owner
- Desktop implementation rows may add or harden native driver surfaces beneath that contract, but must not invent parallel plugin-owned repository APIs
- Entity families in later rows should depend on stable package exports and repository interfaces, not cross-plugin internals

### 5.4 Migration and import boundary

- Browser Web data is a source for desktop import, not a shared live store
- Import path must be:
  - idempotent
  - observable
  - safely retryable
  - non-destructive to browser data by default
- Import coverage must address:
  - `@repo/plugin-web-storage` localStorage keys
  - browser IndexedDB-backed sync/cache data where applicable
- No background bidirectional sync between browser-local stores and desktop-local stores is implied by this ADR

### 5.5 Sync-log and queue model

- The future sync log should be append-only and durable in the same SQLite database as entity records
- Queue/outbox rows must be transactionally coupled to entity writes for `account-sync` records
- Stable mutation ids and commit-seq ordering should follow the existing `@repo/core-data` outbox precedent unless the ADR explicitly replaces it
- The ADR should specify that reconnect/cloud sync is downstream work; this row only freezes the data model and failure semantics

### 5.6 Conflict model

- No silent last-write-wins for sync conflicts
- `device-local` records never enter remote sync
- `account-sync` records may queue offline and reconcile later
- Conflicts must remain explicit and user/audit visible:
  - conflict marker state or equivalent
  - rollback/failure state distinct from success
- The ADR should state which layer owns conflict detection versus conflict presentation

### 5.7 Web/Desktop ownership boundary

- Web browser runtime continues to own:
  - `@repo/plugin-web-storage`
  - browser IndexedDB cache/sync runtime
  - browser-specific lock/unlock and storage events
- Desktop runtime continues to own:
  - native SQLite path and migrations
  - import/export filesystem actions
  - local-first queue durability
- Shared ownership is limited to contracts and types in stable shared packages such as `@repo/core-data`

## 6. Future Row Unlock Rules

After this ADR is accepted and shipped:

- `desktop-local-first-sqlite-foundation` may implement the selected live DB, migrations, test fixtures, and file policy, but may not reopen the engine decision
- `desktop-local-first-repository-bridge` may bridge tasks, board, habits, pomodoro, notes, pet basic state, and local settings through the chosen repository seam, but may not invent a new repository contract
- `desktop-local-first-web-data-migration` may implement import flows, but must honor one-way, idempotent, browser-safe migration rules
- `desktop-local-first-offline-edit-queue` may implement queue states and replay mechanics, but must honor the ADR's sync-log shape and explicit conflict semantics
- `desktop-local-first-sync-reconnect` may build reconnect behavior, but must not weaken the queue/conflict guarantees
- `desktop-local-first-backup-export-import` may implement export/archive UX, but must honor the live-path and validation boundaries
- `desktop-ai-offline-provider-policy` and `desktop-calendar-sync-degraded-mode` may assume the storage and ownership boundary, but they do not get to widen the data architecture themselves

## 7. Risks and Open Questions

### Risks

- The existing `core-data-sqlite-driver` evidence includes earlier review findings around transaction honesty and surface/document drift; Phase 3 implementation must not treat that row as production-complete authority
- Importing browser IndexedDB data may expose partial or stale states that were valid for browser fallback but not for desktop-first canonical storage
- A live SQLite choice without a clear export/archive boundary would blur backups and runtime state, making restore semantics unsafe
- If the ADR under-specifies `device-local` versus `account-sync`, later queue and reconnect rows will diverge

### Open questions for the later build-phase ADR draft

- Whether the live filename remains a versioned single-file DB or a versioned directory with auxiliary snapshot artifacts
- Whether SQLCipher is mandatory at first Phase 3 release or acceptable as a compatible-but-follow-up hardening path
- Whether automatic app-managed snapshots are part of the storage ADR or deferred entirely to `desktop-local-first-backup-export-import`

## 8. Recommendation Summary

No external web research is required for this row. The repo already contains enough authoritative evidence to make the architecture choice concrete.

Recommendation for the ADR draft:

- choose SQLite as the desktop primary store
- keep browser localStorage and IndexedDB browser-owned
- require one-way import into desktop rather than live shared storage
- keep `@repo/core-data` as the canonical shared repository contract
- define an append-only durable sync log with explicit conflict markers
- separate live DB location from backup/export artifacts
