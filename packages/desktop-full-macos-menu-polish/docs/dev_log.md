# desktop-full-macos-menu-polish — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-full-macos-menu-polish |
| Title | Full macOS App Menu Polish for the Normal Desktop Host |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (Codex, gpt-5.3-codex) |
| Updated | 2026-05-28 05:01 PDT |
| Risks | Automated implementation gates were already verified as passing in prior `feature-verify`; remaining ship-time risk is real-macOS native menu interaction and ergonomics checks on hardware. |

## Phase Plan

### Phase 1 — Full Menu Section Contract

Status: DONE

- Expand the current shipped menu into a fuller native section contract for app / `File` / `Edit` / `View` / `Window` / `Help`.
- Prefer predefined native menu items wherever Tauri already provides the correct macOS behavior.
- Keep menu ownership and event dispatch in `apps/desktop/src-tauri/src/app_menu.rs`.

### Phase 2 — Native Action Wiring and Disabled States

Status: DONE

- Add a small native custom-item state helper for enabled/disabled behavior.
- Reuse existing host facts only:
  - `main` window presence
  - config-dir/reset availability
  - quick-open runtime/preference state
- Keep hotkey/statusbar interactions limited to tiny existing integration seams.

### Phase 3 — Diagnostics/Support Finalization and Verification

Status: DONE

- Finalize placement of support and recovery actions between `Window` and `Help`.
- Add Rust coverage for section contract, custom IDs, and disabled-state logic.
- Record required real-macOS residual checks for standard actions and support items.

## Review Notes

**Verdict: APPROVED** — 0 blockers, 3 recommendations.

- The plan stays incremental to `desktop-basic-macos-menu-config-store`: it keeps Rust-side ownership in `app_menu.rs`, reuses the shipped config and quick-open seams, and explicitly keeps overlay/control/grid, updater, notifications, tray redesign, and broader hotkey work out of scope.
- The contract set is usable for build: top-level section ownership is fixed to app / `File` / `Edit` / `View` / `Window` / `Help`, current custom IDs are pinned, and the disabled-state inputs are constrained to native facts already present in `app_config.rs`, `global_hotkey.rs`, and `main` window availability.
- The test plan is sufficient for the next stage because it separates Rust helper coverage from real-macOS residual checks, and it treats predefined native actions as manual verification items rather than forcing brittle cross-platform automation.

Recommendations for `feature-build`:

- Freeze the final placement of recovery/support items at the start of Phase 1 and preserve the existing action IDs unless a concrete migration-safe rename is required.
- Implement menu-state refresh as a native-handle lifecycle inside `app_menu.rs` or an adjacent Rust helper: apply once on install, then reapply after quick-open menu actions and any other custom action that changes enablement.
- Keep File/View/Window additions limited to predefined native actions that already map cleanly to the normal `main` window; if a desired action requires non-trivial custom behavior, leave it out rather than widening scope.

## Verification Notes

**Verdict: BLOCKED** — implementation and automated gates pass, but required feature artifacts are not fully tracked in git.

- Commit integrity is otherwise acceptable: `da085aef`, `e37a51fb`, and `c53adac3` stay within their stated phase boundaries and keep menu ownership in `apps/desktop/src-tauri/src/app_menu.rs` with narrow quick-open integration in `commands/global_hotkey.rs`.
- Contract verification passed on code scope: no host config broadening was introduced, `File` / `View` / `Window` additions remain native/predefined, the only custom state inputs are `main` window presence, config-dir availability, and quick-open runtime/preference state, and no overlay/control/grid startup path was reactivated.
- Fresh automated verification passed:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` — pass (70/70)
  - `pnpm --filter @repo/web build` — pass
  - `pnpm --filter desktop tauri build --debug --bundles app` — pass (`X Desktop.app` produced)
- Blocking workflow gap:
  - `packages/desktop-full-macos-menu-polish/docs/design.md`
  - `packages/desktop-full-macos-menu-polish/docs/api.md`
  - `packages/desktop-full-macos-menu-polish/docs/test.md`
  - `docs/reviews/desktop-full-macos-menu-polish/20260528-roadmap-seed.md`
  - `docs/reviews/desktop-full-macos-menu-polish/20260528-feature-brief.md`
  - `docs/reviews/desktop-full-macos-menu-polish/20260528-discovery-review.md`
  remain untracked in the worktree, so the required feature plan/review/contract evidence is not ship-ready under the workflow contract.
- Residual manual checks remain non-blocking after the docs are committed: real macOS menu interaction, predefined native action ergonomics, and support/recovery item placement on hardware.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-28 04:42 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: normalized the roadmap seed into a formal feature brief, documented the incremental discovery decision, and created design/api/test/dev_log artifacts for a Rust-owned full menu polish. The recommended build path keeps the shipped config-store baseline intact, expands menu sections with predefined native actions first, and adds only a tiny native disabled-state model for support and quick-open menu items. | — | feature-review |
| 2026-05-28 04:46 PDT | feature-review (Codex, gpt-5.4 inline) | APPROVED — validated that the plan extends the shipped basic menu/config contract without reopening Phase 1, keeps menu behavior in the Rust shell, defines stable custom IDs plus narrow disabled-state inputs, and preserves the normal `main` window plus legacy overlay quarantine. Recorded 3 non-blocking build recommendations covering final item placement, native menu-state refresh mechanics, and strict predefined-action scope for File/View/Window polish. | — | feature-build |
| 2026-05-28 04:51 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 1 — Full Menu Section Contract: expanded app-menu contract by freezing support/recovery placement, moving `Reset Main Window State` into `Window`, preserving existing help action IDs, and keeping native ownership in `app_menu.rs`. | `da085aef` feat(tauri): Phase 1 — expand native app menu section contract | feature-auto-build |
| 2026-05-28 04:52 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 2 — Native Action Wiring and Disabled States: added native runtime-fact mapping for custom enabled/disabled logic, introduced quick-open menu-state helpers, and reinstalled the native menu after custom actions to reapply enablement deterministically. | `e37a51fb` feat(tauri): Phase 2 — wire native menu state refresh and enablement | feature-auto-build |
| 2026-05-28 04:53 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Phase 3 — Diagnostics/Support Finalization and Verification: completed verification gates (`cargo test`, `pnpm --filter @repo/web build`, `pnpm --filter desktop tauri build --debug --bundles app`), confirmed no overlay/control/grid startup reactivation in touched code paths, and documented residual real-macOS manual checks for predefined native actions and menu ergonomics. | docs(tauri): Phase 3 — finalize menu polish evidence and READY_FOR_VERIFY status | feature-verify |
| 2026-05-28 04:58 PDT | feature-verify (Codex, gpt-5.4 inline) | BLOCKED — reviewed commits `da085aef`, `e37a51fb`, and `c53adac3`; confirmed the code stays incremental to `desktop-basic-macos-menu-config-store`, reran `cargo test`, `pnpm --filter @repo/web build`, and `pnpm --filter desktop tauri build --debug --bundles app` successfully, and verified no overlay/control/grid or tray/updater scope expansion. The feature remains blocked because the required design/API/test docs and discovery-review artifacts for `desktop-full-macos-menu-polish` are still untracked in git, so the workflow evidence is incomplete. | `da085aef`, `e37a51fb`, `c53adac3` | feature-build |
| 2026-05-28 05:01 PDT | feature-auto-build (Codex, gpt-5.3-codex) | Repair pass for verifier blocker: staged and committed required row #5 workflow artifacts (`docs/design.md`, `docs/api.md`, `docs/test.md`, and the three review docs) with no implementation changes; reran focused git status/doc audit only and restored status panel to `READY_FOR_VERIFY`. | `d71bcd35` docs(workflow): track row #5 menu-polish contract and review artifacts | feature-verify |
