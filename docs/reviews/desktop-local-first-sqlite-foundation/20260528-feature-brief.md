# Feature Brief - desktop-local-first-sqlite-foundation

> Date: 2026-05-28
> Executor: feature-plan (Codex, gpt-5.4 inline)
> Source: `docs/reviews/desktop-local-first-sqlite-foundation/20260528-roadmap-seed.md`
> Roadmap: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row `#10`

## Feature Title

Desktop Local-First SQLite Foundation

## Canonical Name

`desktop-local-first-sqlite-foundation`

## Naming Rationale

The roadmap row is already specific and correct: this slice owns the SQLite-backed local-first storage foundation only. It does not bridge business entities, migrate browser data, or implement sync/queue UX. The canonical name keeps that boundary explicit for downstream rows.

## Motivation

ADR-0012 is now accepted and shipped, but the current repo still stops short of a production-ready desktop local database foundation:

- `@repo/core-data` owns the shared `Repo<T>` / `RepoRecord` / `SyncScope` contract, but the current Tauri-backed repo seam is not fully migration-capable.
- `apps/desktop/src-tauri/src/commands/database.rs` proves a native SQLite command path and `app_data_dir` resolution, but it is still a generic record-table bridge, not a Phase 3 bootstrap/runtime foundation.
- `sqlcipher-local-db` proves a compatible Rust SQLCipher open path, but it is not yet the shipped Phase 3 runtime surface.

Row `#10` exists to turn those evidence seams into one approved desktop storage foundation that later rows can safely depend on.

## Target Outcome

Ship a reusable desktop database foundation that:

- keeps the live DB under the Tauri/Rust layer and under `app.path().app_data_dir()`
- bootstraps schema/migration execution deterministically
- exposes a typed repository/driver boundary through shared package seams rather than business-specific Tauri commands
- provides fixture/test harness support for Rust and TypeScript contract tests
- preserves browser-safe boundaries so Web/runtime packages do not gain direct Tauri dependencies

## In Scope

- live DB file naming/path policy under native app data
- migration/bootstrap runtime and migration metadata contract
- typed repository/driver boundary for desktop SQLite access
- host-owned native command/adapter seam refinements required to keep command handlers thin
- test fixtures/harness for Rust temp DBs and TypeScript contract coverage
- verification gates for Rust tests, TypeScript package tests, browser-safe Web build, and desktop app bundle build

## Out of Scope

- business entity bridging for tasks, board, habits, pomodoro, notes, pet, or local settings
- browser Web data import/migration flows
- offline edit queue, reconnect sync, conflict UI, backup/export/import UX
- AI offline provider policy or calendar degraded mode
- organizer/overlay/control/grid restoration or any other Phase 3 future UI revival
- any direct Tauri API usage from Web/plugin business code

## Hard Constraints

- ADR-0012 is authoritative. Do not reopen storage engine choice or live-path ownership.
- Keep business logic out of the Tauri host; expose typed repository boundaries instead.
- Preserve Web behavior and browser-safe package boundaries.
- Reuse the existing `@repo/core-data` seam unless repo evidence proves a new package is necessary.
- Keep the feature scoped to foundation work only so row `#11` `desktop-local-first-repository-bridge` still has a clean responsibility boundary.

## Dependency Hints

- Governing ADR: `docs/adr/0012-phase3-local-first-storage.md`
- Shared contract package: `packages/core-data/`
- Native DB evidence: `packages/sqlcipher-local-db/`
- Historical bridge/runtime evidence: `packages/core-data-sqlite-driver/`
- Tauri command owner: `apps/desktop/src-tauri/src/commands/database.rs`
- Config/live-path separation precedent: `apps/desktop/src-tauri/src/app_config.rs`

## Acceptance Signal

The desktop app has an approved implementation plan for a tested SQLite foundation with native live-file policy, migrations/bootstrap, typed repository seams, and fixture support, while leaving entity bridging, browser import, queue/sync, and backup UX to later rows.
