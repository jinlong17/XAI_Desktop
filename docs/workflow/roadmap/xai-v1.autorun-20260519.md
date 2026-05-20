# XAI v1 Autorun Log — 2026-05-19

## Run Contract

- Executor: Codex serial inline conductor.
- Started: 2026-05-19 14:27 PDT.
- Stop deadline: 2026-05-20 14:27 PDT.
- Ship policy: do not run `ship`; do not push.
- Dispatch policy: no Claude Agent View, no bg, no spawn; one feature at a time.
- Source of truth read before work: roadmap prompts, Workflow V2 usage guide, SOP_NEW_FEATURE, SUBAGENT_WORKFLOW_V2, execution README, BACKLOG-v1, contracts README, and G0 execution pack.

## Current State

| Field | Value |
|---|---|
| Current Gate | G0 — partial human evidence |
| Gate Manifest | docs/workflow/roadmap/xai-g0-window-spike.md |
| Current Feature | click-through-matrix / finder-dnd-path |
| Feature Source | docs/planning/execution/G0-window-spike.md §G0.3, §G0.4 |
| Feature Status | PARTIAL_HUMAN_EVIDENCE / BLOCKED |
| Current Commit | 18b48da |
| Tests | `pnpm --filter desktop exec tsc --noEmit`; `pnpm --filter @repo/plugin-organizer check-types`; `pnpm --filter desktop build`; user manual evidence for click-through, resize, item click flash, Finder file/folder drag, and `.app` path |
| Next Step | Rerun `.app` after `18b48da`, capture alias payload, and compare `macOSPrivateApi=false` |

## Checkpoints

### 2026-05-19 14:27 PDT — Start

- Read required workflow and roadmap source files.
- Confirmed current authoritative roadmap entry is G0-G10 execution packs, not old Sync/Console/Web sub-PRDs.
- `git status --short` showed pre-existing unrelated modified/untracked files. These will not be reverted or cleaned.
- No existing G0 manifest or `window-ground-truth` package/docs were present.
- Initialized `docs/workflow/roadmap/xai-g0-window-spike.md`.
- Manifest review is deferred because this is unattended mode; recorded in deferred gates.
- Selected first eligible low-risk task: `window-ground-truth` (G0.1).

### 2026-05-19 14:35 PDT — Feature Checkpoint: window-ground-truth

- Completed Step 0, feature-plan, inline feature-review, build, and inline feature-verify for `window-ground-truth`.
- Created branch `spike/window-ground-truth`.
- Created evidence README with sanitized machine/display facts.
- Committed build docs as `3b571f6 docs(window-ground-truth): Phase 1 — add G0 evidence anchor`.
- Verification passed for G0.1 acceptance:
  - `git branch --show-current` -> `spike/window-ground-truth`
  - `sw_vers` -> macOS 26.4 build 25E246
  - README includes machine model, macOS version, display count, and test date
- Status: READY_TO_SHIP.
- Deferred gates recorded: manifest review, cross-vendor review, cross-vendor verify.

### 2026-05-19 14:36 PDT — Next Feature: grid-window-prototype

- Continuing within G0 because the execution pack is explicit and G0.2 can use the local READY_TO_SHIP evidence anchor from G0.1.
- Human ship for `window-ground-truth` remains deferred; no `ship` or `push` was run.
- Started Step 0 and feature-plan for `grid-window-prototype`.
- Planned implementation avoids new Tauri commands and reuses existing `create_grid_window(gridId, rect)`.

### 2026-05-19 14:40 PDT — Build Checkpoint: grid-window-prototype

- Added G0 fallback panel to `GridWindow.tsx` for Grid windows with no Organizer state.
- Fallback displays `gridId`, Tauri window label, rect/size, event count, and last scoped event.
- Scoped event uses `emitTo(currentWindow.label, "g0-grid-prototype:scoped-ping", payload)` and includes `gridId`.
- Added manual evidence instructions under `docs/reviews/window-ground-truth/grid-window-prototype/README.md`.
- Tests passed:
  - `pnpm --filter @repo/plugin-organizer check-types`
  - `pnpm --filter desktop build` (Vite chunk-size warning only)

### 2026-05-19 14:41 PDT — Feature Checkpoint: grid-window-prototype

- Completed Step 0, feature-plan, inline feature-review, build, and inline feature-verify for `grid-window-prototype`.
- Build commit: `6b121ea feat(grid-window-prototype): Phase 1 — add G0 fallback panel`.
- Verify checks passed:
  - `pnpm --filter @repo/plugin-organizer check-types`
  - `pnpm --filter desktop build` (Vite chunk-size warning only)
  - no diff in Tauri command, contracts, or EventMap paths
- Status: READY_TO_SHIP.
- Deferred gates recorded: human G0.1 ship, cross-vendor review, cross-vendor verify, and real Tauri alpha/beta runtime evidence.

### 2026-05-19 14:48 PDT — Stop Checkpoint

- Stop reason: no eligible next feature.
- G0.5 `spaces-multimonitor-matrix` depends on `click-through-matrix` and `finder-dnd-path`, both BLOCKED.
- G0.6 `mas-sandbox-dry-run` depends on `click-through-matrix` and `finder-dnd-path`, both BLOCKED.
- The run stopped before the 24h deadline because continuing would require real hardware/manual evidence that is explicitly recorded as deferred/blocking.

### 2026-05-19 15:00 PDT — User Override: Skip Manual Gates

- User instructed: "跳过,直接先继续往下开发".
- Interpretation: continue safe downstream prep, but do not claim G0 Go/Conditional Go and do not erase manual blockers.
- `spaces-multimonitor-matrix` started as safe prep only.

### 2026-05-19 15:02 PDT — Feature Checkpoint: spaces-multimonitor-matrix

- Created Step 0, discovery, design/api/test/dev_log, and manual matrix template.
- No production code or window behavior was changed.
- Status: BLOCKED because real Spaces/fullscreen/multi-display evidence is required.

### 2026-05-19 15:05 PDT — Feature Checkpoint: mas-sandbox-dry-run

- Created Step 0, discovery, design/api/test/dev_log, MAS notes, entitlement draft, and risk matrix.
- No Tauri config, Cargo feature, entitlement, capability, or production code was changed.
- Status: BLOCKED because real `macOSPrivateApi=false` and sandbox/private-API runtime evidence is required.

### 2026-05-19 15:06 PDT — G1 Safe-Prep Start

- G0 remains not Go/Conditional Go.
- User override allows continuing downstream, but production G1 implementation remains blocked by gate order.
- Initialized `docs/workflow/roadmap/xai-g1-native-foundation.md`.
- Started `window-command-contract` as docs/contract safe prep only.

### 2026-05-19 15:08 PDT — Feature Checkpoint: window-command-contract

- Created G1.1 Step 0, discovery, design/api/test/dev_log.
- Cross-checked target command names and error shape against `docs/contracts/tauri-commands-v0.md`.
- No production Rust/TS command code, capability, or contract source file was changed.
- Status: BLOCKED because G0 is not Go/Conditional Go.

### 2026-05-19 15:12 PDT — Feature Checkpoint: host-business-residuals

- Completed audit-only G1.6 feature.
- Created `docs/planning/execution/host-residuals.md`.
- Identified Host residuals: AI Cube, Settings panel/context, Grid creation control, sync tray bridge, Organizer-specific DnD provider, overlay status label, and G0 prototype fallback.
- No production code changed.
- Status: READY_TO_SHIP.

### 2026-05-19 15:18 PDT — Static Evidence Follow-Up: click-through-matrix and finder-dnd-path

- Filled static source-analysis findings into the G0.3 click-through matrix.
- Filled static source-analysis findings into the G0.4 Finder DnD matrix.
- Key G0.3 finding: click-through currently uses AppKit `setIgnoresMouseEvents_`; `macOSPrivateApi` affects transparent rendering risk, not the click-through API path itself.
- Key G0.4 finding: main-window Webview DnD is disabled, Grid-window DnD appears enabled, and no Rust/JS drop handler is present yet.
- Follow-up commit: `7a1b9dd docs(G0.3/G0.4): fill static code analysis into click-through + DnD matrices`.
- Status remains BLOCKED because the execution pack acceptance still requires real runtime evidence.

### 2026-05-19 15:24 PDT — Bugfix Checkpoint: grid-window-prototype New Grid routing

- User reported that clicking `+ New Grid` did not create a native Grid window.
- Startup log showed main-window configuration but no `create_grid_window` Rust command log, so the failure was in the frontend request/sync path before Rust.
- Patched ControlWindow to send `organizer:create-grid-request` directly to the `main` window with a `{ rect }` payload.
- Patched OrganizerLayer to listen to the documented contract event, retain a legacy listener, and use Tauri v2 runtime detection instead of relying on `window.__TAURI__`.
- Bugfix commit: `14e04c2 fix(grid-window): route new grid requests to main`.
- Verification passed:
  - `pnpm --filter @repo/plugin-organizer check-types`
  - `pnpm --filter desktop build` (Vite chunk-size warning only)
- Status: BLOCKED until human runtime confirmation proves the button now creates a native Grid window.

### 2026-05-19 15:32 PDT — Bugfix Checkpoint: control window layering

- User confirmed `create_grid_window` logs now appear, but reported the AI icon could not open settings or be dragged after Grid windows existed.
- Root cause: Grid windows were configured at desktop icon level +3, while the control window was at +1, so Grid windows could cover the AI cube/settings panel and intercept pointer input.
- Patched macOS control window level to desktop icon level +4 and added a startup log for the configured level.
- Bugfix commit: `01e5167 fix(control-window): keep ai cube above grids`.
- Verification passed:
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` (existing dead-code warnings only)
  - `pnpm --filter desktop build` (Vite chunk-size warning only)
- Status remains BLOCKED until human runtime confirmation proves the AI icon opens settings and drags above Grid windows.

### 2026-05-19 15:47 PDT — Bugfix Checkpoint: native control drag and direct create fallback

- User reported `+ New Grid` still did not generate in the latest runtime attempt and that AI icon movement area felt limited.
- Root cause: AI cube dragging was still DOM-local inside the 360x360 control window, and Grid creation still depended on main-window event/state sync before a native window was guaranteed.
- Patched AI cube dragging to move the native control window with physical cursor/window positions.
- Patched `+ New Grid` to generate a shared `gridId`, compute screen-relative placement from the control window position, notify main for Organizer state, and directly invoke `create_grid_window` with the same `gridId` as a no-duplicate fallback.
- Updated EventMap and `docs/contracts/events-v0.md` for optional `gridId`.
- Bugfix commit: `b8c34fe fix(control-window): drag natively and harden grid creation`.
- Verification passed:
  - `pnpm --filter @repo/plugin-organizer check-types`
  - `pnpm --filter @repo/core check-types`
  - `pnpm --filter desktop build` (Vite chunk-size warning only)
- Status remains BLOCKED until human runtime confirmation.

### 2026-05-19 20:25 PDT — Runtime Recovery Confirmation: grid-window-prototype

- User reported the runtime issues are fixed and committed.
- Reviewed new commits:
  - `7b7ff35 fix(window-runtime): unblock AI cube drag, grid window render, and silent IPC failures`
  - `f65a1b5 feat(control-window): live-resize, cascade spawn, focus-dismiss, clear-all UX`
  - `a33c74d fix(grid-window): use OS-native startDragging so grid moves freely across the full screen`
- Key fixes confirmed from commit messages and diff: missing Tauri window capabilities, GridWindow render crash from missing GridSystemProvider context, control-window transparent hit-test area, cascade spawn placement, and native Grid drag handoff.
- Verification passed:
  - `pnpm --filter desktop exec tsc --noEmit`
  - `pnpm --filter @repo/plugin-organizer check-types`
  - `pnpm --filter desktop build` (Vite chunk-size warning only)
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` (existing dead-code warnings only)
- `grid-window-prototype` status restored to READY_TO_SHIP. Independent review/verify gates remain deferred in `docs/workflow/roadmap/xai-v1.deferred-gates.md`.
- Continuing to G0.3 `click-through-matrix`.

### 2026-05-19 20:31 PDT — Feature Checkpoint: finder-dnd-path instrumentation

- Reconfirmed G0.3 `click-through-matrix` remains BLOCKED because no new real macOS hit-test evidence is available.
- Continued to G0.4 `finder-dnd-path` now that G0.2 Grid windows are runtime-confirmed.
- Added GridWindow G0 Finder DnD telemetry in `7e20ca8`.
- The telemetry listens for `tauri://drag-drop`, records `gridId`, paths, path-kind classification, source, position, and timestamp, then emits the existing `grid-window-file-drop` event.
- Verification passed:
  - `pnpm --filter desktop exec tsc --noEmit`
  - `pnpm --filter @repo/plugin-organizer check-types`
  - `pnpm --filter desktop build` (Vite chunk-size warning only)
- Status remains BLOCKED because file/folder/`.app`/alias payload observations require a real Finder drag/drop run.

### 2026-05-19 20:34 PDT — Feature Checkpoint: grid-shell-organizer-content

- Continued safe downstream prep under the user's skip/continue override.
- Started G1.2 `grid-shell-organizer-content` as docs-only boundary planning.
- Reviewed current Host/Organizer boundary:
  - `GridWindow.tsx` renders `SmartContainer` and owns update/close/toggle/drop/G0 telemetry wiring.
  - `plugin-organizer/src/index.ts` exposes public building blocks but no dedicated `OrganizerGridContent`.
- Created feature brief, discovery review, and package docs.
- No production source files changed.
- Status: BLOCKED because G0 is not Go/Conditional Go and G1.1 `window-command-contract` remains blocked.

### 2026-05-19 20:37 PDT — Feature Checkpoint: multi-grid-event-scope

- Continued safe downstream prep with G1.4 `multi-grid-event-scope`.
- Audited Grid event names across Host, `plugin-organizer`, `EventMap`, and `docs/contracts/events-v0.md`.
- Current implementation carries `gridId` on Grid window payloads, but still uses legacy names such as `grid-window-update`, `grid-update`, and `grid-delete`.
- Contract docs target `organizer:grid:*`; `packages/core/src/types/events.ts` still contains older hyphen-style organizer event names.
- Created feature brief, discovery review, and package docs.
- No production source files changed.
- Status: BLOCKED because production event migration must wait for G0/G1.1 and final DnD payload decisions.

### 2026-05-19 20:39 PDT — Feature Checkpoint: native-dnd-path-first

- Backfilled G1.3 `native-dnd-path-first` as safe prep only.
- Mapped current drop handling:
  - HTML5 `useFileDrop` emits file names, not real paths.
  - GridWindow G0 telemetry listens for `tauri://drag-drop` and records candidate real paths.
  - Organizer currently receives `paths: string[]`, not `DroppedFile[]`.
- Created feature brief, discovery review, and package docs.
- No production source files changed.
- Status: BLOCKED because G0.4 Finder path evidence and MAS sandbox decisions are still missing.

### 2026-05-19 20:41 PDT — Feature Checkpoint: grid-persistence

- Continued safe downstream prep with G1.5 `grid-persistence`.
- Audited current Organizer persistence:
  - storage key `xai-desktop-layout`
  - shape `PersistedLayout { grids, items }`
  - hydration/save/clear paths in `useGridSystem.tsx`
- Identified blockers: G1.1 window lifecycle commands and G2 Repository v0/localStorage migration direction.
- Created feature brief, discovery review, and package docs.
- No production source files changed.
- Status: BLOCKED because production repository persistence must wait for G1.1/G2.

### 2026-05-19 20:43 PDT — Stop Checkpoint: no eligible feature

- G1 manifest now has a terminal status for every G1 feature:
  - G1.1-G1.5: BLOCKED safe prep.
  - G1.6: READY_TO_SHIP audit-only.
- G0 remains not Go/Conditional Go because real click-through, Finder DnD, Spaces/multi-display, and MAS/sandbox evidence is missing.
- G2 is not eligible because G0 -> G1 -> G2 core risks must close in order.
- No `ship` or `push` was run.
- Stop reason: no remaining eligible feature can proceed without bypassing Gate order or doing production implementation against blocked prerequisites.

### 2026-05-19 21:07 PDT — Human Evidence Checkpoint: G0.3/G0.4 partial pass

- User reported G0.3 click-through manual result: clicking transparent areas all behaved normally and produced the expected reaction.
- User reported G0.4 Finder DnD manual result: items can be dragged into Grid.
- Recorded both as PARTIAL_HUMAN_EVIDENCE because the reports prove the main path is promising but do not yet cover every acceptance row.
- G0.3 still needs:
  - Grid item pointer behavior.
  - Grid resize handle pointer behavior.
  - `macOSPrivateApi=false` comparison.
- G0.4 still needs exact `[G0 Finder DnD] path-first drop` payloads for:
  - file
  - folder
  - `.app`
  - alias
- No production status was promoted to G0 Go/Conditional Go.

### 2026-05-19 21:21 PDT — Human Evidence + Bugfix: Finder duplicate drop

- User provided screenshot evidence for G0.4:
  - `Finder DnD` telemetry panel shows `source: tauri://drag-drop`.
  - File kind is `file`.
  - Observed file path: `/Users/lijinlong/Desktop/Jinlongsign I-140Page8.pdf`.
  - A folder (`AI_Desktop`) and the PDF file both appeared in the Grid, but each appeared twice.
- User completed additional G0.3 checks:
  - Grid resize handle can be dragged.
  - Clicking a file item flashes visually, proving pointer delivery to React; no further action is currently bound.
- Implemented duplicate-drop fix in `58c926d`:
  - GridWindow now uses Tauri path-first drop only.
  - Removed the HTML5 `useFileDrop` fallback from GridWindow.
  - Added Tauri drag enter/over/leave hover state and a 1-second duplicate payload guard.
- Verification passed:
  - `pnpm --filter desktop exec tsc --noEmit`
  - `pnpm --filter @repo/plugin-organizer check-types`
  - `pnpm --filter desktop build` (Vite chunk-size warning only)
- G0.3 remains BLOCKED until `macOSPrivateApi=false` comparison.
- G0.4 remains BLOCKED until file/folder post-fix rerun plus `.app` and alias payload evidence.

### 2026-05-19 21:56 PDT — Human Evidence + Bugfix: App bundle duplicate drop

- User reported file drops are normal after `58c926d`, but `.app` drops still duplicate.
- Screenshot evidence shows:
  - `source: tauri://drag-drop`
  - kind `app`
  - path `/Applications/TencentMeeting.app`
- Implemented Organizer-side path idempotency in `18b48da`:
  - normalizes dropped paths
  - skips paths already present in the target Grid
  - skips repeated `gridId + path` events received within 5 seconds
- Verification passed:
  - `pnpm --filter @repo/plugin-organizer check-types`
  - `pnpm --filter desktop exec tsc --noEmit`
  - `pnpm --filter desktop build` (Vite chunk-size warning only)
- G0.4 remains BLOCKED until `.app` is rerun after `18b48da` and alias payload evidence is captured.

## Feature Outcomes

| Feature | Gate | Status | Commit | Tests | Notes |
|---|---|---|---|---|---|
| window-ground-truth | G0 | READY_TO_SHIP | 3b571f6 | PASS: branch, sw_vers, README content | Deferred gates recorded in docs/workflow/roadmap/xai-v1.deferred-gates.md |
| grid-window-prototype | G0 | READY_TO_SHIP | 6b121ea + 14e04c2 + 01e5167 + b8c34fe + 7b7ff35 + f65a1b5 + a33c74d | PASS: desktop tsc; plugin-organizer check-types; desktop build; cargo check | Runtime fixed/confirmed; deferred review/verify gates recorded. |
| click-through-matrix | G0 | BLOCKED | 82ab268 + 7a1b9dd + e7fc4ab | PASS_PARTIAL: transparent-area click-through, Grid item pointer flash, resize-handle drag; BLOCKED: `macOSPrivateApi=false` evidence | Requires remaining human macOS private-API comparison. |
| finder-dnd-path | G0 | BLOCKED | 33627df + 7a1b9dd + 7e20ca8 + e7fc4ab + 58c926d + 18b48da | PASS_PARTIAL: file and `.app` paths observed via `tauri://drag-drop`; duplicate fixes applied; BLOCKED: post-dedupe app rerun plus alias payload evidence | Requires human Finder/Tauri path matrix payloads. |
| spaces-multimonitor-matrix | G0 | BLOCKED | 2fb6bac | PASS: matrix template exists; BLOCKED: real Spaces/fullscreen/multi-display evidence | Reached by user override; safe prep only. |
| mas-sandbox-dry-run | G0 | BLOCKED | 071a192 | PASS: MAS notes exist; BLOCKED: real sandbox/private-API evidence | Reached by user override; safe prep only. |
| window-command-contract | G1 | BLOCKED | 9c7b52f | PASS: safe-prep docs exist; BLOCKED: G0 not Go/Conditional Go | Reached by user override; no production code changed. |
| grid-shell-organizer-content | G1 | BLOCKED | eaae46e | PASS: safe-prep docs exist; BLOCKED: G0/G1.1 not ready | Reached by user override; no production code changed. |
| native-dnd-path-first | G1 | BLOCKED | 707a8d1 | PASS: DnD discovery docs exist; BLOCKED: G0.4/MAS evidence missing | Reached by user override; no production code changed. |
| multi-grid-event-scope | G1 | BLOCKED | a7d4803 | PASS: event audit docs exist; BLOCKED: G0/G1.1 not ready | Reached by user override; no production code changed. |
| grid-persistence | G1 | BLOCKED | dcf2750 | PASS: persistence discovery docs exist; BLOCKED: G1.1/G2 not ready | Reached by user override; no production code changed. |
| host-business-residuals | G1 | READY_TO_SHIP | c6dbd77 | PASS: residual audit doc exists; Host scan recorded | Audit-only safe prep. |

## Deferred Gates Summary

- Manifest review deferred for `xai-g0-window-spike`.
- Cross-vendor review and verify deferred for `window-ground-truth`.
- Human ship for `window-ground-truth` deferred while continuing local G0 tasks.
- Cross-vendor review/verify deferred for `grid-window-prototype`; runtime fix was confirmed by user and commits.
- Remaining macOS click-through matrix rows deferred for `click-through-matrix`; default-runtime click-through, item pointer, and resize evidence are positive.
- Remaining Finder DnD path matrix rows deferred for `finder-dnd-path`; file and `.app` path evidence is positive, duplicate fixes are in `58c926d` and `18b48da`, and alias/post-dedupe app evidence is still needed.
- Real Spaces/fullscreen/multi-display matrix deferred for `spaces-multimonitor-matrix`.
- Real MAS/private-API sandbox evidence deferred for `mas-sandbox-dry-run`.
- G1 production implementation deferred until G0 Go/Conditional Go.
- G1.2 production shell/content split deferred until G0 Go/Conditional Go and G1.1 implementation.
- G1.3 production DnD path-first implementation deferred until G0.4 and MAS evidence.
- G1.4 production event migration deferred until G0 Go/Conditional Go and G1.1 implementation.
- G1.5 production persistence deferred until G1.1 and G2 Repository v0.
- Cross-vendor review/verify deferred for `host-business-residuals`.

## Incidents Summary

- click-through-matrix blocked on `macOSPrivateApi=false` comparison after default-runtime partial pass.
- finder-dnd-path blocked on post-dedupe `.app` rerun and alias payload evidence after duplicate fixes.
- spaces-multimonitor-matrix blocked on real macOS Spaces/fullscreen/multi-display evidence.
- mas-sandbox-dry-run blocked on real sandbox/private-API evidence.
- window-command-contract blocked by G0 gate status.
- grid-shell-organizer-content blocked by G0/G1.1 gate status.
- native-dnd-path-first blocked by G0.4/MAS evidence.
- multi-grid-event-scope blocked by G0/G1.1 gate status.
- grid-persistence blocked by G1.1/G2 status.

## Final 24h Summary

Stopped on 2026-05-19 20:43 PDT because no remaining eligible feature can proceed without bypassing the required G0 -> G1 -> G2 order. Safe preparatory work now covers G0.5, G0.6, all G1 tasks, and static/instrumentation follow-up for G0.3/G0.4; no ship or push was run.

### Completed Features

- `window-ground-truth` — READY_TO_SHIP.
- `grid-window-prototype` — READY_TO_SHIP after runtime recovery.
- `click-through-matrix` — BLOCKED after partial human pass for transparent clicks, Grid item pointer, and resize drag.
- `finder-dnd-path` — BLOCKED after partial Tauri file/app path evidence and duplicate fixes.
- `spaces-multimonitor-matrix` — BLOCKED after safe prep.
- `mas-sandbox-dry-run` — BLOCKED after safe prep.
- `window-command-contract` — BLOCKED after safe prep.
- `grid-shell-organizer-content` — BLOCKED after safe prep.
- `native-dnd-path-first` — BLOCKED after safe prep.
- `multi-grid-event-scope` — BLOCKED after safe prep.
- `grid-persistence` — BLOCKED after safe prep.
- `host-business-residuals` — READY_TO_SHIP audit-only.

### READY_TO_SHIP Features

- `window-ground-truth`
- `grid-window-prototype`
- `host-business-residuals`

### BLOCKED Features

- `click-through-matrix`
- `finder-dnd-path`
- `spaces-multimonitor-matrix`
- `mas-sandbox-dry-run`
- `window-command-contract`
- `grid-shell-organizer-content`
- `native-dnd-path-first`
- `multi-grid-event-scope`
- `grid-persistence`

### Deferred Gates

- G0 manifest human review.
- Human ship for `window-ground-truth`.
- Cross-vendor review/verify for serial Codex-run features.
- Independent review/verify for `grid-window-prototype` runtime recovery commits.
- Remaining `macOSPrivateApi=false` click-through comparison for `click-through-matrix`.
- Remaining Finder DnD alias payload and post-dedupe `.app` duplicate check for `finder-dnd-path`; use the GridWindow telemetry panel/log.
- Real Spaces/fullscreen/multi-display matrix for `spaces-multimonitor-matrix`.
- Real MAS/private-API sandbox evidence for `mas-sandbox-dry-run`.
- G1 production implementation until G0 Go/Conditional Go.
- G1.2 shell/content production refactor until G1.1 is implemented.
- G1.3 DnD path-first implementation until G0.4 Finder evidence and MAS sandbox decision.
- G1.4 event migration until G1.1 is implemented and G0 DnD payload shape is settled.
- G1.5 persistence implementation until G2 Repository v0 is ready.
- Cross-vendor review/verify for `host-business-residuals`.

### Incidents

- Incident 1: `click-through-matrix` has default-runtime human pass but still lacks `macOSPrivateApi=false` comparison.
- Incident 2: `finder-dnd-path` has Tauri file/app path evidence and duplicate fixes, but still lacks post-dedupe app rerun plus alias payload.
- Incident 3: `spaces-multimonitor-matrix` cannot satisfy real Spaces/fullscreen/multi-display acceptance in unattended mode.
- Incident 4: `mas-sandbox-dry-run` cannot satisfy sandbox/private-API acceptance in unattended mode.
- Incident 5: `window-command-contract` production implementation is blocked until G0 is Go/Conditional Go.
- Incident 6: `grid-window-prototype` `+ New Grid` did not create a native window; resolved by runtime recovery commits.
- Incident 7: `grid-window-prototype` AI cube/settings were covered by Grid windows; resolved by runtime recovery commits.
- Incident 8: `grid-window-prototype` still failed to generate and AI cube movement was bounded; resolved by runtime recovery commits.
- Incident 9: `grid-shell-organizer-content` production split is blocked by G0/G1.1.
- Incident 10: `multi-grid-event-scope` production event migration is blocked by G0/G1.1.
- Incident 11: `native-dnd-path-first` production DnD is blocked by G0.4/MAS evidence.
- Incident 12: `grid-persistence` production persistence is blocked by G1.1/G2.

### Commits

- `3b571f6` — `docs(window-ground-truth): Phase 1 — add G0 evidence anchor`
- `c3b29b0` — `docs(window-ground-truth): record verify pass`
- `6b121ea` — `feat(grid-window-prototype): Phase 1 — add G0 fallback panel`
- `4ea65ec` — `docs(grid-window-prototype): record verify pass`
- `82ab268` — `docs(click-through-matrix): block on manual hit-test evidence`
- `33627df` — `docs(finder-dnd-path): block on Finder drop evidence`
- `2fb6bac` — `docs(spaces-multimonitor-matrix): block on Spaces evidence`
- `071a192` — `docs(mas-sandbox-dry-run): block on sandbox evidence`
- `9c7b52f` — `docs(window-command-contract): block G1 prep on G0`
- `c6dbd77` — `docs(host-business-residuals): audit Host business logic`
- `7a1b9dd` — `docs(G0.3/G0.4): fill static code analysis into click-through + DnD matrices`
- `14e04c2` — `fix(grid-window): route new grid requests to main`
- `01e5167` — `fix(control-window): keep ai cube above grids`
- `b8c34fe` — `fix(control-window): drag natively and harden grid creation`
- `7b7ff35` — `fix(window-runtime): unblock AI cube drag, grid window render, and silent IPC failures`
- `f65a1b5` — `feat(control-window): live-resize, cascade spawn, focus-dismiss, clear-all UX`
- `a33c74d` — `fix(grid-window): use OS-native startDragging so grid moves freely across the full screen`
- `6e8323e` — `docs(grid-window-prototype): record runtime recovery`
- `7e20ca8` — `feat(finder-dnd-path): add GridWindow drop telemetry`
- `cfc995c` — `docs(finder-dnd-path): record drop telemetry checkpoint`
- `eaae46e` — `docs(grid-shell-organizer-content): add safe prep boundary plan`
- `dc31014` — `docs(roadmap): record g1 shell prep checkpoint`
- `a7d4803` — `docs(multi-grid-event-scope): add safe prep event audit`
- `a78f72c` — `docs(roadmap): record g1 event-scope checkpoint`
- `707a8d1` — `docs(native-dnd-path-first): add safe prep discovery`
- `2039f72` — `docs(roadmap): record g1 dnd prep checkpoint`
- `dcf2750` — `docs(grid-persistence): add safe prep discovery`
- `d8a49b3` — `docs(roadmap): record g1 persistence checkpoint`
- `e7fc4ab` — `docs(g0-evidence): record partial manual runtime results`
- `e9a95ec` — `docs(roadmap): finalize g0 evidence checkpoint`
- `58c926d` — `fix(finder-dnd-path): prefer Tauri drop path in grid windows`
- `fafe818` — `docs(g0-evidence): record detailed manual runtime results`
- `18b48da` — `fix(finder-dnd-path): dedupe dropped paths per grid`

### Test Results

- `git branch --show-current` -> `spike/window-ground-truth`
- `sw_vers` -> macOS 26.4 build 25E246
- `pnpm --filter @repo/plugin-organizer check-types` -> PASS
- `pnpm --filter desktop build` -> PASS with Vite chunk-size warning
- `test -f docs/reviews/window-ground-truth/click-through-matrix/README.md` -> PASS
- `test -f docs/reviews/window-ground-truth/finder-dnd-path/README.md` -> PASS
- `test -f docs/reviews/window-ground-truth/spaces-multimonitor-matrix/README.md` -> PASS
- `test -f docs/reviews/window-ground-truth/mas-sandbox-dry-run/mas-sandbox-notes.md` -> PASS
- `test -f packages/window-command-contract/docs/dev_log.md && test -f docs/workflow/roadmap/xai-g1-native-foundation.md` -> PASS
- `test -f docs/planning/execution/host-residuals.md` -> PASS
- Host residual `rg` scan -> PASS, 23 source references recorded
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` -> PASS with existing dead-code warnings
- `pnpm --filter desktop exec tsc --noEmit` -> PASS
- `pnpm --filter @repo/core check-types` -> PASS
- `pnpm --filter desktop exec tsc --noEmit` after `58c926d` -> PASS
- `pnpm --filter @repo/plugin-organizer check-types` after `58c926d` -> PASS
- `pnpm --filter desktop build` after `58c926d` -> PASS with Vite chunk-size warning
- `pnpm --filter @repo/plugin-organizer check-types` after `18b48da` -> PASS
- `pnpm --filter desktop exec tsc --noEmit` after `18b48da` -> PASS
- `pnpm --filter desktop build` after `18b48da` -> PASS with Vite chunk-size warning
- G1.2 safe-prep file checks and Host/Organizer boundary `rg` scan -> PASS
- G1.3 safe-prep file checks and DnD path `rg` scan -> PASS
- G1.4 safe-prep file checks and event-scope `rg` scan -> PASS
- G1.5 safe-prep file checks and persistence/repository `rg` scan -> PASS
- User manual G0.3 transparent-area click-through report -> PASS_PARTIAL
- User manual G0.4 drag-into-Grid report -> PASS_PARTIAL

### Next Human Reading Order

1. `docs/workflow/roadmap/xai-v1.autorun-20260519.md`
2. `docs/workflow/roadmap/xai-v1.deferred-gates.md`
3. `docs/workflow/roadmap/xai-v1.incidents.md`
4. `docs/workflow/roadmap/xai-g0-window-spike.md`
5. `docs/workflow/roadmap/xai-g1-native-foundation.md`
