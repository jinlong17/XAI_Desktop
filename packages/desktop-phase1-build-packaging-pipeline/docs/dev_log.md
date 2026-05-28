# desktop-phase1-build-packaging-pipeline — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-phase1-build-packaging-pipeline |
| Title | Phase 1 Desktop Build and Packaging Pipeline |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | workflow complete |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | ship (Codex, gpt-5.3-codex) |
| Updated | 2026-05-27 23:35 PDT |
| Risks | Fresh verify reproduced the local DMG stall after `Running bundle_dmg.sh` with no final artifact under `target/debug/bundle/dmg/`; `.app` artifact generation and Tauri-host normal-window startup are verified locally, but clean-machine DMG mount/drag-install/launch and manual network-disabled GUI launch still require real macOS hardware before ship closes the residual installer risk. |

## Phase Plan

### Phase 1 — Canonical Desktop Packaging Commands

Status: DONE (`4684deba`).

- Rework `apps/desktop/package.json` so desktop-facing commands map to the Tauri host, not directly to raw `@repo/web` scripts.
- Preserve `apps/desktop/src-tauri/tauri.conf.json` as the owner of `apps/web` dist integration and desktop mock-auth build hooks.
- Update release/build docs so operators use the new desktop contract consistently.

### Phase 2 — Offline App-Bundle Smoke

Status: DONE (`fd0cfb93`).

- Add or document a repeatable smoke path for the built `.app`.
- Verify offline `/app` entry from bundled assets.
- Verify default launch stays single-window normal mode with no overlay/control/grid startup.

### Phase 3 — DMG Attempt and Blocker Recording

Status: DONE (`813135ea`).

- Add an explicit desktop DMG packaging command.
- Attempt local `.dmg` generation.
- If DMG succeeds, verify mount/install/launch.
- If DMG stalls in local macOS image tooling, record the exact blocker and accept `.app` bundle verification as the best local substitute for this environment.

## Review Notes

**Verdict: APPROVED** — 0 blockers, 3 recommendations.

- Discovery quality is sufficient and grounded in the live tree: `apps/desktop/package.json` still exposes raw `@repo/web` scripts, `apps/desktop/src-tauri/tauri.conf.json` already owns `beforeDevCommand`, `beforeBuildCommand`, and `frontendDist = ../../web/dist`, and `docs/release/dmg-build.md` is still stale to the old overlay/control surface.
- The selected option stays inside ADR-0011 Phase 1 scope. It closes the packaging/operator-contract gap without broad Web refactors, keeps the earlier normal-window and desktop mock-auth work as upstream dependencies, and preserves the rule that no overlay/control/grid startup returns by default.
- Contract completeness is adequate: the docs define the desktop script contract, artifact paths, offline `/app` smoke expectations, DMG attempt semantics, and the distinction between repo regressions and local macOS DMG-tooling stalls.
- Phase split is reviewable: package contract first, offline `.app` smoke second, DMG attempt plus blocker recording third. Each phase has clear file boundaries and can be implemented under the one-phase-per-build-run rule.
- Test coverage matches the required emphasis: `.app` bundle generation, explicit `.dmg` attempt, offline `/app` launch, single normal-window startup, and residual real-hardware installer risk are all called out.

Recommendations for `feature-build`:

- Make `pnpm --filter desktop build` resolve to the desktop `.app` bundle path, with any raw `@repo/web` passthrough kept secondary (for example `build:web`) so `apps/desktop` becomes the canonical packaging entrypoint.
- Rewrite `docs/release/dmg-build.md` to the ADR-0011 Phase 1 reality: single normal window, offline `/app` smoke, and explicit "no overlay/control/grid startup" checks. Remove the old transparent/control/account-export manual smoke language.
- Record the DMG outcome with exact evidence from the build phase: command, artifact path, last emitted stage (`bundle_dmg.sh` / `osascript` if it stalls), and the accepted `.app`-bundle fallback for this environment.

## Verification Notes

Previous verification found runtime/package behavior acceptable but blocked on commit traceability. The local-only packaging commit segment was rewritten into single-intent commits:

- Planning/docs seed: `34e32319`
- Phase 1 commands/runbook: `4684deba`
- Phase 2 app-bundle smoke evidence: `fd0cfb93`
- Phase 3 DMG blocker evidence: `813135ea`

The prior mixed-scope local commits (`430fd9e`, `42036e9`, `6aef49c`, `5edfc77`) were replaced before push and are no longer part of the active branch history.

## Verification Summary

- PASS — reviewed active commits `34e32319`, `4684deba`, `fd0cfb93`, `813135ea`, and status commit `30a883a0` for single-intent phase boundaries and commit-format compliance.
- Re-ran the required command set:
  - `pnpm --filter @repo/web build` PASS
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` PASS (47 passed, 0 failed)
  - bounded `pnpm --filter desktop dev` PASS as a Tauri-host probe; observed `beforeDevCommand` mock-auth hook and `🪟 Main window configured for standard app behavior`
  - `pnpm --filter desktop build` PASS; emitted `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`
  - bounded `pnpm --filter desktop build:dmg` reproduced the documented stall after `Running bundle_dmg.sh` with no final artifact under `apps/desktop/src-tauri/target/debug/bundle/dmg/`
- Contract cross-checks pass:
  - `apps/desktop/package.json` makes `dev`, `build`, and `build:dmg` Tauri-host entrypoints while raw web scripts stay secondary
  - `apps/desktop/src-tauri/tauri.conf.json` still owns `beforeDevCommand`, `beforeBuildCommand`, and `frontendDist = ../../web/dist`
  - `docs/release/dmg-build.md` matches ADR-0011 Phase 1 normal-window/offline `/app`/no overlay-control-grid startup expectations
  - tracked evidence docs match the fresh local results, including the `.app` fallback and DMG blocker details

## Residual Risks

- This non-interactive verify run could not complete the manual GUI checks: disable network, launch the bundled `.app`, confirm bundled local `/app`, and visually confirm no overlay/control/grid startup.
- Local DMG creation remains environment-sensitive: Tauri reaches `Bundling X Desktop_1.0.0-rc.1_aarch64.dmg` and `Running bundle_dmg.sh`, but the final DMG does not appear under `target/debug/bundle/dmg/` in this session even though temporary `rw.*.dmg` files appear under `target/debug/bundle/macos/`.
- Human ship must still perform clean-machine DMG mount/drag-install/launch verification on real macOS hardware before treating the installer path as closed.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-27 15:33 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: created the feature brief, discovery review, and docs quartet for the Phase 1 desktop packaging/build pipeline. Confirmed upstream dependencies (`desktop-tauri-web-dist-normal-window` SHIPPED, `desktop-web-auth-offline-mode` READY_TO_SHIP), verified current `tauri.conf.json` already points to `apps/web/dist`, and captured a local DMG baseline where `pnpm --filter desktop tauri build --debug --bundles dmg` reached `bundle_dmg.sh` then stalled under `osascript` without emitting a `.dmg`. | — | feature-review |
| 2026-05-27 15:38 PDT | feature-review (Codex, gpt-5.4 inline) | APPROVED — validated that the plan stays narrowly on the Phase 1 packaging/operator contract, accepts `.app` bundle verification as the deterministic local substitute when DMG tooling stalls, preserves the single normal-window/no-overlay startup requirement, and includes the required offline `/app` + DMG-attempt test coverage. Recorded 3 non-blocking build recommendations. | — | feature-build |
| 2026-05-27 15:45 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 1 complete: remapped `apps/desktop` scripts to Tauri-host contract (`dev`, `build`, `build:dmg`) with secondary web passthrough scripts, and rewrote `docs/release/dmg-build.md` to ADR-0011 Phase 1 requirements (single normal window, offline `/app` smoke, explicit no overlay/control/grid startup check, DMG blocker recording). Tests run in this phase window: `pnpm --filter @repo/web build` PASS; bounded `pnpm --filter desktop dev` probe PASS (hit `beforeDevCommand` + Rust host startup); `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` PASS (47/47). | `4684deba` | continue Phase 2 |
| 2026-05-27 15:46 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 2 complete: added repeatable app-bundle smoke evidence at `docs/reviews/desktop-phase1-build-packaging-pipeline/20260527-app-bundle-smoke.md`, including command outcomes, `.app` path evidence, bounded Tauri host startup proof, and explicit manual offline GUI follow-ups for `feature-verify`. Tests recorded: `pnpm --filter desktop build` PASS with output `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`. | `fd0cfb93` | continue Phase 3 |
| 2026-05-27 15:49 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 3 complete: ran explicit DMG packaging command `pnpm --filter desktop build:dmg`; observed deterministic progress to `Bundling X Desktop_1.0.0-rc.1_aarch64.dmg` and `Running bundle_dmg.sh`, then no further output for 60s across two probes; interrupted command and recorded blocker evidence plus expected artifact path and `.app` fallback in `docs/reviews/desktop-phase1-build-packaging-pipeline/20260527-dmg-attempt.md`. | `813135ea` | feature-verify |
| 2026-05-27 16:07 PDT | feature-auto-build (Codex, gpt-5.3-codex inline repair) | Repaired the verify blocker by rewriting the local-only packaging commit segment into single-intent commits: docs seed (`34e32319`), Phase 1 (`4684deba`), Phase 2 (`fd0cfb93`), and Phase 3 (`813135ea`). Updated Status Panel back to READY_FOR_VERIFY for independent verification. | `34e32319`, `4684deba`, `fd0cfb93`, `813135ea` | feature-verify |
| 2026-05-27 16:10 PDT | feature-verify (Codex, gpt-5.4 inline) | PASS — independently reviewed commits `34e32319`, `4684deba`, `fd0cfb93`, `813135ea`, and `30a883a0` against the discovery review and docs quartet; re-ran `pnpm --filter @repo/web build`, `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`, bounded `pnpm --filter desktop dev`, `pnpm --filter desktop build`, and bounded `pnpm --filter desktop build:dmg`; confirmed Tauri-host script ownership, `.app` artifact generation, normal-window startup signal, and accurate DMG blocker evidence with `.app` fallback. | `34e32319`, `4684deba`, `fd0cfb93`, `813135ea`, `30a883a0` | ship |
| 2026-05-27 23:35 PDT | ship (Codex, gpt-5.3-codex) | Ship gate passed for `desktop-phase1-build-packaging-pipeline`: confirmed `Status = READY_TO_SHIP`, verified clean worktree and branch parity before writeback, marked this feature SHIPPED, and prepared push on `dev` with no cross-feature state edits. | `34e32319`, `4684deba`, `fd0cfb93`, `813135ea`, `30a883a0` | workflow complete |
