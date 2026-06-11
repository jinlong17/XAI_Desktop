# desktop-phase3-integrated-rc-gate - API / Contract Notes

## Contract Summary

This row does not define a new business API. It defines the integrated Phase 3 RC evidence contract, surface-classification rules, and the separation between repo-side readiness and manual/macOS residuals.

Primary contracts:

- integrated repo-side baseline contract
- offline local-first surface matrix contract
- reconnect/backup/degraded-surface matrix contract
- final integrated verdict contract

## Upstream Interfaces

### Dependency-row truth contract

This row consumes shipped truth from:

- `desktop-local-first-sqlite-foundation`
- `desktop-local-first-repository-bridge`
- `desktop-local-first-web-data-migration`
- `desktop-local-first-offline-edit-queue`
- `desktop-local-first-sync-reconnect`
- `desktop-ai-offline-provider-policy`
- `desktop-calendar-sync-degraded-mode`
- `desktop-local-first-backup-export-import`

It must not redefine those implementation contracts. It only composes their readiness and residuals into one integrated gate.

### Active runtime seam contract

Current desktop runtime helpers already exist under:

- `__XAI_DESKTOP_WEB_IMPORT__`
- `__XAI_DESKTOP_RECONNECT_SYNC__`
- `__XAI_DESKTOP_BACKUP__`

Source of truth:

- `apps/web/src/providers/AppProviders.tsx`
- `packages/plugin-web-storage/src/index.ts`

This row may consume or lightly document those seams. It should not create a second parallel runtime contract unless a narrow evidence helper is unavoidable.

### Notes unsupported contract

`packages/core-data/src/desktop-bridge.ts` exports `NOTES_UNSUPPORTED_ERROR`.

Required semantics:

- this row must not convert notes into a fake supported surface
- the final integrated report must classify notes explicitly
- a notes classification of `DEFERRED_OUT_OF_SCOPE` is acceptable and expected under current repo truth

## Downstream Outputs

### Integrated surface classification contract

Recommended integrated matrix types:

```ts
type DesktopPhase3IntegratedSurface =
  | "tasks"
  | "board"
  | "habits"
  | "pomodoro"
  | "notes"
  | "pet"
  | "settings"
  | "reconnect_sync"
  | "backup_restore"
  | "ai_provider_policy"
  | "calendar_degraded_mode";

type DesktopPhase3RcClassification =
  | "PASS"
  | "BLOCKED_REPO"
  | "BLOCKED_ENVIRONMENT"
  | "DEFERRED_OUT_OF_SCOPE";
```

Recommended report fields:

- `surface`
- `classification`
- `evidencePath`
- `repoNote`
- `environmentNote`
- `rerunRequired`

### Final report contract

The final integrated report must include:

- repo-side readiness summary
- one row per integrated surface
- notes contract-truth section
- cross-surface interaction notes
- manual/macOS residuals section

## Error Semantics

- If a shipped Phase 3 contract regresses in reproducible repo-side behavior, classify the owning surface as `BLOCKED_REPO`.
- If required real-macOS or operator-driven execution cannot be run or trusted, classify the surface as `BLOCKED_ENVIRONMENT`.
- If notes remains unsupported exactly as frozen upstream, classify it explicitly rather than omitting it.
- No integrated surface should be left unclassified in the final report.

## Permission Notes

- No new Tauri capability widening belongs to this row by default.
- No new plugin manifests or module registrations belong to this row.
- Any narrow helper added during build must stay desktop-only, report-oriented, and scoped to evidence generation.

## Idempotency Notes

- Re-running the repo-side baseline without code changes should yield the same readiness summary.
- Re-running the integrated report flow should preserve surface classifications unless code or environment changed.
- If a repo-side blocker fix is applied, the affected surface and the repo-side baseline should be rerun before the final verdict is updated.
