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
| Status | READY_TO_SHIP |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | ship |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | no |
| Executor | feature-verify (claude-opus-4-7) |
| Updated | 2026-05-19 00:45 |

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

## Review Notes

> feature-review (Claude Opus), 2026-05-19. Verdict: APPROVED. 0 blockers, 2 advisory notes.

Independent live-code verification (worktree base 18a51d1) — every discovery claim re-checked file-by-file, all CONFIRMED:
- EventMap (events.ts) organizer/app-only; emitEvent/useEventListener are `<K extends keyof EventMap>` → adding `account:*` keys is sufficient & type-safe.
- hooks/index.ts exports only useWindow; @repo/core subpath layout intact (no core-* split); core-data genuinely new.
- PluginManifest interface matches D-3 live schema exactly; PluginRegistry.register/getPlugin support idempotent registerAccountPlugin() + registration test.
- main.tsx 39-line router, no plugin imports → R-1 mitigation (call above createRoot, Router() body untouched) sound.
- Cargo.toml zero crypto/http deps; thiserror is the only new crate (pure derive macro). lib.rs `mod commands; mod platform;` → adding `mod error; mod crypto;` is isolated, invoke_handler! untouched.
- commands/window.rs `Result<(), String>` → D-6 Option A (no migration) keeps blast radius off macOS-hardware-sensitive window code.
- organizer package.json/manifest shape matches the mirror instruction; PLUGIN_MAP `Planned` valid.

Gate results: discovery quality PASS · design alignment PASS · contract completeness PASS · phase plan quality PASS (5 phases, each leaves tree compiling, explicit file boundaries) · architecture risk PASS (core changes additive-only; red lines #1/#4/#8/#9/#12 respected; T6/FR-SY-75 KeyHandle opaque seam + crypto_* allowlist marker and STRIDE EoP/TB-3 useTauriInvoke chokepoint bound into design.md §Threat Model).

Advisory (non-blocking, for feature-build awareness, no re-plan needed):
- A1: test.md §3 "every events.emit entry is a real keyof EventMap" — PluginManifest.events.emit is typed `string[]` (verified), so this is a test-fixture/runtime assertion, not a compile-time guarantee. Plan already frames it as a fixture; keep it that way.
- A2: AppError derives `serde::Serialize` as an externally-tagged enum (api.md §3) — fine for scaffold; ensure the E3xxx Display-prefix `#[test]` (test.md §4) actually asserts the `E3xxx:` prefix string so the JS-parseable error-code contract is locked from day one.

## Iterations

(none — initial Fresh plan)

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 16:20 | feature-plan (Claude Opus) | Fresh plan: live-code verified vs orientation report (no drift); wrote discovery review + design/api/test/dev_log; 5-phase plan. Roadmap bg re-dispatch — job 2a941912, prior attempt b8b06068 was DEAD. Worktree base HEAD 18a51d1. | 211762a | feature-review |
| 2026-05-19 16:55 | feature-review (Claude Opus) | Independent review vs live worktree code (base 18a51d1); all discovery claims re-verified file-by-file, no drift. 5 gates PASS. Verdict APPROVED, 0 blockers, 2 advisory notes (test-fixture typing nuance + error-code-prefix test). Status Panel → APPROVED / FEATURE_REVIEW / feature-build. | (this commit) | feature-build |
| 2026-05-19 00:16 | feature-auto-build (claude-sonnet-4-6) | Phase 1: account:* EventMap keys + useTauriInvoke hook + Vitest (4 cases). Gate: pnpm --filter @repo/core check-types PASS; test 7/7 PASS. | de4d5e9 | Phase 2 |
| 2026-05-19 00:18 | feature-auto-build (claude-sonnet-4-6) | Phase 2: AppError E3xxx thiserror enum + crypto/KeyHandle(u32) scaffold + mod error;/crypto; in lib.rs. Gate: cargo check PASS (2 dead-code warnings expected); cargo test 6/6 PASS (advisory A2: all E3xxx prefix assertions present). | 93034b2 | Phase 3 |
| 2026-05-19 00:22 | feature-auto-build (claude-sonnet-4-6) | Phase 3: @repo/core-data package skeleton — Repo<T>/RepoRecord interface + createInMemoryRepo() + 7 Vitest covering put/get/delete/list round-trips. Gate: pnpm --filter @repo/core-data check-types PASS; test 7/7 PASS. | a443c88 | Phase 4 |
| 2026-05-19 00:24 | feature-auto-build (claude-sonnet-4-6) | Phase 4: @repo/plugin-account skeleton — KeyHandle branded type + registerAccountPlugin() + compile-smoke (_AssertAccountKeysInEventMap + @ts-expect-error negative case) + manifest.json (enabled:false, 5 emit keys) + four-piece plugin docs. Gate: check-types PASS; red-line grep #4/#9 clean. | 747fa49 | Phase 5 |
| 2026-05-19 00:30 | feature-auto-build (claude-sonnet-4-6) | Phase 5: Host wiring (main.tsx: import+registerAccountPlugin() above createRoot; Router body untouched R-1) + PLUGIN_MAP Planned rows (account + @repo/core-data) + acceptance sweep AC-1..AC-9. AC-7 pnpm dev runtime smoke deferred to feature-verify (headless env). Status → READY_FOR_VERIFY. | c4fea93 | feature-verify |
| 2026-05-19 00:45 | feature-verify (claude-opus-4-7) | Independent verify vs worktree base 18a51d1, 5 build commits re-checked. All 9 AC re-run green: pnpm install clean; core 7/7; core-data 7/7; plugin-account check-types clean; desktop tsc exit 0; cargo check clean (2 expected scaffold warnings); cargo test 6/6 (A2 E3xxx prefixes ✔); AC-5 window.rs+invoke_handler diff empty; red lines #1/#4/#8/#9 clean; A1 @ts-expect-error live; lifecycle gate + T6/TB-3 seams confirmed. Verdict PASS. Residual: macOS pnpm dev R-1 smoke = required pre-ship human step (non-blocking — change statically inert). Status → READY_TO_SHIP. | (this commit) | ship |
