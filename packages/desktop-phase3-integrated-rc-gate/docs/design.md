# desktop-phase3-integrated-rc-gate - Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A - dedicated integrated Phase 3 RC gate with split repo-side and manual/macOS evidence planes |
| Review Doc Path | `docs/reviews/desktop-phase3-integrated-rc-gate/20260529-discovery-review.md` |
| Review Date/Version | 2026-05-29 |
| Feature Type | P1 Phase 3 integrated RC evidence and residual-risk gate |

## Frozen Assumptions

- Rows `#10` through `#17` are the implementation baseline for this row and are not reopened as planning targets here.
- This row is an integrated evidence/report gate, not a new implementation slice.
- The active product remains the wrapped `apps/web` runtime under Tauri on branch `dev`.
- Repo-side readiness and real-macOS/manual readiness must be reported separately.
- Minimal helper or report harness work is allowed only if existing seams are insufficient to produce deterministic evidence.
- Notes remains explicitly unsupported under row `#11` contract truth unless a separate future feature changes that decision.
- `ship` is outside this plan run; the row stops at READY_TO_SHIP evidence.

## Dependency Overview

- Roadmap and row authority:
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
  - `docs/reviews/desktop-phase3-integrated-rc-gate/20260528-roadmap-seed.md`
- Shipped Phase 3 dependency rows:
  - `packages/desktop-local-first-sqlite-foundation/docs/dev_log.md`
  - `packages/desktop-local-first-repository-bridge/docs/dev_log.md`
  - `packages/desktop-local-first-web-data-migration/docs/dev_log.md`
  - `packages/desktop-local-first-offline-edit-queue/docs/dev_log.md`
  - `packages/desktop-local-first-sync-reconnect/docs/dev_log.md`
  - `packages/desktop-ai-offline-provider-policy/docs/dev_log.md`
  - `packages/desktop-calendar-sync-degraded-mode/docs/dev_log.md`
  - `packages/desktop-local-first-backup-export-import/docs/dev_log.md`
- Active runtime seams:
  - `apps/web/src/providers/AppProviders.tsx`
  - `packages/plugin-web-storage/src/index.ts`
  - `packages/core-data/src/index.ts`
  - `packages/core-data/src/desktop-bridge.ts`

## Gate Shape

- One integrated row owns the composed Phase 3 RC gate for these surfaces:
  - `tasks`
  - `board`
  - `habits`
  - `pomodoro`
  - `notes`
  - `pet`
  - `settings`
  - `reconnect_sync`
  - `backup_restore`
  - `ai_provider_policy`
  - `calendar_degraded_mode`
- Each surface must end with one explicit classification:
  - `PASS`
  - `BLOCKED_REPO`
  - `BLOCKED_ENVIRONMENT`
  - `DEFERRED_OUT_OF_SCOPE`
- Notes is expected to use `DEFERRED_OUT_OF_SCOPE` unless the reviewer explicitly reopens implementation scope elsewhere.

## Evidence Shape

Preferred outputs under `docs/reviews/desktop-phase3-integrated-rc-gate/` during build/verify:

- `20260529-phase1-integrated-repo-baseline.md`
- `20260529-phase2-offline-local-first-matrix.md`
- `20260529-phase3-reconnect-backup-degraded-matrix.md`
- `20260529-phase4-integrated-rc-verdict.md`

The final verdict artifact should include:

- repo-side readiness summary
- one row per integrated surface with evidence reference and classification
- notes contract-truth section
- cross-surface interaction notes
- explicit manual/macOS residual section

## Implementation Phases

### Phase 1 - Integrated repo-side baseline and dependency ledger

- confirm rows `#10` through `#17` still point to the same shipped contracts
- rerun the canonical package/web/rust/desktop baseline
- snapshot which evidence is freshly rerun versus inherited from shipped rows

### Phase 2 - Offline local-first surface matrix

- exercise or document offline create/edit/relaunch behavior for:
  - tasks
  - board
  - habits
  - pomodoro
  - pet
  - settings
- verify notes remains explicitly unsupported and truthful
- keep any manual/macOS-only proof separate from repo-side evidence

### Phase 3 - Reconnect, backup, and degraded online-only matrix

- exercise or document reconnect sync smoke
- exercise or document backup/export/import smoke
- verify AI provider offline/degraded behavior
- verify calendar degraded/reconnect behavior
- keep these surfaces tied to their shipped runtime seams rather than inventing new ownership

### Phase 4 - Final integrated RC verdict

- publish one integrated Phase 3 RC report with:
  - all surface classifications
  - repo-side readiness summary
  - notes contract-truth classification
  - cross-surface interaction notes
  - manual/macOS residuals and next-step recommendation

## Explicit Deferrals

- no new notes implementation
- no new local-first feature expansion for the shipped surfaces
- no organizer/overlay/control-window/grid restoration
- no silent conversion of manual/macOS residuals into repo-side PASS claims
