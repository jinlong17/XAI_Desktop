# Discovery Review - desktop-local-first-backup-export-import

> Feature: `desktop-local-first-backup-export-import`
> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5 inline)
> Research mode: internal repo evidence only
> External research: No external research required

## 1. Problem Framing

The storage ADR settled the high-risk rule already: backup/export/import must be a separate artifact workflow, not a second name for the live SQLite file. The repo now has enough shipped Phase 3 state that this matters in practice:

- row `#11` writes canonical local-first bridge records into the desktop repo namespace
- row `#12` writes browser-import ledger/run state in a separate import namespace
- row `#13` writes durable `sync.outbox` rows inside the shared bridge namespace
- row `#14` mutates those outbox rows with replay results and remote acknowledgement metadata
- row `#16` adds durable `calendar.provider_state` records

What is still missing is a recovery-safe bundle contract that answers:

1. which desktop records are actually restorable user data
2. which records are audit or sync-state and therefore unsafe to replay blindly
3. how verify-first import and post-restore verification should behave when the bundle is corrupt, incompatible, or only partially restorable

## 2. Repo Evidence

### 2.1 Governing ADR and path policy

- `docs/adr/0012-phase3-local-first-storage.md`
  - live DB path is under `app.path().app_data_dir()`
  - `app_config_dir()` remains config-only
  - backup/export artifact path must stay separate from the live DB path
  - restore/import must go through repository-level validation, not blind overwrite
  - app-managed snapshot strategy is explicitly deferred to this row
- `docs/reviews/desktop-local-first-storage-adr/20260528-discovery-review.md`
  - records the accepted app-data-sibling precedent such as `app_data_dir()/backups/`
- `packages/desktop-basic-macos-menu-config-store/docs/design.md`
  - confirms the repo already treats `app_config_dir()` as a separate config-only concern

### 2.2 Current live desktop data owners

- `packages/plugin-web-storage/src/internal/desktopRepoBridge.ts`
  - desktop bridge namespace is `xai-web-desktop-local-first-bridge`
  - representative canonical data already lands there:
    - `productivity.todo`
    - `productivity.habit`
    - `project.board`
    - `project.card`
    - `productivity.pomodoro_sessions`
    - `project.workspace_state`
    - `pet.state`
    - `settings.pref`
    - `calendar.provider_state`
- `packages/core-data/src/entities.ts`
  - defines the canonical record families above
- `packages/core-data/src/desktop-web-import.ts`
  - import ledger namespace is `xai-web-desktop-local-first-import`
  - `desktop.web_import_ledger` and `desktop.web_import_run` are durable audit/import coordination records
- `packages/core-data/src/sync-outbox.ts`
  - `sync.outbox` rows live in the same shared repo namespace as canonical bridge records
  - unresolved queue state includes retry, conflict, rollback, and synced audit metadata

### 2.3 Current desktop runtime exposure

- `apps/web/src/providers/AppProviders.tsx`
  - already mounts the desktop repository bridge
  - already exposes controlled globals for desktop import and reconnect runtime
- `packages/plugin-web-storage/src/internal/storage.ts`
  - already exports minimal controlled runtime entry points for rows `#12`, `#14`, and `#16`
  - this is the cleanest existing bridge seam if row `#17` needs the same style of support/debug entry point

### 2.4 What does not exist yet

- no current backup/export/import Tauri command family
- no current bundle schema or restore verifier
- no current partial-restore contract for `sync.outbox` or import-ledger state
- no existing user-facing backup UI beyond release/support docs mentioning the capability as expected future product behavior

## 3. Candidate Structures

### Option A - Repo-managed backup bundle with staged validation, explicit exclusions, and post-restore verification

Use one bundle format for both:

- app-managed backups written under an app-data backup directory
- explicit exports written to a user-provided path

Recommended shape:

- manifest with bundle version, creation time, runtime/source versions, warnings, and per-section counts/fingerprints
- restorable records section for representative canonical local-first records
- audit-only section for excluded state summaries such as unresolved `sync.outbox` and import-ledger presence

Restore model:

1. read bundle
2. validate schema/version/checksum and record shapes
3. stage supported records in a repo-validating path
4. produce a verification result before live apply
5. apply only supported record families transactionally to the live repo
6. re-scan live state and compare counts/fingerprints

Key rule:

- `sync.outbox` and `desktop.web_import_*` are not auto-restored into live state
- if they were present in the artifact, the result is explicit `partial`, not fake `full`

Pros:

- matches ADR-0012 exactly
- keeps restorable user data separate from risky sync/audit state
- gives a real answer for corrupt/incompatible/partial cases
- reuses the shipped repo seam instead of inventing a file-copy bypass
- fits the existing desktop runtime pattern of controlled bridge helpers

Cons:

- requires a new bundle manifest/verification layer
- forces a deliberate partial-restore contract when excluded state exists
- touches both shared `@repo/core-data` logic and native file I/O commands

### Option B - Raw SQLite file export and restore by copying `xai-repo-v0.db`

Export the live DB file directly and restore by replacing the on-disk DB.

Pros:

- smallest apparent implementation
- backup artifact is compact and mechanically simple

Cons:

- directly conflicts with ADR-0012
- bypasses repo-level validation entirely
- risks replaying stale `sync.outbox` rows and stale import ledgers blindly
- couples restore safety to SQLite internals instead of the shipped canonical record contract
- makes partial/incompatible semantics hard to express honestly

### Option C - Bundle every namespace and row family as fully restorable data, including `sync.outbox` and import ledger records

Export canonical records plus all queue and import audit rows, then restore them all back into live namespaces.

Pros:

- closest thing to a full-fidelity state clone without raw DB swap
- preserves more diagnostics than Option A

Cons:

- still too risky for this row because stale `sync.outbox` rehydration can duplicate or mis-sequence sync replay
- rehydrating `desktop.web_import_*` can corrupt row `#12` boundary/fingerprint truth
- undermines the acceptance requirement that failures stay visible and recoverable rather than silently replayed

## 4. Recommendation

Recommend Option A.

### Why Option A fits this repo

- It is the only option that keeps the storage ADR intact without inventing a second live-store path.
- It uses the current repo truth: canonical user data now lives in record families, while queue/import state is explicitly durable but operationally sensitive.
- It gives a conservative recovery story even when unresolved sync state exists: the user still gets a backup/export, but restore is clearly marked partial instead of pretending replay safety.
- It matches the minimal-bridge pattern already used for rows `#12`, `#14`, and `#16`.

## 5. Recommended Contract Split

### 5.1 Artifact location and ownership

- Managed backups live under `app.path().app_data_dir()/backups/` or an equivalent app-data sibling.
- They do not live in:
  - the live DB path
  - `app_config_dir()`
- Filesystem access remains host-owned in Tauri commands.

### 5.2 Restorable record scope

Restorable user-data section should include only representative canonical records from the desktop bridge namespace:

- `productivity.todo`
- `productivity.habit`
- `project.board`
- `project.card`
- `productivity.pomodoro_sessions`
- `project.workspace_state`
- `pet.state`
- `settings.pref`
- `calendar.provider_state`

Notes remain unsupported because row `#11` never created a canonical notes model.

### 5.3 Audit-only and excluded state

Do not auto-restore these into live state:

- `sync.outbox`
- `desktop.web_import_ledger`
- `desktop.web_import_run`

Recommended treatment:

- export their presence/counts/summary metadata in the bundle manifest or an audit section
- mark verification/import as `partial` when excluded state is present and cannot be reapplied safely
- never silently drop the warning

### 5.4 Verification-before-apply

Verification should happen before live mutation and return a typed result with at least:

- `verified_full`
- `verified_partial`
- `corrupt`
- `incompatible`
- `failed`

Validation checks should include:

- manifest/bundle version
- record JSON parseability
- `assertRepoRecord` and allowed entity-type matrix
- reserved outbox/id rules
- schema/runtime compatibility guardrails
- restoreable-vs-excluded row classification

### 5.5 Apply semantics

Recommended apply flow:

1. classify the bundle
2. reject `corrupt` and `incompatible`
3. apply only supported/restorable record families through repo transactions
4. leave live `sync.outbox` and import-ledger state untouched
5. run post-restore verification against the live repo
6. surface final status as:
   - `restored`
   - `restored_partial`
   - `failed`

That keeps row `#17` within recovery UX and validation scope without mutating queue/reconnect behavior from rows `#13` and `#14`.

## 6. Proposed Runtime Shape

### Shared data / validation layer

Put generic backup bundle types, classifiers, and restore verification helpers in `@repo/core-data`.

Likely responsibilities:

- bundle manifest types
- allowed restorable entity-type matrix
- excluded-state summary types
- deterministic fingerprint helpers
- pre-apply and post-apply verification helpers

### Native host layer

Put file I/O and backup-safe path ownership in Tauri command modules beside the existing database runtime.

Likely responsibilities:

- resolve managed backup directory
- write/read bundle files
- expose verify/import/apply command entry points
- keep command handlers thin over generic helpers

### Desktop runtime bridge

If a runtime entry point is needed, keep it minimal and parallel to existing row `#12/#14` helpers:

- `@repo/plugin-web-storage` exports a controlled desktop backup helper
- `AppProviders` mounts or exposes it only in `desktop-phase1-offline`
- no broad new app shell ownership or business logic in the host

## 7. Risks and Open Questions

### Risks

- `sync.outbox` lives in the same namespace as canonical bridge records, so restore code must classify by entity type, not by namespace only.
- A too-aggressive "full clone" design would undermine row `#13/#14` truthfulness and create replay hazards.
- A too-narrow bundle that excludes everything operational could produce backups that look safe but are not useful; representative record coverage must stay broad enough for the current desktop product.
- If build lets import apply before verification, corrupt or incompatible bundles could damage live state.

### Open questions for review/build

1. Should managed backup creation remain available when unresolved `sync.outbox` rows exist, with `partial-only` restore semantics, or should export be blocked in that situation?
2. Should the audit section keep only counts/warnings for excluded queue/import state, or also include non-restorable identifiers for support diagnostics?
3. Is a single command surface with optional `destinationPath` enough to cover both managed backup and explicit export, or should review require separate verbs?
4. Does this row need a lightweight UI hook immediately, or is a controlled desktop runtime/global handle enough for Phase 3 and the integrated RC gate?

## 8. Recommendation Summary

No external research is required. The repo already contains the necessary authorities and shipped seams.

Recommendation:

- use one repo-managed backup bundle format
- write managed backups under app-data backup storage, not the live DB path and not `app_config_dir()`
- restore only canonical representative local-first records through validation and transactionally applied repo paths
- treat `sync.outbox` and import-ledger state as explicit excluded/audit-only data for this row
- surface `corrupt`, `incompatible`, `partial`, and post-apply verification results as first-class outcomes
