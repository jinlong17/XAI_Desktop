# repository-v0-contract — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | repository-v0-contract |
| Title | G2.1 Repository v0 Contract |
| Roadmap | xai-g2-data-security-foundation · feature #1 · G2.1 |
| Status | READY_TO_SHIP |
| Current Phase | VERIFY |
| Suggested Next | manual ship only; continue roadmap |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-verify (Claude Code, Track A) |
| Updated | 2026-05-20 00:18 PDT |
| Blockers | Cross-vendor verify deferred in serial mode; no blocker for scoped contract |

## Phase Plan

### Phase 1 — Contract and tests

- Upgrade `packages/core-data/src/types.ts`.
- Update in-memory and SQLite-shaped implementations.
- Add reusable contract tests for in-memory and SQLite-shaped repos.
- Sync `docs/contracts/data-repository-v0.md`.

### Phase 2 — Verify and logs

- Run `@repo/core-data` tests and type checks.
- Run boundary scan for plugin/Tauri imports.
- Update G2 manifest, autorun log, and deferred gate log.

## Review Notes

feature-review (Codex inline), 2026-05-19 23:48 PDT. Verdict: APPROVED.

The plan is scoped to the G2.1 contract and reusable tests. SQLCipher runtime, live Supabase, localStorage UI migration, and MAS/sandbox evidence are excluded and tracked by later G2 rows.

## Verification Notes

feature-verify (Claude Code, Track A), 2026-05-20 00:18 PDT. Verdict: READY_TO_SHIP.

Verification passed locally:

- `pnpm --filter @repo/core-data test` — 45 tests across in-memory, SQLite, keychain, and the new entity contract suite.
- `pnpm --filter @repo/core-data check-types`.
- `pnpm --filter @repo/core check-types`.
- `pnpm --filter @repo/plugin-organizer check-types`.
- Repository v0 entity surface added at `packages/core-data/src/entities.ts` covers Grid, GridItem, Label, Todo, Habit, ClipboardEntry, Project, Card.
- `docs/contracts/data-repository-v0.md` updated with entity table, interface (incl. `listByIndex` + `metadata`), and entity-level testing contract.

Cross-vendor review/verify, SQLCipher runtime, live Supabase, plugin/UI migration, and MAS/sandbox runtime are explicitly out of scope for G2.1 and remain on later G2 rows or `xai-v1.deferred-gates.md`.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 23:48 PDT | feature-plan + feature-review (Codex inline) | Created Step 0 brief and feature docs. Approved scoped G2.1 plan for build. | pending | feature-build |
| 2026-05-20 00:18 PDT | feature-build + feature-verify (Claude Code, Track A) | Implemented Repository v0 entity surface (`packages/core-data/src/entities.ts`), updated contract doc with entity table + interface, added `tests/entities.test.ts`, ran core-data test + type checks (45 tests passing). | `744d578` | manual ship only; continue roadmap |
