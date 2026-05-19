# keychain-bridge-macos — Dev Log (Workflow State Machine)

> Cross-cutting infra feature docs anchor. The orchestrator reads workflow
> state from this file by slug: `packages/keychain-bridge-macos/docs/dev_log.md`.

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | keychain-bridge-macos |
| Title | macOS Keychain Bridge (secret_set / secret_get / secret_del) |
| Roadmap | sync-v1 · feature #8 · wave W0 · Phase 0.3 · dev-plan T-10 |
| Status | APPROVED |
| Current Phase | FEATURE_REVIEW |
| Suggested Next | feature-build |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | no |
| Executor | feature-review (claude-opus-4-7) |
| Updated | 2026-05-19 17:40 |
| Blockers | none |

## Phase Plan

> `feature-build` executes ONE phase per run, then stops for human confirmation.
> Phases are ordered so each leaves the tree compiling.

### Phase 1 — `security-framework` dependency + macOS keychain core + ACL spike
- Add `security-framework` to `apps/desktop/src-tauri/Cargo.toml` under the
  existing `[target.'cfg(target_os = "macos")'.dependencies]` block (only new
  crate; `core-foundation` already vendored).
- New `apps/desktop/src-tauri/src/platform/macos/keychain.rs`:
  `#[cfg(target_os = "macos")]` get/set/del using `security-framework`
  generic-password + `os::macos::access::SecAccess`. **Resolve OQ-1** (the
  exact API path to attach `SecAccess` + `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`);
  record the chosen path in `design.md`.
- `pub mod keychain;` in `platform/macos/mod.rs`. Non-macOS compile-stub path.
- Unit tests T-U2 (attribute construction), T-U3 (ACL = bundle id only),
  T-U4 (non-macOS stub).
- Gate: `cargo check` (both macOS + a non-macOS target if feasible) +
  `cargo test` (unattended layer) green.

### Phase 2 — `AppError` E11xx variants + OSStatus mapping
- Add E1100–E1104 Keychain variants to `apps/desktop/src-tauri/src/error.rs`
  (additive only; do NOT alter existing E1000 / E3xxx variants or serde shape).
- OSStatus → AppError mapping helper in `platform/macos/keychain.rs`.
- Unit tests T-U1 (all E11xx `Display` prefixes; existing prefixes regression)
  + T-U5 (mapping correctness).
- Gate: `cargo test` green; existing error tests still pass.

### Phase 3 — Tauri command layer + capability allowlist
- New `apps/desktop/src-tauri/src/commands/keychain.rs`:
  `#[tauri::command]` `secret_set` / `secret_get` / `secret_del` → `AppResult<T>`.
- `pub mod keychain;` in `commands/mod.rs`; add the 3 commands to the `lib.rs`
  `invoke_handler!` list (do NOT touch `commands::window::*` entries).
- Scoped capability entry restricting `secret_*` to the plugin-account
  window(s) in `apps/desktop/src-tauri/capabilities/`.
- Gate: `cargo check` + `cargo test` green; `invoke_handler!` diff scoped to
  the 3 additions; `commands/window.rs` untouched.

### Phase 4 — `@repo/core-data` TS wrapper + contract tests
- New `packages/core-data/src/keychain.ts`: `secretSet/secretGet/secretDel`
  via the `@repo/core/hooks` `useTauriInvoke` chokepoint (red line #4 — no
  direct `@tauri-apps/api`); typed `KeychainError` parsing the `E11xx:` prefix.
- Barrel-export from `packages/core-data/src/index.ts`.
- Vitest T-T1/T-T2/T-T3 against mocked `useTauriInvoke`.
- Gate: `pnpm --filter @repo/core-data check-types` + `test` green; red-line
  #4 grep clean in `@repo/core-data`.

### Phase 5 — Docs sync + PLUGIN_MAP note + acceptance sweep
- Finalize `api.md` (frozen command/error codes, capability id) + `design.md`
  (OQ-1 resolution) + `test.md`.
- `docs/PLUGIN_MAP.md`: add a note on the `@repo/core-data` row that it now
  surfaces the Keychain bridge (still `Planned` until Stable).
- Acceptance sweep AC-1..AC-11 (AC-7/AC-8/AC-12 real-hardware → feature-verify).
- Gate: all unattended ACs green → READY_FOR_VERIFY.

## Risks

> Source: `docs/reviews/keychain-bridge-macos/20260519-discovery-review.md` §5.

- **R-1 (High)**: `security-framework` high-level helpers may not expose
  `SecAccess`; ACL may require lower-level `SecKeychainItem`/`SecItemAdd`
  attribute-dict path → Phase 1 spike resolves OQ-1 before Phase 3.
- **R-2 (Med)**: ACL bundle-id binding only fully provable on a codesigned
  build → real cross-process rejection is the documented
  `apple-developer-account` (#10) follow-up, NOT a ship blocker.
- **R-3 (Med)**: headless CI cannot reach a login keychain → round-trip is an
  `#[ignore]`/feature-gated integration test; attribute/error assertions stay
  in the unattended layer.
- **R-4 (Med — GATE)**: macOS native-API + new Tauri commands →
  **real-hardware verification required before the human ship gate**;
  feature-verify must run the `pnpm dev` macOS smoke + gated integration tests.
- **R-5 (Med)**: capability mis-scope could expose `secret_*` → scoped
  allowlist reviewed in feature-review; asserted in api.md §4.
- **R-6 (Low)**: new E11xx variants must not disturb existing E1000/E3xxx
  serde/Display contract → additive-only + regression test.

### Documented follow-ups (NOT ship blockers — re-surface when #10 ships)
- D-1: signed-build ACL cross-process rejection (gated by `apple-developer-account` #10)
- D-2: MAS-sandbox `keychain-access-group` entitlement behavior (gated by #10)

## Review Notes

APPROVED — 0 blockers. Plan verified against branch HEAD; all file/structure claims accurate. Rec-1: Phase 3 capability = dedicated window-scoped capability file (not a secret:* perm string; not widening default.json). Rec-2: Phase 1 gate must not go green until OQ-1 (SecAccess attach path) is recorded in design.md. T3/STRIDE-InfoDisc/TB-4 + T13 binding present in design+test; #10 follow-ups correctly non-blocking.

## Iterations

(none — initial Fresh plan)

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 17:05 | feature-plan (claude-opus-4-7) | Fresh plan. Step 0 brief normalized from roadmap-seed → `20260519-feature-brief.md`. Phase 1.5 solution scan (web research: security-framework vs keyring vs keychain-services.rs vs hand-FFI) → `20260519-discovery-review.md`, recommend Option A `security-framework`. Wrote four-piece docs at `packages/keychain-bridge-macos/docs/` (cross-cutting infra anchor, roadmap-kickoff precedent). 5-phase plan, each leaves tree compiling. Automation D-Codex+Cursor, no cross-vendor verify. Status → NEEDS_REVIEW / feature-review. | — | feature-review |
| 2026-05-19 17:40 | feature-review (claude-opus-4-7) | Reviewed brief + discovery + design/api/test + 5-phase plan against branch HEAD. Verified Cargo.toml/error.rs/platform/commands/lib.rs/core-data/useTauriInvoke/capabilities claims. 0 blockers, 2 non-blocking recs (capability mechanism, OQ-1 gate). Threat binding + #10 follow-up scoping confirmed. Verdict APPROVED. | — | feature-build |
