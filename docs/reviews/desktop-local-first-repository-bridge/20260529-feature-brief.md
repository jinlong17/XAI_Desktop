# Feature Brief - desktop-local-first-repository-bridge

> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5.3-codex inline)
> Source: `docs/reviews/desktop-local-first-repository-bridge/20260528-roadmap-seed.md`
> Roadmap: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row `#11`

## Feature Title

Desktop Local-First Repository Bridge

## Canonical Name

`desktop-local-first-repository-bridge`

## Naming Rationale

The roadmap slug already matches the real responsibility boundary: this row does not choose storage, build migrations, import browser data, queue offline edits, reconnect sync, or ship backup UX. It only bridges the desktop local-first repository seam into the current offline entity surfaces.

## Motivation

Row `#10` shipped the SQLite foundation and ADR-0012 already froze the storage rules, but the current desktop product still reads and writes its active entity surfaces through browser-owned storage:

- tasks use `xai_task_cols`
- habits use `xai_habits_state`
- pomodoro uses `xai_pomodoro_sessions`
- board/workspaces use `xai_boards_v2`, `xai_active_board`, `xai_board_panels`, `xai_board_inbox`, and `xai_board_view_by_id`
- pet basic state uses `xai_pet_id` and `xai_pet_pos`
- local settings use `PREF_REGISTRY` plus the `xai_pref_*` family

The wrapped desktop app is `apps/web` running under the `desktop-phase1-offline` profile, so this row must bridge the active web surfaces into the shipped desktop repository without breaking browser behavior or silently doing the migration work reserved for row `#12`.

## Target Outcome

Ship an approved implementation plan that:

- adds desktop-only repository bridge behavior to the active `apps/web` entity surfaces
- keeps browser Web storage behavior intact for browser runtime and for desktop fallback paths
- reuses the shipped `@repo/core-data` typed repository seam and foundation bootstrap
- defines explicit fallback behavior when a desktop repo surface is missing, empty, or unsupported
- leaves browser data migration/import, queue/sync, reconnect, and backup UX to later rows

## In Scope

- tasks repository bridge behavior
- board/workspaces repository bridge behavior
- habits repository bridge behavior
- pomodoro repository bridge behavior
- pet basic state repository bridge behavior
- local settings repository bridge behavior
- shared entity-contract normalization required to make those bridges typed and honest
- desktop runtime activation rules and verification gates

## Out of Scope

- browser localStorage or IndexedDB data migration/import from existing user data
- offline edit queue or sync-log staging
- reconnect sync
- backup/export/import UX or snapshot policy
- overlay/control/grid revival or organizer restoration
- inventing a new parallel repository contract outside `@repo/core-data`
- reviving non-active desktop UI surfaces as the primary implementation target

## Hard Constraints

- Depend on the shipped `desktop-local-first-sqlite-foundation` row and ADR-0012.
- Do not directly import plugin internals across package boundaries.
- Preserve browser Web storage behavior while adding desktop local-first behavior.
- Keep the active product line anchored to the `apps/web` module graph under Tauri, not the older deferred overlay product.
- Do not treat browser storage fallback as completed migration/import work; row `#12` still owns migration.
- Be explicit about unsupported or missing surfaces, especially notes.

## Dependency Hints

- Governing ADR: `docs/adr/0012-phase3-local-first-storage.md`
- Shipped foundation: `packages/desktop-local-first-sqlite-foundation/docs/dev_log.md`
- Shared repo seam: `packages/core-data/`
- Active runtime profile seam: `packages/core/src/utils/runtime-profile.ts`
- Active host mount: `apps/web/src/providers/AppProviders.tsx`
- Active shell registrations: `apps/web/src/routes/modules/shellRegistrations.tsx`
- Stable active entity packages:
  - `packages/xai-web-tasks/`
  - `packages/xai-web-habits/`
  - `packages/plugin-web-pomodoro/`
  - `packages/plugin-web-board-workspaces/`
  - `packages/xai-web-pet/`
  - `packages/plugin-web-storage/`
  - `packages/plugin-web-settings-shell/`
  - `packages/plugin-web-settings-rest/`

## Acceptance Signal

The named desktop-facing entity families have an approved phased bridge plan with typed repository mappings, desktop runtime gating, browser-fallback rules, unsupported-surface handling for notes, and verification gates across `@repo/core-data`, active web packages, browser-safe web build, and the desktop Tauri app bundle.
