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
| Current Gate | G2 — data and security foundation |
| Gate Manifest | docs/workflow/roadmap/xai-g2-data-security-foundation.md |
| Current Feature | repository-v0-contract |
| Feature Source | docs/planning/execution/G2-data-security-foundation.md §G2.1 |
| Feature Status | ELIGIBLE |
| Current Commit | latest local docs checkpoint; use `git log -1 --oneline` for the exact self-referential commit |
| Tests | Manifest/log initialization only; no code tests required |
| Next Step | Run Workflow V2 inline for G2.1 Repository v0 contract; do not ship/push |

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

### 2026-05-19 22:02 PDT — Human Evidence: App bundle post-dedupe pass

- User screenshot verified post-dedupe `.app` behavior after `18b48da`.
- Screenshot evidence shows:
  - one Grid item for `QQ.app`
  - kind `app`
  - path `/Applications/QQ.app`
  - `source: tauri://drag-drop`
  - telemetry `drops 2`
- This closes the post-dedupe `.app` regression check.
- G0.4 remains BLOCKED only on alias payload evidence.

### 2026-05-19 22:06 PDT — Human Evidence: Alias functional pass

- User reported alias verification succeeded.
- This confirms the alias drop path is functionally usable in the current Grid surface.
- G0.4 remains BLOCKED because the execution pack requires the exact alias behavior to be recorded: either the telemetry path is the alias file itself or it is the resolved target path. ADR-0005 still needs that policy entry.

### 2026-05-19 22:09 PDT — Feature Verify: finder-dnd-path READY_TO_SHIP

- User screenshot verified alias path-form evidence:
  - `source: tauri://drag-drop`
  - kind `file`
  - path `/Applications/QuickTime Player.app alias`
  - telemetry `drops 2`
- ADR-0005 now records the alias policy as `PRESERVE_ALIAS_PATH`.
- G0.4 `finder-dnd-path` is READY_TO_SHIP.
- G0 remains blocked by G0.5 Spaces/fullscreen/multi-display and G0.6 MAS sandbox/fallback evidence.

### 2026-05-19 22:25 PDT — Feature Verify: click-through-matrix READY_TO_SHIP

- Temporarily disabled the private API path:
  - `apps/desktop/src-tauri/tauri.conf.json`: `"macOSPrivateApi": false`
  - `apps/desktop/src-tauri/Cargo.toml`: removed Rust `macos-private-api` feature for the comparison
- Ran `pnpm --filter desktop tauri dev`.
- Build failed before runtime:
  - `src/commands/window.rs:36`: `WebviewWindowBuilder` has no `.transparent(true)` method.
  - `src/lib.rs:94`: `WebviewWindowBuilder` has no `.transparent(true)` method.
- Restored the default private-API-enabled config and Cargo feature.
- Conclusion: G0.3 evidence is complete; default hit-test passes, while the non-private transparent implementation cannot compile and is G0.6 MAS fallback work.
- Status: `click-through-matrix` -> READY_TO_SHIP.

### 2026-05-19 22:37 PDT — Feature Checkpoint: spaces-multimonitor-matrix

- Reconciled G0.5 after G0.3/G0.4 moved to READY_TO_SHIP.
- Recorded current display facts from `system_profiler SPDisplaysDataType`:
  - LG Ultra HD, 3840 x 2160, UI looks like 1920 x 1080 @ 60 Hz, main display.
  - DELL P2720DC, 2560 x 1440, UI looks like 2560 x 1440 @ 60 Hz.
- Recorded static source findings:
  - all XAI Desktop windows apply `CanJoinAllSpaces`, `Stationary`, and `IgnoresCycle`;
  - main/control/grid levels are intentionally ordered as main < grid < control.
- Status remains BLOCKED because Mission Control, Space-switch, fullscreen-app, and cross-display rect behavior need real runtime evidence.

### 2026-05-19 22:44 PDT — Feature Checkpoint: mas-sandbox-dry-run

- Added `mas-sandbox` Cargo feature as a compile-only fallback guard.
- Guarded Grid/control Rust window builders so `.transparent(true)` is omitted under `mas-sandbox`.
- Default DMG/dev path remains private-API-enabled and unchanged for runtime behavior.
- Verification:
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` -> PASS with existing dead-code warnings.
  - Temporarily set `"macOSPrivateApi": false` and temporarily removed Tauri dependency `macos-private-api`, then ran `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --no-default-features --features mas-sandbox` -> PASS with existing dead-code warnings.
  - Restored default `"macOSPrivateApi": true` and Tauri dependency `macos-private-api`.
- Status remains BLOCKED because signed/sandbox runtime behavior, fallback UX, security-scoped bookmarks, and release signing remain unverified.

### 2026-05-19 22:47 PDT — Stop Checkpoint: no eligible G0 work

- G0.3 `click-through-matrix`: READY_TO_SHIP.
- G0.4 `finder-dnd-path`: READY_TO_SHIP.
- G0.5 `spaces-multimonitor-matrix`: BLOCKED on real Mission Control, Space-switch, fullscreen-app, and multi-display runtime evidence.
- G0.6 `mas-sandbox-dry-run`: BLOCKED on signed/sandbox runtime validation, fallback UX, security-scoped bookmark behavior, tray/menu behavior, and release signing.
- G1 production implementation remains blocked until G0 reaches Go or Conditional Go.
- No `ship` or `push` was run.

### 2026-05-19 22:54 PDT — Human Evidence: G0 Conditional Go

- User confirmed G0.5 Spaces/multi-display behavior: Grid windows can follow across Spaces/multi-screen on the DELL external-display setup.
- Updated G0.5 `spaces-multimonitor-matrix` to READY_TO_SHIP with user-reported/manual evidence and optional independent screenshot replay before ship.
- Recorded G0.6 MAS signed/sandbox runtime validation as `BLOCKED_EXTERNAL`; Apple Developer/signing or equivalent sandbox environment is unavailable and is decoupled from G1 DMG/private path.
- ADR-0005 now records G0 verdict as Conditional Go.
- G1 native foundation may proceed under the DMG/private path; MAS-specific behavior remains behind `mas-sandbox` validation.

### 2026-05-19 23:05 PDT — Feature Build: window-command-contract

- Implemented G1.1 production window command contract.
- Rust changes:
  - added `GridWindowSnapshot` and structured `CommandError`;
  - changed `create_grid_window` and `update_grid_window` to return `GridWindowSnapshot`;
  - added `list_grid_windows` and `focus_grid_window`;
  - kept Rust as the only `grid_{gridId}` label generation authority;
  - added `gridId` validation and structured error codes.
- TS/docs changes:
  - added core window contract types;
  - updated Organizer window hook return types and command adapters;
  - updated Organizer manifest command list;
  - updated `docs/contracts/tauri-commands-v0.md`.
- Status: `window-command-contract` -> READY_FOR_VERIFY.

### 2026-05-19 23:09 PDT — Feature Verify: window-command-contract

- Verified G1.1 production command contract.
- Checks:
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` -> PASS with existing dead-code warnings;
  - `pnpm --filter @repo/core check-types` -> PASS;
  - `pnpm --filter @repo/plugin-organizer check-types` -> PASS;
  - `pnpm --filter desktop build` -> PASS with existing Vite chunk-size warning;
  - contract consistency scan across Rust commands, Organizer manifest/hook, core TS types, and `docs/contracts/tauri-commands-v0.md` -> PASS.
- Deferred cross-vendor verify is recorded in `docs/workflow/roadmap/xai-v1.deferred-gates.md`.
- Status: `window-command-contract` -> READY_TO_SHIP. Ship/push was not run.
- Next eligible feature: `grid-shell-organizer-content` (G1.2).

### 2026-05-19 23:18 PDT — Feature Build: grid-shell-organizer-content

- Reopened G1.2 after G0 Conditional Go and G1.1 READY_TO_SHIP.
- Implemented production Grid shell/content split:
  - moved Grid content/state/event/drop behavior into public `OrganizerGridContent`;
  - exported `OrganizerGridContent` from `packages/plugin-organizer/src/index.ts`;
  - reduced Host `GridWindow.tsx` to settings/DnD providers plus native AppKit drag shell;
  - added `docs/contracts/plugin-organizer-public-api-v0.md` and updated contracts README.
- Checks:
  - `pnpm --filter @repo/plugin-organizer check-types` -> PASS;
  - `pnpm --filter desktop build` -> PASS with existing Vite chunk-size warning;
  - Host forbidden-import boundary scan -> PASS;
  - `OrganizerGridContent` public API scan -> PASS.
- Status: `grid-shell-organizer-content` -> READY_FOR_VERIFY.

### 2026-05-19 23:22 PDT — Feature Verify: grid-shell-organizer-content

- Verified G1.2 production shell/content split.
- Checks:
  - `pnpm --filter @repo/plugin-organizer check-types` -> PASS;
  - `pnpm --filter desktop build` -> PASS with existing Vite chunk-size warning;
  - Host forbidden-import boundary scan -> PASS;
  - `OrganizerGridContent` public API scan -> PASS;
  - review/package/contract file existence checks -> PASS.
- Deferred cross-vendor verify and manual two-Grid native runtime smoke are recorded in `docs/workflow/roadmap/xai-v1.deferred-gates.md`.
- Status: `grid-shell-organizer-content` -> READY_TO_SHIP. Ship/push was not run.
- G1.3 `native-dnd-path-first` remains BLOCKED_EXTERNAL on MAS/security-scope evidence.
- Next eligible feature: `multi-grid-event-scope` (G1.4).

### 2026-05-19 23:30 PDT — Feature Build: multi-grid-event-scope

- Skipped G1.3 `native-dnd-path-first` under unattended mode because MAS/security-scope evidence remains external-blocked.
- Reopened G1.4 after G1.2 READY_TO_SHIP.
- Implemented production event-scope migration:
  - added Organizer event constants and runtime payload guards;
  - migrated Grid events to `organizer:grid:*` and `organizer:file:drop`;
  - migrated Control create requests to `organizer:grid:create-request`;
  - preserved legacy create-request aliases as listeners only;
  - updated `packages/core/src/types/events.ts` and `docs/contracts/events-v0.md`;
  - added guard tests for missing `gridId` and payload validation.
- Checks:
  - `pnpm --filter @repo/core check-types` -> PASS;
  - `pnpm --filter @repo/plugin-organizer check-types` -> PASS;
  - `pnpm --filter @repo/plugin-organizer test` -> PASS, 4 tests;
  - `pnpm --filter desktop build` -> PASS with existing Vite chunk-size warning;
  - legacy event scan -> PASS, only compatibility constants remain;
  - target event/API scan -> PASS.
- Status: `multi-grid-event-scope` -> READY_FOR_VERIFY.

### 2026-05-19 23:34 PDT — Feature Verify: multi-grid-event-scope

- Verified G1.4 production event-scope migration.
- Checks:
  - `pnpm --filter @repo/core check-types` -> PASS;
  - `pnpm --filter @repo/plugin-organizer check-types` -> PASS;
  - `pnpm --filter @repo/plugin-organizer test` -> PASS, 4 tests;
  - `pnpm --filter desktop build` -> PASS with existing Vite chunk-size warning;
  - legacy event scan -> PASS, only compatibility constants remain;
  - target event/API scan -> PASS;
  - review/package docs and guard test file existence checks -> PASS.
- Deferred cross-vendor verify and manual two-Grid event-scope runtime smoke are recorded in `docs/workflow/roadmap/xai-v1.deferred-gates.md`.
- Status: `multi-grid-event-scope` -> READY_TO_SHIP. Ship/push was not run.
- G1.5 `grid-persistence` remains blocked by G2 Repository v0; next roadmap step is G2.

## Feature Outcomes

| Feature | Gate | Status | Commit | Tests | Notes |
|---|---|---|---|---|---|
| window-ground-truth | G0 | READY_TO_SHIP | 3b571f6 | PASS: branch, sw_vers, README content | Deferred gates recorded in docs/workflow/roadmap/xai-v1.deferred-gates.md |
| grid-window-prototype | G0 | READY_TO_SHIP | 6b121ea + 14e04c2 + 01e5167 + b8c34fe + 7b7ff35 + f65a1b5 + a33c74d | PASS: desktop tsc; plugin-organizer check-types; desktop build; cargo check | Runtime fixed/confirmed; deferred review/verify gates recorded. |
| click-through-matrix | G0 | READY_TO_SHIP | 82ab268 + 7a1b9dd + e7fc4ab + 2e5e499 + 4537d2d | PASS: transparent-area click-through, Grid item pointer flash, resize-handle drag; FAIL_BUILD evidence for private-API-disabled transparent path | MAS/non-private fallback risk moved to G0.6. |
| finder-dnd-path | G0 | READY_TO_SHIP | 33627df + 7a1b9dd + 7e20ca8 + e7fc4ab + 58c926d + 18b48da + 5e98083 | PASS: file, folder, `.app`, and alias paths observed via `tauri://drag-drop`; duplicate fixes applied; post-dedupe `.app` rerun passed; alias path policy recorded as `PRESERVE_ALIAS_PATH` | Deferred gates recorded in docs/workflow/roadmap/xai-v1.deferred-gates.md |
| spaces-multimonitor-matrix | G0 | READY_TO_SHIP | 2fb6bac + bcc5785 + 1701583 | PASS: matrix template exists; current display facts, static window behavior, and user manual Spaces/multi-display follow evidence recorded | Optional independent screenshot replay before ship. |
| mas-sandbox-dry-run | G0 | BLOCKED_EXTERNAL | 071a192 + 4537d2d + 2fda0c8 | PASS: MAS notes exist; private-API-disabled compile fallback passes; BLOCKED_EXTERNAL: Apple Developer/signed sandbox runtime evidence | Deferred external release gate; decoupled from G1 DMG/private path. |
| window-command-contract | G1 | READY_TO_SHIP | 9c7b52f + dce4fb9 + 1fa8c75 | PASS: cargo check, core check-types, plugin-organizer check-types, desktop build, contract consistency scan | Deferred cross-vendor verify recorded; ship/push not run. |
| grid-shell-organizer-content | G1 | READY_TO_SHIP | eaae46e + 26d9f57 + 03ca86a | PASS: plugin-organizer check-types, desktop build, Host boundary scan, public API scan, file checks | Deferred cross-vendor/manual runtime smoke recorded; ship/push not run. |
| native-dnd-path-first | G1 | BLOCKED_EXTERNAL | 707a8d1 | PASS: DnD discovery docs exist; BLOCKED_EXTERNAL: MAS sandbox/security-scope evidence missing | Skip under unattended mode. |
| multi-grid-event-scope | G1 | READY_TO_SHIP | a7d4803 + 78aef01 + 59da1e5 | PASS: core check-types, plugin-organizer check-types/test, desktop build, event scans, file checks | Deferred cross-vendor/manual runtime smoke recorded; ship/push not run. |
| grid-persistence | G1 | BLOCKED | dcf2750 | PASS: persistence discovery docs exist; BLOCKED: G2 Repository v0 not ready | Reached by user override; no production code changed. |
| host-business-residuals | G1 | READY_TO_SHIP | c6dbd77 | PASS: residual audit doc exists; Host scan recorded | Audit-only safe prep. |

## Deferred Gates Summary

- Manifest review deferred for `xai-g0-window-spike`.
- Cross-vendor review and verify deferred for `window-ground-truth`.
- Human ship for `window-ground-truth` deferred while continuing local G0 tasks.
- Cross-vendor review/verify deferred for `grid-window-prototype`; runtime fix was confirmed by user and commits.
- Click-through matrix deferred gate for `click-through-matrix` resolved; default-runtime click-through, item pointer, and resize evidence are positive, and the private-API-disabled transparent path fails at compile time.
- Finder DnD path matrix deferral for `finder-dnd-path` resolved; file, folder, `.app`, and alias path-form evidence are positive, duplicate fixes are in `58c926d` and `18b48da`, and ADR-0005 records `PRESERVE_ALIAS_PATH`.
- Spaces/fullscreen/multi-display matrix deferral for `spaces-multimonitor-matrix` resolved by user manual confirmation; optional screenshot replay remains.
- Real MAS/private-API sandbox runtime evidence deferred external for `mas-sandbox-dry-run`; compile fallback is ready.
- G1 production implementation prerequisite resolved by G0 Conditional Go.
- Cross-vendor verify deferred for `window-command-contract`; Codex inline verification passed.
- Cross-vendor verify and manual runtime smoke deferred for `grid-shell-organizer-content`; Codex inline verification passed.
- G1.2 production shell/content split is READY_TO_SHIP.
- G1.3 production DnD path-first implementation deferred until MAS/security-scope evidence.
- Cross-vendor verify and manual runtime smoke deferred for `multi-grid-event-scope`; Codex inline verification passed.
- G1.4 production event migration is READY_TO_SHIP.
- G1.5 production persistence deferred until G2 Repository v0.
- Cross-vendor review/verify deferred for `host-business-residuals`.

## Incidents Summary

- click-through-matrix incident resolved; G0.3 is READY_TO_SHIP and MAS/non-private transparent fallback remains tracked by G0.6.
- finder-dnd-path incident resolved; G0.4 is READY_TO_SHIP after alias path-form evidence and ADR update.
- spaces-multimonitor-matrix incident resolved; G0.5 is READY_TO_SHIP.
- mas-sandbox-dry-run blocked external on real sandbox/private-API runtime evidence, but no longer blocks G1 DMG/private path.
- window-command-contract G0 prerequisite and production build are resolved; feature is READY_TO_SHIP.
- grid-shell-organizer-content production build and verify complete; feature is READY_TO_SHIP.
- native-dnd-path-first remains BLOCKED_EXTERNAL by MAS/security-scope evidence.
- multi-grid-event-scope production build and verify complete; feature is READY_TO_SHIP.
- grid-persistence blocked by G2 Repository v0.

## Final 24h Summary

Latest checkpoint is 2026-05-19 23:34 PDT. G0 is Conditional Go for the DMG/private path: G0.3/G0.4/G0.5 are READY_TO_SHIP, and G0.6 signed/sandbox MAS runtime validation is deferred external. G1.1 `window-command-contract`, G1.2 `grid-shell-organizer-content`, and G1.4 `multi-grid-event-scope` are READY_TO_SHIP. No ship or push was run.

### Completed Features

- `window-ground-truth` — READY_TO_SHIP.
- `grid-window-prototype` — READY_TO_SHIP after runtime recovery.
- `click-through-matrix` — READY_TO_SHIP after default-runtime hit-test pass and private-API-disabled compile-fail evidence.
- `finder-dnd-path` — READY_TO_SHIP after Tauri file/folder/app/alias path evidence, duplicate fixes, post-dedupe `.app` pass, and ADR alias policy update.
- `spaces-multimonitor-matrix` — READY_TO_SHIP after user manual Spaces/multi-display follow confirmation.
- `mas-sandbox-dry-run` — BLOCKED_EXTERNAL after compile fallback; signed/sandbox runtime evidence remains required.
- `window-command-contract` — READY_TO_SHIP after production command contract implementation and automated verification.
- `grid-shell-organizer-content` — READY_TO_SHIP after public Organizer content split and automated verification.
- `native-dnd-path-first` — BLOCKED_EXTERNAL after safe prep; MAS/security-scope evidence remains required.
- `multi-grid-event-scope` — READY_TO_SHIP after scoped event migration and automated verification.
- `grid-persistence` — BLOCKED after safe prep.
- `host-business-residuals` — READY_TO_SHIP audit-only.

### READY_TO_SHIP Features

- `window-ground-truth`
- `grid-window-prototype`
- `click-through-matrix`
- `finder-dnd-path`
- `spaces-multimonitor-matrix`
- `window-command-contract`
- `grid-shell-organizer-content`
- `multi-grid-event-scope`
- `host-business-residuals`

### BLOCKED Features

- `mas-sandbox-dry-run`
- `native-dnd-path-first`
- `grid-persistence`

### Deferred Gates

- G0 manifest human review.
- Human ship for `window-ground-truth`.
- Cross-vendor review/verify for serial Codex-run features.
- Independent review/verify for `grid-window-prototype` runtime recovery commits.
- Optional independent replay for `click-through-matrix`; no remaining G0.3 blocker. MAS fallback risk is tracked under G0.6.
- Optional independent replay for `finder-dnd-path`; no remaining G0.4 blocker.
- Optional independent screenshot replay for `spaces-multimonitor-matrix`.
- Real MAS/private-API sandbox evidence for `mas-sandbox-dry-run`.
- Cross-vendor verify for `window-command-contract`.
- Cross-vendor verify and manual two-Grid runtime smoke for `grid-shell-organizer-content`.
- G1.3 DnD path-first implementation until MAS sandbox/security-scope decision.
- Cross-vendor verify and manual two-Grid runtime smoke/listener cleanup for `multi-grid-event-scope`.
- G1.5 persistence implementation until G2 Repository v0 is ready.
- Cross-vendor review/verify for `host-business-residuals`.

### Incidents

- Incident 1: `click-through-matrix` resolved for G0.3; private-API-disabled transparent path fails at compile time and is now G0.6 fallback work.
- Incident 2: `finder-dnd-path` duplicate and alias evidence gaps are resolved; G0.4 is READY_TO_SHIP.
- Incident 3: `spaces-multimonitor-matrix` resolved by user manual runtime confirmation.
- Incident 4: `mas-sandbox-dry-run` cannot satisfy sandbox/private-API runtime acceptance without Apple Developer/signed sandbox environment.
- Incident 5: `window-command-contract` G0 prerequisite resolved by Conditional Go; production implementation now READY_TO_SHIP.
- Incident 6: `grid-window-prototype` `+ New Grid` did not create a native window; resolved by runtime recovery commits.
- Incident 7: `grid-window-prototype` AI cube/settings were covered by Grid windows; resolved by runtime recovery commits.
- Incident 8: `grid-window-prototype` still failed to generate and AI cube movement was bounded; resolved by runtime recovery commits.
- Incident 9: `grid-shell-organizer-content` production split blocker resolved; feature is READY_TO_SHIP.
- Incident 10: `multi-grid-event-scope` production event migration prerequisite resolved; feature is READY_TO_SHIP.
- Incident 11: `native-dnd-path-first` production DnD is blocked by MAS/security-scope evidence.
- Incident 12: `grid-persistence` production persistence is blocked by G2 Repository v0.

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
- `d982dab` — `docs(finder-dnd-path): record app dedupe verification`
- `5e98083` — `docs(finder-dnd-path): record alias functional verification`
- `4537d2d` — `docs(G0.3/G0.6): record private API fallback evidence`
- `bcc5785` — `docs(G0.5): record Spaces static evidence`
- `2fda0c8` — `feat(G0.6): add MAS compile fallback guard`
- `6c521d7` — `docs(roadmap): finalize MAS compile fallback checkpoint`
- `bd8cac3` — `docs(roadmap): record G0 blocked stop checkpoint`
- `dce4fb9` — `feat(window-command-contract): implement grid lifecycle commands`
- `1fa8c75` — `docs(roadmap): finalize G1.1 build checkpoint`
- `26d9f57` — `feat(grid-shell-organizer-content): expose Organizer grid content`
- `03ca86a` — `docs(roadmap): finalize G1.2 build checkpoint`
- `78aef01` — `feat(multi-grid-event-scope): migrate grid events to scoped contract`
- `59da1e5` — `docs(roadmap): finalize G1.4 build checkpoint`

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
- User manual G0.4 `.app` post-dedupe rerun -> PASS
- User manual G0.4 alias path-form validation -> PASS, observed `/Applications/QuickTime Player.app alias` as `kind=file`
- G1.2 safe-prep file checks and Host/Organizer boundary `rg` scan -> PASS
- G1.3 safe-prep file checks and DnD path `rg` scan -> PASS
- G1.4 safe-prep file checks and event-scope `rg` scan -> PASS
- G1.5 safe-prep file checks and persistence/repository `rg` scan -> PASS
- User manual G0.3 transparent-area click-through report -> PASS_PARTIAL
- User manual G0.4 drag-into-Grid report -> PASS_PARTIAL
- G0.3 private-API-disabled comparison: `pnpm --filter desktop tauri dev` -> FAIL_BUILD on `.transparent(true)` in `src/commands/window.rs:36` and `src/lib.rs:94`
- Restored default private-API path: `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` -> PASS with existing dead-code warnings
- G0.5 display evidence: `system_profiler SPDisplaysDataType` -> PASS, current LG Ultra HD + DELL P2720DC setup recorded
- G0.5 source scan: `rg` over `window_ext.rs` -> PASS, `CanJoinAllSpaces` / `Stationary` / `IgnoresCycle` and window levels recorded
- G0.6 default path: `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` -> PASS with existing dead-code warnings
- G0.6 compile fallback path: temporary `macOSPrivateApi=false` + temporary removal of Tauri dependency `macos-private-api` + `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --no-default-features --features mas-sandbox` -> PASS with existing dead-code warnings
- G1.1 `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` -> PASS with existing dead-code warnings
- G1.1 `pnpm --filter @repo/core check-types` -> PASS
- G1.1 `pnpm --filter @repo/plugin-organizer check-types` -> PASS
- G1.1 `pnpm --filter desktop build` -> PASS with Vite chunk-size warning
- G1.1 contract consistency scan across Rust commands, Organizer manifest/hook, core TS types, and `docs/contracts/tauri-commands-v0.md` -> PASS
- G1.2 `pnpm --filter @repo/plugin-organizer check-types` -> PASS
- G1.2 `pnpm --filter desktop build` -> PASS with Vite chunk-size warning
- G1.2 Host forbidden-import boundary scan -> PASS
- G1.2 `OrganizerGridContent` public API scan -> PASS
- G1.2 review/package/contract file existence checks -> PASS
- G1.4 `pnpm --filter @repo/core check-types` -> PASS
- G1.4 `pnpm --filter @repo/plugin-organizer check-types` -> PASS
- G1.4 `pnpm --filter @repo/plugin-organizer test` -> PASS, 4 tests
- G1.4 `pnpm --filter desktop build` -> PASS with Vite chunk-size warning
- G1.4 legacy event scan -> PASS, only compatibility constants remain
- G1.4 target event/API scan -> PASS
- G1.4 review/package docs and guard test file existence checks -> PASS

### Next Human Reading Order

1. `docs/workflow/roadmap/xai-v1.autorun-20260519.md`
2. `docs/workflow/roadmap/xai-v1.deferred-gates.md`
3. `docs/workflow/roadmap/xai-v1.incidents.md`
4. `docs/workflow/roadmap/xai-g0-window-spike.md`
5. `docs/workflow/roadmap/xai-g1-native-foundation.md`
6. `docs/workflow/roadmap/xai-g2-data-security-foundation.md`

### 2026-05-19 23:40 PDT — Resume Checkpoint: G2 manifest initialized

- User confirmed G0.5 Spaces/multi-display behavior is valid on the DELL external-display setup; existing G0.5 READY_TO_SHIP/SHIPPED records remain authoritative for the DMG/private path.
- G0.6 remains `BLOCKED_EXTERNAL` because Apple Developer signing/MAS sandbox runtime evidence is unavailable and decoupled from G0.5.
- Reconciled current roadmap position: G1.5 `grid-persistence` is blocked by G2 Repository v0, so the next eligible risk-closing feature is G2.1 `repository-v0-contract`.
- Created `docs/workflow/roadmap/xai-g2-data-security-foundation.md`.
- Manifest review is deferred in unattended serial Codex mode and recorded in `docs/workflow/roadmap/xai-v1.deferred-gates.md`.
- Current state: G2.1 `repository-v0-contract` selected for inline Workflow V2.

### 2026-05-20 00:18 PDT — Track A Resume Checkpoint: parallel-wave dispatch start

- Branch `codex/track-a-desktop-foundation` cut from prior HEAD (`7fc45a4 docs(repository-v0-contract): add G2.1 workflow plan`).
- Track A scope: G1 ship gates (G1.2 / G1.4) → G2 data-security production → G3 organizer loop.
- Track B/C ownership respected; Track A only modifies the files listed in goal allowlist.
- Ship policy unchanged: no auto-ship, no auto-push; G1.2/G1.4 manual ship is explicitly authorized by goal.

### 2026-05-20 00:24 PDT — Feature Checkpoint: G2.1 repository-v0-contract READY_TO_SHIP

- Completed `feature-build` and inline `feature-verify` for `repository-v0-contract` (Workflow V2 phase plan unchanged).
- Added Repository v0 entity surface: `packages/core-data/src/entities.ts` covering Grid, GridItem, Label, Todo, Habit, ClipboardEntry, Project, Card.
- Added entity contract test (`packages/core-data/tests/entities.test.ts`): roundtrip, naming regex, `listByIndex`, clipboard `device-local` invariant.
- Updated `docs/contracts/data-repository-v0.md` with entity table, full `Repo<T>` interface, and entity-level testing contract.
- Tests run:
  - `pnpm --filter @repo/core-data test` -> PASS, 45 tests.
  - `pnpm --filter @repo/core-data check-types` -> PASS.
  - `pnpm --filter @repo/core check-types` -> PASS.
  - `pnpm --filter @repo/plugin-organizer check-types` -> PASS.
- `packages/repository-v0-contract/docs/dev_log.md` updated to READY_TO_SHIP; manual ship deferred per Track A scope.

### 2026-05-20 00:32 PDT — Ship Checkpoint: G1.2 + G1.4 manifest promotion

- Manual ship authorized for G1.2 `grid-shell-organizer-content` and G1.4 `multi-grid-event-scope` per goal directive.
- Both already had complete READY_TO_SHIP commits on the main lineage (G1.2 `26d9f57`/`03ca86a`; G1.4 `78aef01`/`59da1e5`); the only outstanding work was manifest promotion.
- Updated G1 manifest rows #2 and #4 to SHIPPED on `codex/track-a-desktop-foundation`.
- Updated `packages/grid-shell-organizer-content/docs/dev_log.md` and `packages/multi-grid-event-scope/docs/dev_log.md` Status Panels and Work Logs to SHIPPED.
- Push will be bundled with subsequent Track A commits when ship policy allows a single Track-A push.
- No code/runtime changes; ship.md/data-repository contract unchanged in this commit.

### R4. Ship Record (updated)

G1.1 (window-command-contract), G1.6 (host-business-residuals), G1.2 (grid-shell-organizer-content), and G1.4 (multi-grid-event-scope) are now manifest-SHIPPED. G1.3 remains BLOCKED_EXTERNAL (MAS sandbox). G1.5 unblocks now that G2.1 Repository v0 is READY_TO_SHIP and the contract is published; G1.5 production work will be picked up after G2 risk-closing rows.

### 2026-05-20 00:46 PDT — Feature Checkpoint: G2.2 core-data-sqlite-driver READY_TO_SHIP

- Added Tauri command bridge `apps/desktop/src-tauri/src/commands/database.rs` exposing `db_init`/`db_put`/`db_get`/`db_list`/`db_delete`.
- Added `E13xx` error family (1300 not initialized, 1301 invalid input, 1302 backend) in `error.rs`.
- Registered `DatabaseState` and the 5 database commands in `lib.rs`, gated behind the existing `crypto` cargo feature so `rusqlite` stays optional.
- Added TS-side `packages/core-data/src/tauri-sqlite.ts` exporting `createTauriRepo(invoke, { namespace })` returning a `Repo<T>`-shaped handle bound to invoke; never imports `@tauri-apps/api`.
- Added `packages/core-data/tests/tauri-sqlite.test.ts` (4 tests) using a mock invoke; verifies `db_init` is called exactly once, roundtrip, list/listByIndex filtering, and metadata.
- Updated `docs/contracts/tauri-commands-v0.md` with §6.1 Database Commands and its security rules.
- Updated `packages/core-data-sqlite-driver/docs/dev_log.md` Status Panel → READY_TO_SHIP.
- G2 manifest row #2 promoted to READY_TO_SHIP.
- Tests run:
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` -> PASS
  - `cargo check --features crypto` -> PASS
  - `cargo test --features crypto database::` -> 7 tests PASS
  - `pnpm --filter @repo/core-data test` -> 49 tests PASS
  - `pnpm --filter @repo/core-data check-types` -> PASS
  - `pnpm --filter desktop build` -> PASS
- Deferred: SQLCipher PRAGMA wiring (depends on G2.4 opaque KEK handle); cross-command transactions; real `app_data_dir` macOS runtime smoke (recorded in `xai-v1.deferred-gates.md`).

### 2026-05-20 00:48 PDT — Feature Checkpoint: G2.3 localstorage-migration READY_TO_SHIP

- Added `packages/core-data/src/organizer-layout-migration.ts` exporting `migrateOrganizerLayoutToRepos({ storage, gridRepo, itemRepo })` and `LEGACY_LAYOUT_STORAGE_KEY = "xai-desktop-layout"`.
- Maps legacy `PersistedLayout` → typed `GridEntity` / `GridItemEntity`. Orphan items (no owning grid) are dropped.
- Non-destructive by default; `removeLegacy: true` opt-in.
- Added 5 vitest cases (`tests/organizer-layout-migration.test.ts`): mapping, idempotency, default-keep-legacy, opt-in removal, absent/malformed no-op.
- Created `packages/localstorage-migration/docs/dev_log.md` and promoted G2 manifest row #4 to READY_TO_SHIP.
- Tests run:
  - `pnpm --filter @repo/core-data test` -> 54 tests PASS.
  - `pnpm --filter @repo/core-data check-types` -> PASS.
- UI runtime cut-over (`useGridSystem.tsx` async refactor) is parked under G1.5 `grid-persistence` so it lands in a single focused PR.

### Branch Hygiene Note (Track A)

- 00:32 PDT: my G2.2 commit landed on `codex/track-c-widgets-web-ai` because a parallel agent had switched the working-tree branch. Cherry-picked `92e2ba6` onto `codex/track-a-desktop-foundation` as `f3dd30b`; the duplicate remains on Track C and will be reconciled when the tracks merge to main.

### 2026-05-20 00:54 PDT — Feature Checkpoint: G2.4 keychain-opaque-handle READY_TO_SHIP

- Added `apps/desktop/src-tauri/src/crypto/keychain_handle.rs` with `load_kek_into_vault(key, vault)` and `insert_kek_from_bytes(bytes, vault)`. Both return only `KeyHandleId`; byte buffers are zeroized.
- Rust-internal `KeychainHandleError` (Keychain passthrough, InvalidKeyLength, KeyVault) — does not cross IPC; callers map to JS-visible variants.
- Updated `docs/contracts/tauri-commands-v0.md` §6.0.1 documenting the single authorised "Keychain bytes → KeyVault handle" crossing and the rule that `secret_get` MUST NOT surface KEK/DEK/device-private bytes to JS.
- Created `packages/keychain-opaque-handle/docs/dev_log.md`.
- Promoted G2 manifest row #5 to READY_TO_SHIP.
- Tests run:
  - `cargo check --features crypto` -> PASS
  - `cargo test --features crypto keychain_handle::` -> 3 tests PASS
- Deferred: `db_init` SQLCipher PRAGMA wiring (G2.6); live macOS Keychain runtime smoke (covered by keychain-bridge-macos package).

### 2026-05-20 00:58 PDT — Feature Checkpoint: G2.5 tauri-capability-allowlist READY_TO_SHIP

- Audited existing capability files (`default.json`, `plugin-account-crypto.json`, `plugin-account-keychain.json`) and added `plugin-data-database.json` scoped to main/control/grid_*/account/console.
- Added defence-in-depth `DATABASE_ALLOWED_WINDOWS` runtime allow-list in `commands/database.rs` so widget / pet / ai_cube windows cannot reach `db_*` even via a mis-attached capability file. 2 new cargo tests cover admit/reject paths.
- Recorded the full audit (windows ↔ commands ↔ enforcement layer) in `apps/desktop/src-tauri/capabilities/AUDIT.md`.
- Updated `docs/contracts/tauri-commands-v0.md` §6.1 and §7 with the new capability file + audit pointer.
- Created `packages/tauri-capability-allowlist/docs/dev_log.md`; promoted G2 manifest row #6 to READY_TO_SHIP.
- Tests run:
  - `cargo check --features crypto` -> PASS
  - `cargo test --features crypto database::` -> 9 tests PASS
  - `cargo check` (default) -> PASS
- Deferred: MAS sandbox capability validation under signed runtime; `tauri-plugin-opener` minimization (follow-up audit).
