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
- Files/commits affected: docs/workflow/roadmap/xai-g0-window-spike.md; commit pending

## Entry 2

- Feature: window-ground-truth
- Gate: G0
- Deferred gate: Cross-vendor feature-review
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no separate reviewer is available in unattended mode.
- Risk: The same executor planned and reviewed the low-risk G0.1 docs/evidence setup, so review independence is weaker than normal Workflow V2.
- What was done instead: Performed an inline review against discovery/design/api/test/dev_log gates and limited scope to branch/evidence documentation only.
- Later human action: Review `docs/reviews/window-ground-truth/20260519-discovery-review.md` and `packages/window-ground-truth/docs/dev_log.md` before treating G0.1 as externally reviewed.
- Suggested verification command / environment: `sed -n '1,140p' packages/window-ground-truth/docs/dev_log.md`
- Files/commits affected: packages/window-ground-truth/docs/dev_log.md; docs/workflow/roadmap/xai-v1.deferred-gates.md; commit pending

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
- Files/commits affected: docs/workflow/roadmap/xai-g0-window-spike.md; docs/workflow/roadmap/xai-v1.autorun-20260519.md; packages/grid-window-prototype/docs/dev_log.md; commit pending

## Entry 5

- Feature: grid-window-prototype
- Gate: G0
- Deferred gate: Cross-vendor feature-review
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no independent reviewer is available in unattended mode.
- Risk: The same executor planned and reviewed a frontend/native-window spike.
- What was done instead: Performed an inline review focused on boundary control: no new Tauri command, no EventMap change, no Organizer persistence changes, and a visibly G0-only fallback.
- Later human action: Review `docs/reviews/grid-window-prototype/20260519-discovery-review.md` and `packages/grid-window-prototype/docs/dev_log.md` before treating G0.2 as externally reviewed.
- Suggested verification command / environment: `sed -n '1,140p' packages/grid-window-prototype/docs/dev_log.md`
- Files/commits affected: packages/grid-window-prototype/docs/dev_log.md; docs/workflow/roadmap/xai-v1.deferred-gates.md; commit pending

## Entry 6

- Feature: grid-window-prototype
- Gate: G0
- Deferred gate: Real Tauri alpha/beta window runtime evidence
- Why deferred: The unattended run cannot open the desktop app, click Grid windows, or inspect per-window DevTools logs as a human.
- Risk: Automated build checks prove the code compiles, but they do not prove two native windows are visible, independently closable, or that targeted events are not delivered cross-window at runtime.
- What was done instead: Implemented the fallback panel and targeted `emitTo(windowLabel, ...)` path; reran typecheck/build; documented exact manual invocation and expected evidence.
- Later human action: Run the app, invoke `create_grid_window` for `alpha` and `beta`, click each scoped-event button, and attach logs/screenshots under `docs/reviews/window-ground-truth/grid-window-prototype/`.
- Suggested verification command / environment: `pnpm --filter desktop tauri dev`, then use the DevTools snippets in `docs/reviews/window-ground-truth/grid-window-prototype/README.md`.
- Files/commits affected: `6b121ea`; apps/desktop/src/windows/GridWindow.tsx; docs/reviews/window-ground-truth/grid-window-prototype/README.md

## Entry 7

- Feature: grid-window-prototype
- Gate: G0
- Deferred gate: Cross-vendor feature-verify
- Why deferred: The runtime override requires a serial Codex conductor with no spawn/bg dispatch, and no independent verifier is available in unattended mode.
- Risk: The same executor implemented and verified a frontend/native-window spike.
- What was done instead: Re-ran automated checks, inspected commit boundaries, and confirmed no command/contract/EventMap diff.
- Later human action: Independently review commit `6b121ea` and rerun the manual Tauri evidence path.
- Suggested verification command / environment: `git show --stat --oneline 6b121ea && pnpm --filter @repo/plugin-organizer check-types && pnpm --filter desktop build`
- Files/commits affected: `6b121ea`; packages/grid-window-prototype/docs/dev_log.md; docs/workflow/roadmap/xai-g0-window-spike.md; docs/workflow/roadmap/xai-v1.autorun-20260519.md

## Entry 8

- Feature: click-through-matrix
- Gate: G0
- Deferred gate: Real macOS click-through matrix
- Why deferred: The acceptance requires observing Finder/Desktop hit-testing and React pointer behavior in real Tauri windows with `macOSPrivateApi=true` and `false`.
- Risk: G0 cannot reach Go/Conditional Go until this evidence exists.
- What was done instead: Created the evidence matrix template and avoided changing window constants or Tauri config without live proof.
- Later human action: Run `pnpm --filter desktop tauri dev`, fill the matrix, and attach screenshots/logs under `docs/reviews/window-ground-truth/click-through-matrix/`.
- Suggested verification command / environment: `pnpm --filter desktop tauri dev` on macOS with Finder/Desktop visible; compare `macOSPrivateApi=true` and `false`.
- Files/commits affected: docs/reviews/window-ground-truth/click-through-matrix/README.md; packages/click-through-matrix/docs/*; commit pending

## Entry 9

- Feature: finder-dnd-path
- Gate: G0
- Deferred gate: Real Finder DnD path-first matrix
- Why deferred: The acceptance requires real Finder drag/drop payloads for file, folder, App bundle, and alias in a Tauri Grid window.
- Risk: G0 cannot prove the path-first drop model until this evidence exists.
- What was done instead: Created the evidence matrix template and avoided changing Webview/native drop behavior without observed runtime results.
- Later human action: Run `pnpm --filter desktop tauri dev`, drop Finder items into a Grid, and attach logs/screenshots under `docs/reviews/window-ground-truth/finder-dnd-path/`.
- Suggested verification command / environment: `pnpm --filter desktop tauri dev` on macOS with Finder; use file, folder, `.app`, and alias drops.
- Files/commits affected: docs/reviews/window-ground-truth/finder-dnd-path/README.md; packages/finder-dnd-path/docs/*; commit pending
