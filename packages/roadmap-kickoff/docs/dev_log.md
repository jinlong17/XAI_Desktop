# roadmap-kickoff — Dev Log (Workflow State Machine)

> This is the roadmap workflow state anchor. `xai-roadmap-loop` reconcile reads
> this file by slug: `packages/roadmap-kickoff/docs/dev_log.md`.

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | roadmap-kickoff |
| Title | Sync v1 foundational scaffold (plugin-account + core-data + shared infra) |
| Roadmap | sync-v1 · feature #1 · wave W0 · Phase 0.3 · dev-plan T-05 |
| Status | NEEDS_REVIEW |
| Current Phase | FEATURE_PLAN |
| Suggested Next | feature-review |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | no |
| Executor | feature-plan (Claude Opus) |
| Updated | 2026-05-19 16:20 |

## Phase Plan

> `feature-build` executes ONE phase per run, then stops for human confirmation.
> Phases are ordered so each leaves the tree compiling.

### Phase 1 — Core shared-infra seams
- Add `account:*` keys to `packages/core/src/types/events.ts` (D-5 shapes).
- Add `packages/core/src/hooks/useTauriInvoke.ts` + export via
  `packages/core/src/hooks/index.ts`.
- Add Vitest for `useTauriInvoke` (mocked `@tauri-apps/api/core`).
- Gate: `pnpm --filter @repo/core check-types` + `test` green.

### Phase 2 — Rust AppError seam
- Add `thiserror` to `apps/desktop/src-tauri/Cargo.toml` `[dependencies]` (only
  new crate; pure derive-macro, no crypto/http).
- New `apps/desktop/src-tauri/src/error.rs` (`AppError` thiserror enum, E3xxx
  populated + E1000 fallback, serde-serializable, `AppResult<T>`).
- New `apps/desktop/src-tauri/src/crypto/mod.rs` placeholder with
  `pub struct KeyHandle(u32);` seam + capability-allowlist comment marker.
- `mod error;` + `mod crypto;` added to `lib.rs`. Do NOT touch `commands/window.rs`
  or `invoke_handler!` signatures.
- `#[test]` asserting E3xxx `Display` prefixes.
- Gate: `cargo check` + `cargo test` green in `src-tauri/`.

### Phase 3 — `@repo/core-data` package skeleton
- `packages/core-data/{package.json,tsconfig.json,src/index.ts,src/types.ts,
  src/testing.ts}` mirroring organizer's shape.
- `Repo` interface seam + `createInMemoryRepo()` + its Vitest.
- Gate: `pnpm install` clean + `pnpm --filter @repo/core-data check-types`.

### Phase 4 — `@repo/plugin-account` package skeleton + docs
- `packages/plugin-account/{package.json,tsconfig.json,manifest.json,
  src/index.ts,src/types.ts,src/register-plugin.ts}` + plugin-local
  `docs/{design,api,test,dev_log}.md` (per "Adding a New Plugin" convention).
- `KeyHandle` branded TS type; compile-smoke `emitEvent('account:sync-started',…)`.
- Manifest = live schema, `enabled: false`, `events.emit` declared.
- Gate: `pnpm --filter @repo/plugin-account check-types`; red-line grep clean.

### Phase 5 — Host wiring + PLUGIN_MAP + acceptance sweep
- `apps/desktop/src/main.tsx`: import + `registerAccountPlugin()` call above
  `ReactDOM.createRoot` (Router body untouched — R-1).
- `docs/PLUGIN_MAP.md`: add `account` + `@repo/core-data` `Planned` rows.
- Full acceptance sweep (AC-1..AC-9), incl. `pnpm dev` routing smoke.
- Gate: all acceptance criteria green → READY_FOR_VERIFY.

## Risks

See discovery review §5. Top: R-1 (main.tsx routing regression), R-2 (AppError
serde vs existing string-result commands), R-3 (workspace pickup of new packages).

## Iterations

(none — initial Fresh plan)

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 16:20 | feature-plan (Claude Opus) | Fresh plan: live-code verified vs orientation report (no drift); wrote discovery review + design/api/test/dev_log; 5-phase plan. Roadmap bg re-dispatch — job 2a941912, prior attempt b8b06068 was DEAD. Worktree base HEAD 18a51d1. | (pending commit) | feature-review |
