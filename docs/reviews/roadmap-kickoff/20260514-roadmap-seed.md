# Roadmap Seed — roadmap-kickoff

> sync-v1 roadmap · feature #1 · wave W0 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-05 (companion to T-01..T-20)
> Status hint: PENDING

## Requirement
Scaffold the two net-new packages Sync lives in — `packages/plugin-account/` (manifest + `src/index.ts` barrel + `src/types.ts`) and `packages/core-data/` — plus the shared infra every wave-0 row edits: `account:*` keys in the `EventMap`, a `useTauriInvoke`-style core hook, the Rust `AppError` thiserror enum with `E3xxx` sync codes, PLUGIN_MAP rows (status `Planned`), and static plugin registration in `main.tsx`. This unblocks all other rows.

## Hard constraints
- Target the **current `@repo/core` subpath layout** (no `core-events`/`core-data`/`core-registry` split) — codebase-orientation §4 reconciliation; `core-data` is a genuinely new package regardless.
- `account:*` events follow the strict lifecycle: add typed key to `EventMap` → declare in `manifest.json` `events.emit/listen` → only then use (codebase-orientation §3).
- Red line #1/#8: all business logic in `packages/plugin-*/` (+ data in `core-data/`); Host gets zero sync logic. Red line #4: plugins must not import `@tauri-apps/api` directly — the new `useTauriInvoke` core hook wraps it.
- Code boundary: `packages/plugin-account/`, `packages/core-data/`, `packages/core/src/{types/events.ts,hooks/}`, `apps/desktop/src-tauri/src/` (AppError), `apps/desktop/src/main.tsx` per codebase-orientation §6.

## Threat model binding
- T6 (malicious plugin / same-process): establishes the `crypto_*` capability-allowlist + KeyVault opaque-handle architecture foundation (FR-SY-75) all later crypto rows depend on.
- STRIDE Elevation-of-Privilege: scaffolds the trust-boundary structure (TB-3 JS↔IPC) that downstream features harden.

## Acceptance signal
Both packages build and register; `account:*` keys type-check in `emitEvent`/`useEventListener`; Rust `AppError` E3xxx enum compiles; PLUGIN_MAP shows `account`/`@repo/core-data` as `Planned`; every wave-0 row can be started.

## Dependencies (advisory — manifest is authoritative)
Depends On: — (foundational; unblocks all)
