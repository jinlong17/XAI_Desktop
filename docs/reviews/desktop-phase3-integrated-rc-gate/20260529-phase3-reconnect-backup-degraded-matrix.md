# Phase 3 - Reconnect, Backup, and Degraded Online-only Matrix

- Feature: `desktop-phase3-integrated-rc-gate` (row `#18`)
- Date: 2026-05-29
- Executor: `feature-auto-build (Codex gpt-5.3-codex inline)`
- Scope: reconnect sync, backup/export/import, AI provider degraded behavior, calendar degraded/reconnect behavior

## Evidence Inputs

- Phase 1 repo-side baseline: `docs/reviews/desktop-phase3-integrated-rc-gate/20260529-phase1-integrated-repo-baseline.md` (`25/25` command pass)
- Desktop runtime global contract wiring:
  - `__XAI_DESKTOP_RECONNECT_SYNC__` (`preflight`, `runOnce`, `reconcileCalendarProviders`)
  - `__XAI_DESKTOP_BACKUP__` (`create`, `verify`, `importBundle`, `getLastReport`)
  - Source: `apps/web/src/providers/AppProviders.tsx`
- Storage bridge exports for reconnect/backup/calendar helpers: `packages/plugin-web-storage/src/index.ts`
- Shipped dependency row docs used as contract references:
  - `packages/desktop-local-first-sync-reconnect/docs/dev_log.md`
  - `packages/desktop-local-first-backup-export-import/docs/dev_log.md`
  - `packages/desktop-ai-offline-provider-policy/docs/dev_log.md`
  - `packages/desktop-calendar-sync-degraded-mode/docs/dev_log.md`

## Surface Matrix

| Surface | Integrated Classification | Repo-side Evidence | Manual/macOS Residual |
|---|---|---|---|
| `reconnect_sync` | `PASS` | Runtime global contract exists in `AppProviders`; `pnpm --filter @repo/plugin-web-storage test` + `check-types` passed in Phase 1 baseline. | Real desktop offline->reconnect replay operator smoke is not executed in this run (`BLOCKED_ENVIRONMENT`). |
| `backup_restore` | `PASS` | Runtime global contract exists in `AppProviders`; backup helpers exported from `@repo/plugin-web-storage`; baseline storage tests/typechecks passed. | Real desktop backup artifact generation/import interaction smoke is not executed in this run (`BLOCKED_ENVIRONMENT`). |
| `ai_provider_policy` | `PASS` | `pnpm --filter @repo/plugin-web-ai-chat test` + `typecheck` passed; `pnpm --filter @repo/plugin-web-settings-rest test` + `typecheck` passed; row #15 contract remains shipped. | Real desktop online/offline provider switching smoke is not executed in this run (`BLOCKED_ENVIRONMENT`). |
| `calendar_degraded_mode` | `PASS` | `pnpm --filter @repo/plugin-web-calendar test` + `check-types` passed; reconnect-calendar helper is wired via runtime global contract. | Real desktop provider reconnect and degraded-mode interaction smoke is not executed in this run (`BLOCKED_ENVIRONMENT`). |

## Phase 3 Verdict

- Integrated reconnect/backup/degraded matrix verdict: `PASS` for repo-side contracts and automated baselines.
- Manual real-macOS and operator-driven reconnect/backup execution remains explicit external residual (`BLOCKED_ENVIRONMENT`) and is not claimed as passed in this run.
