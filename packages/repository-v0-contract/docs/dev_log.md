# repository-v0-contract — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | repository-v0-contract |
| Title | G2.1 Repository v0 Contract |
| Roadmap | xai-g2-data-security-foundation · feature #1 · G2.1 |
| Status | APPROVED |
| Current Phase | BUILD |
| Suggested Next | feature-build |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-review (Codex inline) |
| Updated | 2026-05-19 23:48 PDT |
| Blockers | Cross-vendor review deferred in serial Codex mode; no blocker for scoped build |

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

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 23:48 PDT | feature-plan + feature-review (Codex inline) | Created Step 0 brief and feature docs. Approved scoped G2.1 plan for build. | pending | feature-build |
