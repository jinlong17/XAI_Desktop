# desktop-phase3-integrated-rc-gate - Test Plan

## Validation Goals

- Confirm the shipped Phase 3 rows compose into one coherent desktop local-first RC verdict.
- Confirm repo-side readiness is backed by fresh executable evidence, not only shipped row status.
- Confirm manual/macOS-only steps are classified honestly rather than collapsed into repo-side PASS claims.
- Confirm notes is handled as an explicit contract-truth check, not a hidden unsupported gap.

## Contract Checks

- `packages/desktop-local-first-repository-bridge/docs/*`
  - local-first surface ownership and `notes = unsupported` remain the owning truth
- `packages/desktop-local-first-web-data-migration/docs/*`
  - import/scan truth and unsupported-notes handling remain the owning truth
- `packages/desktop-local-first-offline-edit-queue/docs/*`
  - queue-only versus device-local boundaries remain the owning truth
- `packages/desktop-local-first-sync-reconnect/docs/*`
  - reconnect preflight/replay truth remains the owning contract
- `packages/desktop-ai-offline-provider-policy/docs/*`
  - AI offline/degraded policy remains the owning truth
- `packages/desktop-calendar-sync-degraded-mode/docs/*`
  - calendar degraded/reconnect behavior remains the owning truth
- `packages/desktop-local-first-backup-export-import/docs/*`
  - backup/restore partial/corrupt/incompatible truth remains the owning contract

## Automated Baseline

Recommended integrated reruns before or alongside manual smoke:

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`
- `pnpm --filter @repo/plugin-web-storage test`
- `pnpm --filter @repo/plugin-web-storage check-types`
- `pnpm --filter @repo/plugin-web-tasks test`
- `pnpm --filter @repo/plugin-web-board-core test`
- `pnpm --filter @repo/plugin-web-board-core typecheck`
- `pnpm --filter @repo/plugin-web-board-workspaces test`
- `pnpm --filter @repo/plugin-web-board-workspaces typecheck`
- `pnpm --filter @repo/plugin-web-habits test`
- `pnpm --filter @repo/plugin-web-pomodoro test`
- `pnpm --filter @repo/plugin-web-pet test`
- `pnpm --filter @repo/plugin-web-settings-shell test`
- `pnpm --filter @repo/plugin-web-settings-shell typecheck`
- `pnpm --filter @repo/plugin-web-settings-rest test`
- `pnpm --filter @repo/plugin-web-settings-rest typecheck`
- `pnpm --filter @repo/plugin-web-ai-chat test`
- `pnpm --filter @repo/plugin-web-ai-chat typecheck`
- `pnpm --filter @repo/plugin-web-calendar test`
- `pnpm --filter @repo/plugin-web-calendar check-types`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web build`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Manual Integrated Matrix

### Offline local-first surfaces

- verify offline create/edit/relaunch for tasks
- verify offline create/edit/relaunch for board/workspaces
- verify offline create/edit/relaunch for habits
- verify offline create/edit/relaunch for pomodoro
- verify pet state survives offline relaunch
- verify settings writes survive offline relaunch
- verify notes remains explicitly unsupported or absent without misleading success copy

### Reconnect sync

- verify reconnect preflight states stay explicit:
  - network unavailable
  - account required
  - device required
  - transport unavailable
- verify successful replay clears only eligible queued mutations
- verify conflicts and retryable failures remain durable and visible

### Backup / restore

- verify managed backup/export can be created from the desktop runtime
- verify bundle result can distinguish:
  - full
  - partial
  - corrupt
  - incompatible
- verify restore applies only supported records and does not silently replay `sync.outbox` or `desktop.web_import_*`

### AI and calendar degraded behavior

- verify AI offline/unconfigured states fail closed and do not claim provider success
- verify calendar local UI remains usable while provider sync stays degraded/offline
- verify reconnect follow-up updates calendar provider state only after a real eligible reconnect path

## Cross-surface Interaction Checks

- import, reconnect, and backup helper surfaces coexist without leaking browser-only behavior into non-desktop runtime
- offline queue and reconnect semantics stay aligned after offline edits on task and board surfaces
- AI degraded copy and calendar degraded copy remain consistent with settings/integrations panes
- notes unsupported behavior does not break the other local-first surfaces or the final verdict structure

## Regression Policy

- If no repo-side defect reproduces, do not make code changes.
- If a repo-side defect reproduces, fix only the minimal owning surface and rerun:
  - the affected package gates
  - the integrated repo-side baseline
  - the affected manual matrix item if it is reproducible in the environment
- If existing runtime seams are insufficient for deterministic reporting, add only the smallest report/helper seam needed.

## Mock Strategy

- reuse shipped package tests and runtime seams before adding new mocks
- prefer real `AppProviders` desktop globals and existing package helpers over new integrated harnesses
- keep host-level tests limited to mount/gating behavior
- treat notes as a deterministic unsupported-surface assertion, not as a placeholder TODO

## Acceptance Rules

- every integrated Phase 3 surface is classified in the final report
- repo-side readiness is explicit and evidence-backed
- manual/macOS residuals are explicit and separate
- notes is explicitly classified and not silently omitted
- no unclassified integrated surface remains at the end of build/verify
