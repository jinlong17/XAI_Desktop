# Discovery Review - desktop-local-first-sqlite-foundation

> Feature: `desktop-local-first-sqlite-foundation`
> Date: 2026-05-28
> Executor: feature-plan (Codex, gpt-5.4 inline)
> Research mode: internal repo evidence only
> External research: No external research required

## 1. Problem Framing

ADR-0012 already froze the architecture choice:

- desktop live store = SQLite under the Tauri/Rust layer
- live path = `app.path().app_data_dir()`
- shared contract owner = `@repo/core-data`
- browser localStorage / IndexedDB remain browser-owned
- business entity bridging, browser import, queue/reconnect, conflict UI, and backup UX are downstream rows

The remaining gap is implementation shape. Today the repo has useful but incomplete evidence:

- `packages/core-data/src/types.ts` already defines `Repo<T>`, `RepoRecord`, `SyncScope`, migration metadata, and transaction semantics.
- `packages/core-data/src/tauri-sqlite.ts` already exposes a Tauri-backed repo seam, but `migrate()` still throws and the surface still carries historical honesty risk from the earlier `core-data-sqlite-driver` review.
- `apps/desktop/src-tauri/src/commands/database.rs` already resolves `app_data_dir`, owns a shared connection, validates namespace/id input, and exposes `db_*` commands, but it still lacks a real Phase 3 migration/bootstrap runtime.
- `packages/sqlcipher-local-db` already proves a Rust SQLCipher-capable open path, but it is not yet integrated as the canonical Phase 3 live DB runtime surface.
- `apps/desktop/src-tauri/src/app_config.rs` already uses `app_config_dir()` for host config, which is the correct precedent for keeping config storage separate from Phase 3 live entity storage.

This row therefore needs a plan that hardens existing seams without duplicating contract ownership or pushing business logic into the host.

## 2. Repo Evidence

### 2.1 ADR authority

- `docs/adr/0012-phase3-local-first-storage.md`
  - freezes SQLite as desktop primary store
  - freezes `app_data_dir()` as the live path owner
  - freezes `@repo/core-data` seam inheritance
  - defers backup/export UX, browser import, queue, reconnect, and conflict UI

### 2.2 Shared package evidence

- `packages/core-data/src/types.ts`
  - already defines `Repo<T>`, `RepoTransaction<T>`, `MigrationPlan`, `MigrationResult`, and `RepoMetadata`
- `packages/core-data/src/sqlite.ts`
  - already defines a generic `SqliteDriver` and `createSqliteRepo()` with real `migrate(plan)` semantics for non-Tauri drivers
- `packages/core-data/src/tauri-sqlite.ts`
  - already wraps `db_*` commands but still throws on `migrate()`
- `packages/core-data/src/testing.ts`
  - already provides in-memory repo + in-memory sqlite driver patterns that should be extended rather than replaced
- `packages/core-data/tests/repository-contract.ts`
  - is the current contract truth that a desktop-backed repo seam should satisfy

### 2.3 Native runtime evidence

- `apps/desktop/src-tauri/src/commands/database.rs`
  - resolves the DB path under `app_data_dir()`
  - validates namespace/id input
  - supports atomic `db_put_batch`
  - still uses a single generic table and does not yet own a migration registry/bootstrap contract
- `apps/desktop/src-tauri/src/lib.rs`
  - already keeps Tauri command registration inside the host shell, which is the correct ownership boundary
- `apps/desktop/src-tauri/Cargo.toml`
  - already ships `rusqlite` with `bundled-sqlcipher` behind the `crypto` feature, so the runtime is compatible with the existing SQLCipher evidence path

### 2.4 Historical review evidence

- `docs/workflow/roadmap/codex-reviews/core-data-sqlite-driver/output.md`
  - earlier review called out two issues that still matter here:
    - the desktop repo seam must be honest about `transaction()` / `migrate()`
    - docs and runtime surface must stay aligned exactly

### 2.5 Workspace pattern evidence

- Workflow rows like `packages/desktop-local-first-storage-adr/` use a docs-only package anchor when the runtime work spans multiple real code owners.
- Shared reusable data contracts live in `packages/core-data/`.
- Native DB/runtime code lives in `apps/desktop/src-tauri/src/commands/` plus host-owned Rust modules.

That pattern argues against creating a second long-lived runtime package for this row.

## 3. Candidate Implementation Structures

### Option A - Reuse and harden `@repo/core-data` plus the existing Tauri `db_*` seam

Keep this row's workflow/docs owner at `packages/desktop-local-first-sqlite-foundation/`, but land runtime work in the existing code owners:

- `packages/core-data/`
  - desktop driver/repo contract hardening
  - explicit desktop-only export surface if needed
  - fixture/test helpers
- `apps/desktop/src-tauri/src/commands/database.rs`
  - thin Tauri command layer
- a new small host-owned Rust runtime module if needed
  - path resolution
  - connection bootstrap
  - migration registry/execution
  - fixture/test helpers

Pros:

- matches ADR-0012 seam ownership directly
- avoids inventing a parallel repository contract or redundant runtime package
- reuses the current contract tests and in-memory driver patterns
- keeps native file ownership inside the host, where it already belongs
- minimizes churn for the next row `desktop-local-first-repository-bridge`

Cons:

- requires careful hardening of existing seams instead of greenfield code
- may need a small export cleanup in `@repo/core-data` so desktop helpers stay obviously browser-safe

### Option B - Create a new runtime package such as `@repo/desktop-local-db`

Create a new package to own Tauri/SQLite/migration helpers and keep `@repo/core-data` contract-only.

Pros:

- isolates desktop-native concerns into one package
- can make browser-safe vs desktop-only boundaries more explicit

Cons:

- duplicates ownership that `@repo/core-data` already partially carries
- adds one more package boundary for the next bridge row to learn
- risks drifting into a parallel contract surface unless tightly controlled
- repo evidence does not show a current need for this extra layer

### Option C - Keep the foundation mainly in Rust and expose per-purpose Tauri commands

Treat the desktop foundation as a host/Rust concern and expose command-oriented APIs, deferring most repository concerns out of TypeScript.

Pros:

- keeps native durability logic in Rust
- avoids TypeScript driver work in the short term

Cons:

- pushes later entity rows toward host-owned business APIs
- conflicts with ADR-0012's requirement to preserve typed repository boundaries
- increases risk of per-entity command sprawl and Web/Desktop contract divergence

## 4. Recommendation

Recommend Option A.

### Why Option A fits this repo

It is the only option that matches all current evidence simultaneously:

- ADR-0012 keeps `@repo/core-data` as the contract owner
- the repo already has Tauri `db_*` command ownership inside the host
- the repo already has testing seams for `Repo<T>` and sqlite drivers
- the workflow already uses docs-only package anchors for rows that span multiple runtime owners

A new package boundary would mostly rewrap existing seams, while a Rust-only command model would weaken the typed repository contract that downstream rows need.

### Recommended boundary split

- Workflow/docs owner:
  - `packages/desktop-local-first-sqlite-foundation/`
- Shared contract + TS client owner:
  - `packages/core-data/`
- Native runtime owner:
  - `apps/desktop/src-tauri/src/commands/database.rs`
  - plus a small host-owned Rust internal module if needed for runtime extraction

## 5. Planned Runtime Direction

### 5.1 Live DB policy

- keep the live DB under `app.path().app_data_dir()`
- do not reuse `app_config_dir()`; that remains for host config only
- choose one canonical filename/version policy in this row and keep backup/export artifacts out of the same live path

### 5.2 Migration/bootstrap direction

- the native runtime should own migration registry execution during bootstrap
- `db_init` should become an honest bootstrap entrypoint that returns enough metadata for the TS side to report driver/path/schema state
- the shared repo seam must stop advertising `migrate()` if it cannot perform it, or it must wire migration execution honestly through the native bootstrap path

### 5.3 Typed repository boundary

- keep later business rows consuming `Repo<T>`-shaped seams from `@repo/core-data`
- avoid per-entity Tauri commands in this row
- if the current root exports are too broad, add an explicit desktop-oriented export/subpath rather than a new package

### 5.4 Fixture/test harness direction

- Rust:
  - temp DB path helpers
  - migration bootstrap smoke tests
  - reopened-DB persistence tests
  - invalid/mid-flight migration failure coverage
- TypeScript:
  - repo contract coverage against the desktop-backed seam
  - fake invoke / desktop driver fixtures
  - migration metadata assertions
  - browser-safe import checks for desktop-only exports

## 6. Risks

- If the build phase keeps `createTauriRepo()` contract-incomplete, row `#11` will build on a dishonest foundation.
- If the live-path policy is vague, backup/export/import work will later blur live state with artifacts.
- If desktop helpers stay mixed into Web-facing entrypoints without an explicit contract story, browser-safe boundaries will regress quietly.
- If migration bootstrap is bolted directly into command handlers without a small runtime owner, the host command layer will become hard to test.

## 7. Open Questions Resolved for Build

- Storage engine choice: resolved by ADR-0012; do not reopen.
- New runtime package boundary: not recommended.
- Host/business ownership: the host may own only generic DB runtime/bootstrap seams, never entity logic.
- Browser ownership: preserved; this row does not implement browser import or background synchronization.

## 8. Build Guidance

The build worker should treat this row as foundation-only and stop short of all downstream work:

- yes: live DB policy, migrations/bootstrap, typed repo boundary, fixtures, verification
- no: entity bridge, browser import, queue/reconnect, conflict UI, backup/export UX, overlay/control/grid revival
