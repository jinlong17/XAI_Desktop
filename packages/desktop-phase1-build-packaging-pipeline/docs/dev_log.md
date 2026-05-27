# desktop-phase1-build-packaging-pipeline — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-phase1-build-packaging-pipeline |
| Title | Phase 1 Desktop Build and Packaging Pipeline |
| Current Phase | FEATURE_REVIEW |
| Status | APPROVED |
| Suggested Next | feature-build |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-review (Codex, gpt-5.4 inline) |
| Updated | 2026-05-27 15:38 PDT |
| Risks | Local DMG creation currently stalls after `Running bundle_dmg.sh` when Tauri hands off to Finder/AppleScript tooling, so the plan must preserve `.app` bundle verification as the deterministic local substitute while recording the exact DMG blocker; `docs/release/dmg-build.md` is stale to the pre-ADR-0011 overlay surface and must be updated carefully; real macOS hardware still needs manual clean-machine install/launch evidence before ship can claim installer confidence. |

## Phase Plan

### Phase 1 — Canonical Desktop Packaging Commands

Status: PLANNED.

- Rework `apps/desktop/package.json` so desktop-facing commands map to the Tauri host, not directly to raw `@repo/web` scripts.
- Preserve `apps/desktop/src-tauri/tauri.conf.json` as the owner of `apps/web` dist integration and desktop mock-auth build hooks.
- Update release/build docs so operators use the new desktop contract consistently.

### Phase 2 — Offline App-Bundle Smoke

Status: PLANNED.

- Add or document a repeatable smoke path for the built `.app`.
- Verify offline `/app` entry from bundled assets.
- Verify default launch stays single-window normal mode with no overlay/control/grid startup.

### Phase 3 — DMG Attempt and Blocker Recording

Status: PLANNED.

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

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-27 15:33 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: created the feature brief, discovery review, and docs quartet for the Phase 1 desktop packaging/build pipeline. Confirmed upstream dependencies (`desktop-tauri-web-dist-normal-window` SHIPPED, `desktop-web-auth-offline-mode` READY_TO_SHIP), verified current `tauri.conf.json` already points to `apps/web/dist`, and captured a local DMG baseline where `pnpm --filter desktop tauri build --debug --bundles dmg` reached `bundle_dmg.sh` then stalled under `osascript` without emitting a `.dmg`. | — | feature-review |
| 2026-05-27 15:38 PDT | feature-review (Codex, gpt-5.4 inline) | APPROVED — validated that the plan stays narrowly on the Phase 1 packaging/operator contract, accepts `.app` bundle verification as the deterministic local substitute when DMG tooling stalls, preserves the single normal-window/no-overlay startup requirement, and includes the required offline `/app` + DMG-attempt test coverage. Recorded 3 non-blocking build recommendations. | — | feature-build |
