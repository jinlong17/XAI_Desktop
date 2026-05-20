# localstorage-migration — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | localstorage-migration |
| Title | G2.3 localStorage → Repository v0 migration adapter |
| Roadmap | xai-g2-data-security-foundation · feature #4 · G2.3 |
| Status | READY_TO_SHIP |
| Current Phase | VERIFY |
| Suggested Next | manual ship only; UI wire-up tracked under G1.5 / G3-E1 |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-build + feature-verify (Claude Code, Track A) |
| Updated | 2026-05-20 00:48 PDT |
| Blockers | None for migration adapter scope; runtime cut-over deferred |

## Phase Plan

### Phase 1 — Migration adapter + tests

Status: DONE.

- Inventoried current `localStorage` usage:
  - `packages/plugin-organizer/src/useGridSystem.tsx` — single key
    `xai-desktop-layout` holds `PersistedLayout` (`{ grids, items }`).
  - No other production callers persist via `localStorage`.
- Added `packages/core-data/src/organizer-layout-migration.ts`
  exporting `migrateOrganizerLayoutToRepos`. Converts legacy
  `LegacyGridBox` → `GridEntity` and `LegacyDesktopItem` →
  `GridItemEntity`. Items without an owning grid (orphans) are
  dropped — they cannot survive into the typed model.
- Added `packages/core-data/tests/organizer-layout-migration.test.ts`
  (6 tests): mapping correctness; **repo-state idempotency**
  (rerun-safe — equal records are skipped via a new `unchanged`
  counter so `updatedAt` is NOT re-stamped on a no-op rerun, see C2);
  dedicated `updatedAt`-preservation test on rerun;
  default-keep-legacy; opt-in `removeLegacy`; and no-op behaviour for
  absent / malformed blobs.
- Existing generic `migrateLocalStorageToRepo` helper retained for
  prefix-keyed legacy stores (Todo / Habit / Label) once those
  plugins land.

### Phase 2 — Verify and reconcile

Status: DONE.

- `pnpm --filter @repo/core-data test`: 54 tests PASS.
- `pnpm --filter @repo/core-data check-types`: PASS.
- Type compatibility verified against the G2.1 entity surface
  (`GridEntity` / `GridItemEntity`).

Deferred / out-of-scope for G2.3:

- UI integration in `useGridSystem.tsx`: the runtime swap from
  `localStorage` → Repository is tracked under G1.5 `grid-persistence`
  because the hook needs to become async-aware (`Repo<T>` returns
  Promises) without regressing the existing UX.
- Migrations for plugin-productivity / plugin-clipboard / plugin-label
  storage keys: those plugins live in Track B/C and their migration
  adapters are deferred until each plugin owns a stable storage
  schema.

## Verification Notes

feature-verify (Claude Code, Track A), 2026-05-20 00:48 PDT. Verdict: READY_TO_SHIP.

The migration adapter is **repo-state idempotent** — a rerun against an
unchanged legacy blob skips equal records (tracked via the new
`unchanged` counter on `OrganizerLayoutMigrationResult`) so that
`updatedAt` is NOT re-stamped and downstream sync does not see a
spurious conflict signal (C2 hardening). The adapter is non-destructive
by default, and type-checked against the G2.1 entity surface. The UI
cut-over remains parked behind the documented G1.5 work item so a
future async refactor of `useGridSystem` can land in one focused PR.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-20 00:48 PDT | feature-build + feature-verify (Claude Code, Track A) | Added `organizer-layout-migration.ts` + 5 vitest cases. Re-exported from `@repo/core-data`. Updated G2 manifest row #4. | pending commit | manual ship only; continue roadmap |
