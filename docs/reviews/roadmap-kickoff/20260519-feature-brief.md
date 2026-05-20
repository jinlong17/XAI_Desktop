# Feature Brief — roadmap-kickoff

> Imported from out-of-repo roadmap seed (`/Users/lijinlong/.claude/jobs/2a941912/ctx/roadmap-seed.md`)
> on 2026-05-19 and adopted as the canonical Step-0 brief for this feature.
> sync-v1 roadmap · feature #1 · wave W0 · Phase 0.3 · Source PRD
> `docs/planning/sub-prds/sync/PRD.md` v0.6-DRAFT · dev-plan T-05.

## Requirement

Scaffold the two net-new packages Sync lives in — `packages/plugin-account/`
(manifest + `src/index.ts` barrel + `src/types.ts`) and `packages/core-data/` —
plus the shared infra every wave-0 row edits: `account:*` keys in the `EventMap`,
a `useTauriInvoke`-style core hook, the Rust `AppError` thiserror enum with
`E3xxx` sync codes, PLUGIN_MAP rows (status `Planned`), and static plugin
registration in `main.tsx`. This unblocks all other rows.

## Hard constraints

- Target the current `@repo/core` subpath layout (no `core-events`/`core-data`/
  `core-registry` split). `core-data` is a genuinely new top-level package
  `packages/core-data/` (`@repo/core-data`) regardless.
- `account:*` events follow the strict lifecycle: add typed key to `EventMap` →
  declare in `manifest.json` `events.emit/listen` → only then use.
- Red line #1/#8: all business logic in `packages/plugin-*/` (+ data in
  `core-data/`); Host gets zero sync logic. Red line #4: plugins must not import
  `@tauri-apps/api` directly — the new `useTauriInvoke` core hook wraps it.
- Code boundary: `packages/plugin-account/`, `packages/core-data/`,
  `packages/core/src/{types/events.ts,hooks/}`, `apps/desktop/src-tauri/src/`
  (AppError), `apps/desktop/src/main.tsx`, `docs/PLUGIN_MAP.md`, and the new
  `packages/roadmap-kickoff/docs/` workflow docs.

## Threat model binding

- T6 (malicious plugin / same-process): establishes the `crypto_*`
  capability-allowlist + KeyVault opaque-handle architecture foundation
  (FR-SY-75) all later crypto rows depend on.
- STRIDE Elevation-of-Privilege: scaffolds the trust-boundary structure (TB-3
  JS↔IPC) that downstream features harden.

## Acceptance signal

Both packages build and register; `account:*` keys type-check in
`emitEvent`/`useEventListener`; Rust `AppError` E3xxx enum compiles; PLUGIN_MAP
shows `account`/`@repo/core-data` as `Planned`; every wave-0 row can be started.

## Dependencies

Depends On: — (foundational; unblocks all wave-0 rows).
