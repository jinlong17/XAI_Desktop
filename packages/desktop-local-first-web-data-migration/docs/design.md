# desktop-local-first-web-data-migration - Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option B + Option 2: first-run eligibility scan plus explicit import execution, backed by per-surface canonical projections, source fingerprinting, and a dedicated import ledger for transactional safe-retry behavior. |
| Review Doc Path | `docs/reviews/desktop-local-first-web-data-migration/20260529-discovery-review.md` |
| Review Date/Version | 2026-05-29 |
| Feature Type | P1 Phase 3 browser-to-desktop data migration row |
| Governing ADR | `docs/adr/0012-phase3-local-first-storage.md` |

## Frozen Assumptions

- The current desktop product is still the wrapped `apps/web` runtime under `desktop-phase1-offline`.
- Row `#11` canonical repo targets are authoritative for representative import coverage.
- Browser source data stays browser-owned and non-destructively readable after import.
- This row guarantees safe retryability, not full backup/export/restore UX.
- Browser-owned IndexedDB stores (`web-encrypted-cache`, `xai-web-ai-secrets`, `xai-web-auth`) are observed and reported but not imported.
- Notes remain unsupported unless review proves a canonical active note owner.
- Settings import should act on materially present source keys, not synthesize full-registry defaults as destructive resets.

## Dependency Overview

- Shipped repo target owner:
  - `packages/desktop-local-first-repository-bridge/`
  - `packages/plugin-web-storage/src/internal/desktopRepoBridge.ts`
- Shared generic contract owner:
  - `packages/core-data/`
- Runtime trigger/mount only:
  - `apps/web/src/providers/AppProviders.tsx`
- Representative source owners:
  - `packages/xai-web-tasks/`
  - `packages/xai-web-habits/`
  - `packages/plugin-web-pomodoro/`
  - `packages/plugin-web-board-core/`
  - `packages/plugin-web-board-workspaces/`
  - `packages/xai-web-pet/`
  - `packages/plugin-web-storage/`
- Browser-owned IndexedDB evidence:
  - `packages/web-auth-device-session/`
  - `packages/plugin-web-ai-chat/`
  - `packages/core-data/src/indexeddb-sync-blob.ts`

## Boundary Decision

- Keep `packages/desktop-local-first-web-data-migration/` as the workflow/docs anchor only.
- Reuse row `#11` canonical mapping logic instead of inventing a second browser-to-repo transform path.
- Put generic import ledger, fingerprint, and reconciliation helpers in `@repo/core-data` if shared types are needed.
- Keep browser storage reads and per-surface import orchestration in `@repo/plugin-web-storage` or the owning active packages.
- Use `AppProviders` only to trigger first-run scan/mount behavior; do not let it own import business rules.

## Required Runtime Outcome

- Desktop first-run can detect eligible browser data without mutating anything.
- Explicit import can reconcile representative browser data into the local-first store using row `#11` canonical targets.
- Rerunning against unchanged source is a no-op.
- Rerunning against changed source updates only the affected imported surface records.
- Corrupt or skipped surfaces remain observable and do not destroy browser or desktop data.
- Browser-owned IndexedDB auth/cache/secret stores remain untouched.

## Import Model

### Trigger modes

- `first-run-scan`
  - desktop runtime only
  - computes eligibility and warnings
  - no writes
- `explicit-import`
  - desktop runtime only
  - performs writes after user action
  - supports retry and changed-source reruns

### Reconciliation model

- normalize browser source into canonical row `#11` projections
- compute stable per-surface fingerprints
- compare against last successful import state for the same boundary key
- reconcile inside a transaction:
  - upsert current projection rows
  - delete only previously imported row ids for that surface that are now absent
- record per-surface result plus run summary in an import ledger namespace

## Representative Coverage

- tasks -> `productivity.todo`
- habits -> `productivity.habit`
- pomodoro -> `productivity.pomodoro_sessions`
- boards/cards -> `project.board` + `project.card`
- board auxiliary -> `project.workspace_state`
- pet basic state -> `pet.state`
- settings -> `settings.pref`
- notes -> unsupported

## IndexedDB Treatment

- `web-encrypted-cache`: skip and report `browser_owned_store`
- `xai-web-ai-secrets`: skip and report `browser_owned_store`
- `xai-web-auth`: skip and report `browser_owned_store`

This keeps row `#12` from mutating browser auth/cache/secret behavior and avoids absorbing row `#13` / `#14` / `#17` responsibilities.

## Build Phases

### Phase 1 - Import ledger and scan contract

- define import-run state, per-surface fingerprints, and boundary-key rules
- add read-only first-run eligibility scan
- freeze skipped-store reporting for browser-owned IndexedDB

### Phase 2 - Representative projection reconcile

- implement transactional reconcile for tasks, habits, pomodoro, boards/cards, board auxiliary state, pet, and settings
- ensure unchanged-source reruns do not rewrite timestamps
- ensure corrupt-source paths do not delete prior good desktop records

### Phase 3 - Trigger wiring and observability

- mount first-run scan in desktop runtime
- add explicit import consumer entry point
- surface run summary, skipped-store reasons, and boundary conflicts

### Phase 4 - Verification and scope audit

- rerun targeted package/web/desktop gates
- audit that no queue/sync/reconnect/backup/note scope leaked in
