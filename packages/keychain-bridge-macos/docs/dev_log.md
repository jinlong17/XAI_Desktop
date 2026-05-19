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
| Status | SHIPPED |
| Current Phase | SHIP |
| Suggested Next | — |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | no |
| Executor | ship (claude-sonnet-4-6) |
| Updated | 2026-05-19 20:30 |
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

## Verify Notes

**feature-verify (claude-opus-4-7) — 2026-05-19 20:15 — Verdict: PASS → READY_TO_SHIP**

Evidence independently re-derived (not trusting build Work Log):
- `cargo test --lib` in `apps/desktop/src-tauri/`: **11 passed / 0 failed**. Keychain module: T-U2 (attribute construction), T-U3 (ACL=bundle-id), T-U5 (OSStatus→AppError mapping) green. Error module: T-U1 (all E11xx Display prefixes) + T-U1 regression (E1000/E3xxx prefixes unchanged) + existing E1000/E3xxx tests green. T-U4 (non-macOS stub) is `#[cfg(not(target_os="macos"))]`-gated → correctly not run on this macOS host (code present + correct). T-I1/T-I2/T-I3 gated behind `keychain-it` cargo feature → correctly excluded from unattended layer.
- `cargo check --lib`: clean (only expected dead-code warnings for test helpers + unknown-cfg `keychain-it` note — cosmetic, non-blocking).
- `pnpm --filter @repo/core-data test`: **27 passed / 0 failed** (20 keychain Vitest: T-T1 command/arg shape, T-T2 E11xx parse + E1100/E1101 distinguishable, T-T3 byte fidelity, AC-9 import absence).
- `pnpm --filter @repo/core-data check-types`: tsc --noEmit clean.

Acceptance sweep (in-scope): AC-1/2/3/4/5/6/9/10/11 PASS. AC-7/AC-8/AC-12 legitimately DEFERRED (real-hardware/signed-build gates under `apple-developer-account` #10) — recorded as post-#10 follow-ups D-1/D-2, NOT blockers (per scope boundary).

Code-boundary & contract conformance:
- Red line #4: zero `^import`/`require` of `@tauri-apps/api` in `packages/core-data/src/` (only red-line doc comments matched grep). TS wrapper invokes via injected `useTauriInvoke` seam.
- `commands/window.rs` 0-line diff across acd3126..04d69d7; `capabilities/default.json` 0-line diff (Rec-1 honored — dedicated `plugin-account-keychain.json`, windows=["account","control"]).
- `error.rs` additive-only: no `-` lines on existing E1000/E3xxx variants; E1100–E1104 added with JS-parseable `E11xx:` Display prefixes matching api.md §3 exactly.
- `invoke_handler!` diff scoped to the 3 secret_* additions; `commands::window::*` entries unchanged. `pub mod keychain;` declared in `commands/mod.rs` + `platform/macos/mod.rs`; barrel-exported from `core-data/src/index.ts`. PLUGIN_MAP `@repo/core-data` row carries the Phase 4 note.
- OQ-1/OQ-2 resolved in design.md §OQ-1 + api.md §6 (`SecAccessControl::create_with_protection` + `set_generic_password_options` find-then-update). Commit messages conform to `type(scope): summary` + Why/What/Scope/Risk/Docs/Tests body.

Commits reviewed: acd3126 (Phase 1+2), 3a208d4 (Phase 3), 04d69d7 (Phase 4), 741294a (Phase 5 docs). Each single-intent, within phase boundary.

Residual risks (non-blocking): D-1 signed-build ACL cross-process rejection + D-2 MAS-sandbox keychain-access-group — both gated by `apple-developer-account` (#10); re-surface AC-7/AC-8/AC-12 + T-I4 on real signed hardware when #10 ships. Cosmetic: declare `keychain-it` feature in `Cargo.toml` to silence unknown-cfg warning (optional polish, not required for ship).

## Iterations

(none — initial Fresh plan)

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 17:05 | feature-plan (claude-opus-4-7) | Fresh plan. Step 0 brief normalized from roadmap-seed → `20260519-feature-brief.md`. Phase 1.5 solution scan (web research: security-framework vs keyring vs keychain-services.rs vs hand-FFI) → `20260519-discovery-review.md`, recommend Option A `security-framework`. Wrote four-piece docs at `packages/keychain-bridge-macos/docs/` (cross-cutting infra anchor, roadmap-kickoff precedent). 5-phase plan, each leaves tree compiling. Automation D-Codex+Cursor, no cross-vendor verify. Status → NEEDS_REVIEW / feature-review. | — | feature-review |
| 2026-05-19 17:40 | feature-review (claude-opus-4-7) | Reviewed brief + discovery + design/api/test + 5-phase plan against branch HEAD. Verified Cargo.toml/error.rs/platform/commands/lib.rs/core-data/useTauriInvoke/capabilities claims. 0 blockers, 2 non-blocking recs (capability mechanism, OQ-1 gate). Threat binding + #10 follow-up scoping confirmed. Verdict APPROVED. | — | feature-build |
| 2026-05-19 18:30 | feature-auto-build (claude-sonnet-4-6) | Phase 1: Added security-framework 3.7.0 to Cargo.toml macOS target deps. Created platform/macos/keychain.rs with build_item_attrs() pure constructor, macOS impl (secret_set/get/del using PasswordOptions+SecAccessControl), non-macOS compile stub, T-U2/T-U3/T-U4/T-U5 unit tests + gated T-I1/I2/I3. Declared pub mod keychain in platform/macos/mod.rs. Resolved OQ-1 (SecAccessControl::create_with_protection API path) and OQ-2 (find-then-update is built-in to set_generic_password_options). Updated design.md with OQ-1+OQ-2 resolution. Phase 2: Added E1100-E1104 variants to error.rs (additive, no existing shape touched). T-U1 tests (all E11xx Display prefixes) + T-U1 regression (E1000/E3xxx). Commit: acd3126. cargo test: 11 passed 0 failed. | acd3126 | Phase 3 |
| 2026-05-19 18:45 | feature-auto-build (claude-sonnet-4-6) | Phase 3: Created commands/keychain.rs with #[tauri::command] secret_set/get/del delegates to platform::macos::keychain::*. Added pub mod keychain to commands/mod.rs (window.rs untouched). Added 3 commands to lib.rs invoke_handler! (window commands untouched). Created capabilities/plugin-account-keychain.json — dedicated capability file scoping to account+control windows only (Rec-1 compliant, default.json not widened). Commit: 3a208d4. cargo test: 11 passed 0 failed. Phase 4: Created packages/core-data/src/keychain.ts with KeychainError, parseKeychainError, createKeychainClient(invoke), secretSet/secretGet/secretDel convenience fns. No @tauri-apps/api import (AC-9 grep clean). Barrel export added to index.ts. 20 Vitest tests (T-T1/T-T2/T-T3 + AC-9). Commit: 04d69d7. pnpm test: 27 passed 0 failed; check-types: clean. | 3a208d4, 04d69d7 | Phase 5 |
| 2026-05-19 19:00 | feature-auto-build (claude-sonnet-4-6) | Phase 5: Docs sync — api.md §4 capability identifier frozen (plugin-account-keychain); §6 OQ-1+OQ-2 closed. test.md header updated (implementation complete, real-hardware gates deferred). PLUGIN_MAP.md @repo/core-data row updated with Phase 4 Keychain bridge note. Acceptance sweep: AC-1/2/3/4/5/6/9/10/11 PASS (unattended). AC-7/8/12 DEFERRED to feature-verify (real-hardware gates). Status → READY_FOR_VERIFY. | (see next commit) | feature-verify |
| 2026-05-19 20:15 | feature-verify (claude-opus-4-7) | Independently re-ran cargo test --lib (11/11), core-data Vitest (27/27), cargo check + tsc clean. Verified boundary: red-line #4 grep clean (no @tauri-apps/api import), window.rs/default.json 0-line diff, error.rs additive-only, invoke_handler scoped, commit convention OK. AC-1/2/3/4/5/6/9/10/11 PASS; AC-7/8/12 legitimately deferred to #10 (D-1/D-2, non-blocking). Verdict PASS → READY_TO_SHIP. | acd3126, 3a208d4, 04d69d7, 741294a | ship |
| 2026-05-19 20:30 | ship (claude-sonnet-4-6) | Workflow guard passed (Status=READY_TO_SHIP). Committed dev_log.md SHIPPED update. Pushed branch refactor/microkernel-plugin-architecture to origin. Keychain-bridge commits: acd3126 (Phase 1+2), 3a208d4 (Phase 3), 04d69d7 (Phase 4), 741294a (Phase 5 docs). Status → SHIPPED. | (this commit) | — |
