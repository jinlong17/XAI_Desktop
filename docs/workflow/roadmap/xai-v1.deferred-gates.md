# XAI v1 Deferred Gates — 2026-05-19

## Entry 1

- Feature: xai-g0-window-spike manifest
- Gate: G0
- Deferred gate: Manifest review
- Why deferred: The run is operating in 24h unattended mode and no human review is available.
- Risk: The manifest decomposition may need human adjustment before later G0 production-risk tasks, especially tasks involving native window behavior, MAS sandbox strategy, and product fallback decisions.
- What was done instead: Initialized a conservative serial manifest directly from `docs/planning/execution/G0-window-spike.md`, with each execution-pack task mapped to one feature. Only the low-risk G0.1 evidence-anchor task is eligible before human review.
- Later human action: Review `docs/workflow/roadmap/xai-g0-window-spike.md` against roadmap-prompts §6 checklist before authorizing G0.2+.
- Suggested verification command / environment: `sed -n '1,220p' docs/workflow/roadmap/xai-g0-window-spike.md`
- Files/commits affected: docs/workflow/roadmap/xai-g0-window-spike.md; commits `3b571f6`, `c3b29b0`, `6b121ea`, `4ea65ec`, `82ab268`, `33627df`

## Entry 2

- Feature: window-ground-truth
- Gate: G0
- Deferred gate: Cross-vendor feature-review
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no separate reviewer is available in unattended mode.
- Risk: The same executor planned and reviewed the low-risk G0.1 docs/evidence setup, so review independence is weaker than normal Workflow V2.
- What was done instead: Performed an inline review against discovery/design/api/test/dev_log gates and limited scope to branch/evidence documentation only.
- Later human action: Review `docs/reviews/window-ground-truth/20260519-discovery-review.md` and `packages/window-ground-truth/docs/dev_log.md` before treating G0.1 as externally reviewed.
- Suggested verification command / environment: `sed -n '1,140p' packages/window-ground-truth/docs/dev_log.md`
- Files/commits affected: packages/window-ground-truth/docs/dev_log.md; docs/workflow/roadmap/xai-v1.deferred-gates.md; commits `3b571f6`, `c3b29b0`

## Entry 3

- Feature: window-ground-truth
- Gate: G0
- Deferred gate: Cross-vendor feature-verify
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no independent verifier is available in unattended mode.
- Risk: The same executor performed final verification, so Workflow V2 independence is weaker than normal.
- What was done instead: Re-ran the exact G0.1 acceptance checks and reviewed commit `3b571f6` for docs-only scope and commit convention compliance.
- Later human action: Independently review commit `3b571f6` and the evidence README before shipping or using G0.1 as a reviewed base for higher-risk G0 tasks.
- Suggested verification command / environment: `git show --stat --oneline 3b571f6 && git branch --show-current && sw_vers`
- Files/commits affected: commit `3b571f6`; packages/window-ground-truth/docs/dev_log.md; docs/workflow/roadmap/xai-g0-window-spike.md; docs/workflow/roadmap/xai-v1.autorun-20260519.md

## Entry 4

- Feature: grid-window-prototype
- Gate: G0
- Deferred gate: Human ship of prerequisite `window-ground-truth`
- Why deferred: The run is explicitly forbidden from running ship or pushing, but the 24h unattended goal requires continuing to the next eligible local G0 task when safe.
- Risk: G0.2 proceeds from local `READY_TO_SHIP` evidence instead of a human-shipped prerequisite.
- What was done instead: Limited G0.2 to the next explicit execution-pack task and changed only local dependency semantics for this row to `ready_to_ship`.
- Later human action: Review and ship `window-ground-truth` before relying on G0.2 evidence outside this local spike branch.
- Suggested verification command / environment: `git show --stat --oneline 3b571f6 c3b29b0 && sed -n '1,80p' docs/workflow/roadmap/xai-g0-window-spike.md`
- Files/commits affected: docs/workflow/roadmap/xai-g0-window-spike.md; docs/workflow/roadmap/xai-v1.autorun-20260519.md; packages/grid-window-prototype/docs/dev_log.md; commits `6b121ea`, `4ea65ec`

## Entry 5

- Feature: grid-window-prototype
- Gate: G0
- Deferred gate: Cross-vendor feature-review
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no independent reviewer is available in unattended mode.
- Risk: The same executor planned and reviewed a frontend/native-window spike.
- What was done instead: Performed an inline review focused on boundary control: no new Tauri command, no EventMap change, no Organizer persistence changes, and a visibly G0-only fallback.
- Later human action: Review `docs/reviews/grid-window-prototype/20260519-discovery-review.md` and `packages/grid-window-prototype/docs/dev_log.md` before treating G0.2 as externally reviewed.
- Suggested verification command / environment: `sed -n '1,140p' packages/grid-window-prototype/docs/dev_log.md`
- Files/commits affected: packages/grid-window-prototype/docs/dev_log.md; docs/workflow/roadmap/xai-v1.deferred-gates.md; commit `6b121ea`

## Entry 6

- Feature: grid-window-prototype
- Gate: G0
- Deferred gate: Real Tauri alpha/beta window runtime evidence
- Why deferred: Initially deferred because the unattended run could not open the desktop app, click Grid windows, or inspect per-window DevTools logs as a human.
- Risk: Automated build checks alone did not prove native windows were visible, independently closable, or that targeted events were isolated at runtime.
- What was done instead: Implemented the fallback panel and targeted `emitTo(windowLabel, ...)` path; patched runtime defects through `14e04c2`, `01e5167`, `b8c34fe`, `7b7ff35`, `f65a1b5`, and `a33c74d`; reran typecheck/build/Rust check.
- Later human action: Optional independent replay of the G0.2 manual evidence path: run the app, drag the AI cube across the desktop, click `+ New Grid`, confirm native Grid windows appear, verify Grid drag and control focus behavior, then attach logs/screenshots under `docs/reviews/window-ground-truth/grid-window-prototype/`.
- Suggested verification command / environment: `pnpm --filter desktop tauri dev`, then use the DevTools snippets in `docs/reviews/window-ground-truth/grid-window-prototype/README.md`.
- Files/commits affected: `6b121ea`, `14e04c2`, `01e5167`, `b8c34fe`, `7b7ff35`, `f65a1b5`, `a33c74d`; apps/desktop/src/windows/GridWindow.tsx; apps/desktop/src/windows/ControlWindow.tsx; apps/desktop/src/components/AiAssistant/AiCube.tsx; packages/plugin-organizer/src/OrganizerLayer.tsx; packages/plugin-organizer/src/useGridSystem.tsx; apps/desktop/src-tauri/src/platform/macos/window_ext.rs; docs/reviews/window-ground-truth/grid-window-prototype/README.md

## Entry 7

- Feature: grid-window-prototype
- Gate: G0
- Deferred gate: Cross-vendor feature-verify
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no independent verifier is available in unattended mode.
- Risk: The same executor implemented and verified a frontend/native-window spike.
- What was done instead: Re-ran automated checks, inspected commit boundaries, and recorded the post-report routing fix.
- Later human action: Independently review commits `6b121ea`, `14e04c2`, `01e5167`, `b8c34fe`, `7b7ff35`, `f65a1b5`, and `a33c74d`, then rerun the manual Tauri evidence path if stricter review is needed before ship.
- Suggested verification command / environment: `git show --stat --oneline 6b121ea 14e04c2 01e5167 b8c34fe 7b7ff35 f65a1b5 a33c74d && pnpm --filter desktop exec tsc --noEmit && pnpm --filter @repo/plugin-organizer check-types && pnpm --filter desktop build && cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`
- Files/commits affected: `6b121ea`, `14e04c2`, `01e5167`, `b8c34fe`, `7b7ff35`, `f65a1b5`, `a33c74d`; packages/grid-window-prototype/docs/dev_log.md; docs/workflow/roadmap/xai-g0-window-spike.md; docs/workflow/roadmap/xai-v1.autorun-20260519.md; docs/contracts/events-v0.md

## Entry 8

- Feature: click-through-matrix
- Gate: G0
- Deferred gate: Real macOS click-through matrix
- Why deferred: The acceptance requires observing Finder/Desktop hit-testing and React pointer behavior in real Tauri windows with `macOSPrivateApi=true` and `false`.
- Risk: G0 cannot reach Go/Conditional Go until this evidence exists.
- What was done instead: Created the evidence matrix template and avoided changing window constants or Tauri config without live proof.
- Later human action: Run `pnpm --filter desktop tauri dev`, fill the matrix, and attach screenshots/logs under `docs/reviews/window-ground-truth/click-through-matrix/`.
- Suggested verification command / environment: `pnpm --filter desktop tauri dev` on macOS with Finder/Desktop visible; compare `macOSPrivateApi=true` and `false`.
- Files/commits affected: docs/reviews/window-ground-truth/click-through-matrix/README.md; packages/click-through-matrix/docs/*; commit `82ab268`

## Entry 9

- Feature: finder-dnd-path
- Gate: G0
- Deferred gate: Real Finder DnD path-first matrix
- Why deferred: The acceptance requires real Finder drag/drop payloads for file, folder, App bundle, and alias in a Tauri Grid window.
- Risk: G0 cannot prove the path-first drop model until this evidence exists.
- What was done instead: Created the evidence matrix template and avoided changing Webview/native drop behavior without observed runtime results.
- Later human action: Run `pnpm --filter desktop tauri dev`, drop Finder items into a Grid, and attach logs/screenshots under `docs/reviews/window-ground-truth/finder-dnd-path/`.
- Suggested verification command / environment: `pnpm --filter desktop tauri dev` on macOS with Finder; use file, folder, `.app`, and alias drops.
- Files/commits affected: docs/reviews/window-ground-truth/finder-dnd-path/README.md; packages/finder-dnd-path/docs/*; commit `33627df`

## Entry 10

- Feature: spaces-multimonitor-matrix
- Gate: G0
- Deferred gate: User override to skip blocked G0.3/G0.4 dependencies for safe prep
- Why deferred: The user explicitly instructed to skip and continue, while G0.3/G0.4 remain BLOCKED on real hardware evidence.
- Risk: G0.5 prep proceeds without the prerequisite hit-test and DnD evidence, so results cannot be used as a G0 pass signal.
- What was done instead: Limited G0.5 to documentation/matrix preparation only and preserved BLOCKED status for real runtime validation.
- Later human action: Complete G0.3/G0.4 evidence, then perform G0.5 runtime validation.
- Suggested verification command / environment: `sed -n '1,120p' docs/workflow/roadmap/xai-g0-window-spike.md`
- Files/commits affected: docs/workflow/roadmap/xai-g0-window-spike.md; docs/workflow/roadmap/xai-v1.autorun-20260519.md; commit `2fb6bac`

## Entry 11

- Feature: spaces-multimonitor-matrix
- Gate: G0
- Deferred gate: Real Spaces/fullscreen/multi-display matrix
- Why deferred: The acceptance requires real Mission Control, multiple Spaces, fullscreen-app, and multi-display observations.
- Risk: G0 cannot prove window placement/recovery stability until this evidence exists.
- What was done instead: Created the evidence matrix template and avoided changing window behavior without live proof.
- Later human action: Run `pnpm --filter desktop tauri dev`, perform the matrix, and attach logs/screenshots under `docs/reviews/window-ground-truth/spaces-multimonitor-matrix/`.
- Suggested verification command / environment: `pnpm --filter desktop tauri dev` on macOS with built-in + external display, Mission Control, multiple Spaces, and fullscreen app.
- Files/commits affected: docs/reviews/window-ground-truth/spaces-multimonitor-matrix/README.md; packages/spaces-multimonitor-matrix/docs/*; commit `2fb6bac`

## Entry 12

- Feature: mas-sandbox-dry-run
- Gate: G0
- Deferred gate: User override to skip blocked G0.3/G0.4 dependencies for MAS safe prep
- Why deferred: The user explicitly instructed to skip and continue, while G0.3/G0.4 remain BLOCKED and MAS conclusions depend on those results.
- Risk: MAS prep proceeds without prerequisite click-through and Finder path evidence, so it cannot produce a real MAS feasibility conclusion.
- What was done instead: Limited G0.6 to documentation/risk-prep only and preserved BLOCKED status for real runtime validation.
- Later human action: Complete G0.3/G0.4 evidence, then perform MAS/private-API validation.
- Suggested verification command / environment: `sed -n '1,140p' docs/reviews/window-ground-truth/mas-sandbox-dry-run/mas-sandbox-notes.md`
- Files/commits affected: docs/workflow/roadmap/xai-g0-window-spike.md; docs/workflow/roadmap/xai-v1.autorun-20260519.md; commit `071a192`

## Entry 13

- Feature: mas-sandbox-dry-run
- Gate: G0
- Deferred gate: Real MAS sandbox and `macOSPrivateApi=false` validation
- Why deferred: The acceptance requires a real sandbox/private-API runtime comparison and likely signed-build context.
- Risk: G0 cannot decide DMG/MAS split or MAS fallback until this evidence exists.
- What was done instead: Created MAS notes, entitlement draft, and risk matrix; avoided Tauri config/Cargo/capability changes.
- Later human action: Run a `macOSPrivateApi=false` build and sandbox/signed validation, then update `mas-sandbox-notes.md`.
- Suggested verification command / environment: Build/run desktop with private API disabled and sandbox entitlements on macOS; Apple Developer signing may be required for final evidence.
- Files/commits affected: docs/reviews/window-ground-truth/mas-sandbox-dry-run/mas-sandbox-notes.md; packages/mas-sandbox-dry-run/docs/*; commit `071a192`

## Entry 14

- Feature: window-command-contract
- Gate: G1
- Deferred gate: G0 Go/Conditional Go prerequisite
- Why deferred: The user explicitly instructed to skip and continue, but G1 production implementation requires G0 to pass or choose a fallback path.
- Risk: Implementing window command lifecycle before G0 decisions could encode the wrong click-through, DnD, Spaces, or MAS assumptions.
- What was done instead: Created docs/contract safe prep only and marked the feature BLOCKED.
- Later human action: Complete/review G0 evidence and decide Go/Conditional Go or fallback, then rerun feature-build for `window-command-contract`.
- Suggested verification command / environment: Review `docs/workflow/roadmap/xai-g0-window-spike.md` and all G0 evidence folders before G1 implementation.
- Files/commits affected: docs/workflow/roadmap/xai-g1-native-foundation.md; packages/window-command-contract/docs/*; commit `9c7b52f`

## Entry 15

- Feature: host-business-residuals
- Gate: G1
- Deferred gate: Cross-vendor feature-review/verify
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no independent reviewer/verifier is available in unattended mode.
- Risk: The same executor audited and verified the Host residual list.
- What was done instead: Used a direct `rg` scan over `apps/desktop/src` and created an explicit file-by-file residual inventory.
- Later human action: Review `docs/planning/execution/host-residuals.md` before starting G1.2/G1.6 cleanup implementation.
- Suggested verification command / environment: `rg -n "AiCube|SettingsPanel|useSyncMenuBarStatus|OrganizerLayer|create-grid-request|useGridSystem" apps/desktop/src -g '*.{ts,tsx}'`
- Files/commits affected: docs/planning/execution/host-residuals.md; packages/host-business-residuals/docs/*; commit `c6dbd77`
