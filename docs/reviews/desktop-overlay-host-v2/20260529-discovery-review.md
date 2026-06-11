# Discovery Review - desktop-overlay-host-v2

> Feature: `desktop-overlay-host-v2`
> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5 inline)
> Research mode: internal repo evidence only
> External research: No external research required

## 1. Problem Framing

The desktop app now ships as a normal-window Tauri host that wraps `apps/web`, while overlay-era assets were deliberately quarantined instead of removed. Repo truth today is split:

- active default host:
  - `apps/desktop/src-tauri/src/lib.rs` only boots `main`
  - `apps/desktop/src-tauri/capabilities/default.json` scopes permissions to `main`
  - `apps/desktop/src-tauri/src/platform/macos/window_ext.rs` applies standard-window behavior
- dormant overlay command surface:
  - `apps/desktop/src-tauri/src/commands/window.rs` still defines grid/console lifecycle handlers
  - `apps/desktop/src-tauri/src/lib.rs` does not register any `commands::window::*` handler in `invoke_handler`
  - `apps/desktop/src-tauri/src/lib.rs` also does not `manage(GridWindowsState)` or `manage(ConsoleWindowFrameState)`
- preserved future overlay assets:
  - `apps/desktop/src-tauri/src/legacy_overlay.rs` keeps inactive control-window bootstrap/state registration
  - `apps/desktop/src-tauri/src/platform/macos/window_ext.rs` `legacy_overlay` keeps the desktop-level transparent/click-through AppKit helpers
  - `apps/desktop/src/main.tsx` still contains the old multi-window hash router for `/#/control`, `/#/grid`, and `/#/console`
  - `apps/desktop/src/windows/ControlWindow.tsx` and `GridWindow.tsx` still drive overlay/control/grid UX
  - `packages/plugin-organizer` still owns the organizer window/event/layout logic, including `OrganizerLayer.tsx`

That means this row is not starting from zero. The real planning task is to decide how to reintroduce those assets safely without rebreaking ADR-0011 or silently widening the default runtime.

## 2. Repo Evidence

### 2.1 The default host is intentionally main-window-only

- `apps/desktop/src-tauri/src/lib.rs`
  - configures the `main` window as a standard app window
  - installs Phase 2 native adapters into `main`
  - does not call `legacy_overlay::bootstrap_control_window`
- `apps/desktop/src-tauri/capabilities/default.json`
  - `windows = ["main"]`
- `packages/desktop-tauri-web-dist-normal-window/docs/dev_log.md`
  - explicitly records that overlay/control/grid assets were quarantined and must not be deleted or reactivated by default

### 2.2 Reusable overlay assets still exist, but several need normalization

- host/runtime assets:
  - `apps/desktop/src-tauri/src/legacy_overlay.rs`
  - `apps/desktop/src-tauri/src/platform/macos/window_ext.rs` `legacy_overlay`
  - `apps/desktop/src-tauri/src/commands/window.rs`
  - `apps/desktop/src/main.tsx`
  - `apps/desktop/src/windows/{ControlWindow,GridWindow,ConsoleWindow}.tsx`
- plugin/business assets:
  - `packages/plugin-organizer/src/OrganizerLayer.tsx`
  - `packages/plugin-organizer/src/OrganizerGridContent.tsx`
  - `packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts`
  - `packages/plugin-organizer/src/hooks/useGridWindow.ts`
  - `packages/plugin-organizer/src/useGridSystem.tsx`
  - `packages/plugin-organizer/src/layoutStore.ts`

Important seams that still need refactor before safe reuse:

- `apps/desktop/src/main.tsx` and `ConsoleWindow.tsx` still import package sources directly instead of package public surfaces
- `ControlWindow.tsx` uses a dual path for grid creation:
  - emit to `main`
  - direct `invoke("create_grid_window")`
- `commands/window.rs` defines grid/console lifecycle commands and caller allowlists, but those handlers are dormant until `lib.rs` re-registers them and restores related state management
- `OrganizerLayer.tsx` still bundles main-window overlay orchestration, grid-window lifecycle hookup, control-window create-grid listeners, and file-drop forwarding into one organizer-owned component
- `plugin-organizer/manifest.json` still advertises overlay/control/grid windows and window commands as if the runtime were active by default

### 2.3 Current source truth: `commands/window.rs` is dormant, not live

- `apps/desktop/src-tauri/src/commands/mod.rs`
  - still compiles `pub mod window;`
- `apps/desktop/src-tauri/src/lib.rs`
  - does not include any `commands::window::*` entry in `invoke_handler`
  - does not `manage(GridWindowsState::default())`
  - does not `manage(ConsoleWindowFrameState::default())`
- current effect:
  - grid-window and console-window commands are dormant source code rather than an exposed runtime API
  - `ControlWindow.tsx` and `packages/plugin-organizer/src/hooks/useGridWindow.ts` describe a future invoke path that the current host does not expose

This revision therefore treats command reactivation as an explicit build-phase decision, not an already-live surface that merely needs hardening.

### 2.4 Host-owned config already has the right shape for conservative gating

- `apps/desktop/src-tauri/src/app_config.rs`
  - persists host-owned config in `app.path().app_config_dir()/app-config.json`
  - already owns:
    - `window.main`
    - `quick_open`
  - does not own organizer layout/entity data

This makes host-mode selection a natural host-owned extension point, as long as it stays separate from plugin layout/content data.

### 2.5 Phase 3 storage and repo-side readiness are already settled

- `docs/adr/0012-phase3-local-first-storage.md`
  - keeps live entity data in desktop-owned SQLite / app-data paths
  - keeps host config separate from live entity storage
- `packages/desktop-phase3-integrated-rc-gate/docs/dev_log.md`
  - confirms Phase 3 local-first/runtime surfaces are shipped and row `#19` is now unblocked

Overlay-v2 therefore should reuse local-first seams, not invent a parallel persistence plane.

## 3. Candidate Options

### Option A - Single desktop app with explicit host-mode gate and audited legacy adapters

Keep one desktop app and add a host-owned `hostMode` gate:

- default `normal`
- optional `overlay_v2`
- startup/bootstrap, capability exposure, and window commands all branch on that mode
- `commands::window::*` is explicitly re-registered in `lib.rs` together with `GridWindowsState` / `ConsoleWindowFrameState`, but the handlers fail closed unless `hostMode = overlay_v2`
- legacy overlay assets are reused only after explicit keep/refactor decisions

Pros:

- aligns with ADR-0011 because normal window stays the default
- reuses preserved overlay/control/grid work without deleting or duplicating it
- gives one clear place for config, menu/toggle exposure, and runtime safety checks
- lets build phase reactivate only the minimum overlay-specific host seams
- makes dormant commands an explicit, reviewable startup-surface change instead of an accidental side effect

Cons:

- needs careful capability and command gating so inactive overlay surfaces cannot leak into normal mode
- requires refactoring some preserved assets before reuse
- still depends on manual real-macOS verification for desktop-level/window-level behavior

### Option B - Replace the normal host with overlay again

Make the transparent overlay the primary/default host and demote the current normal window.

Pros:

- easiest path if judged only by legacy overlay familiarity

Cons:

- directly violates ADR-0011 and the roadmap row note
- risks regressions across current Phase 1/2/3 shipped behavior
- would reopen default-host, offline launch, and native polish assumptions already settled

### Option C - Separate experimental overlay app/path with duplicated shell ownership

Create a second desktop target or heavily duplicated frontend path for overlay mode.

Pros:

- isolates experimental overlay work from the default runtime

Cons:

- duplicates host ownership, routing, config, and packaging concerns
- increases drift risk between normal and overlay hosts
- defeats the value of the preserved quarantined assets already in this repo

## 4. Recommendation

Recommend Option A.

This is the only option that satisfies the roadmap row exactly:

- overlay comes back only as an opt-in future mode
- normal window remains the default and primary host
- preserved assets are reused deliberately, not blindly
- the build can stage host-mode gating before any overlay startup returns

Implementation note for build: because the Tauri `invoke_handler` is assembled in `lib.rs`, row `#19` should treat command revival as a startup-registration change plus runtime `hostMode` checks, not as a hidden assumption that the command surface is already active.

## 5. Keep / Refactor / Drop Matrix

### Keep

- `apps/desktop/src-tauri/src/legacy_overlay.rs`
  - keep as the bootstrap/state boundary for overlay-specific windows
- `apps/desktop/src-tauri/src/platform/macos/window_ext.rs` `legacy_overlay`
  - keep the existing desktop-level transparent/click-through helpers as the initial hardware-tested reference
- `apps/desktop/src/windows/GridWindow.tsx`
  - keep as the host shell for per-grid native windows
- `apps/desktop/src/windows/ControlWindow.tsx`
  - keep as the preview control-surface shell
- `packages/plugin-organizer/src/OrganizerGridContent.tsx`
  - keep as organizer-owned grid content and cross-window grid-state seam
- `packages/plugin-organizer/src/useGridSystem.tsx`
  - keep as organizer-owned layout/item business state
- `packages/plugin-organizer/src/layoutStore.ts`
  - keep as the persistence seam for organizer layout data

### Refactor Before Reuse

- `apps/desktop/src/main.tsx`
  - refactor from always-available legacy multi-route shell into an overlay-only route entry behind host-mode gating
- `apps/desktop/src/windows/ConsoleWindow.tsx`
  - refactor direct source import to package public surface and confirm whether console is even part of overlay-v2 scope
- `apps/desktop/src-tauri/src/commands/window.rs`
  - refactor from dormant source into an explicit overlay-capable runtime surface
  - re-register it in `lib.rs` together with `GridWindowsState` / `ConsoleWindowFrameState`
  - return an explicit overlay-disabled error unless `hostMode = overlay_v2`
  - narrow/create caller allowlists per active mode instead of relying on legacy assumptions
- `packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts`
  - refactor direct `listen`/`emit` usage toward the typed core event layer where practical
- `packages/plugin-organizer/src/hooks/useGridWindow.ts`
  - refactor command usage so grid lifecycle is mode-gated and typed for disabled-mode errors
- `packages/plugin-organizer/src/OrganizerLayer.tsx`
  - refactor before reuse; do not mount the component as-is for row `#19`
  - if overlay-v2 needs organizer-backed main-window coordination, split only the host/window orchestration seam from it
  - leave Smart Container expansion to row `#20` and full organizer-restoration/product reuse to row `#21`
- `packages/plugin-organizer/manifest.json`
  - refactor docs/runtime truth so overlay/control/grid declarations match actual gated loading behavior
- `apps/desktop/src/providers/DndProvider.tsx`
  - refactor assumptions so overlay/grid drag behavior stays isolated from the normal-window runtime

### Drop From Overlay-V2 Scope

- any default startup path that reboots overlay/control/grid windows from `lib.rs`
- any plan to replace the primary normal host
- any host-config attempt to persist organizer business data or desktop entity records
- the current duplicate control-window grid-creation path as a long-term design
  - overlay-v2 should converge on one authoritative create-flow, not event-plus-direct-command duplication

### OrganizerLayer decision

- Row `#19` does not reuse `packages/plugin-organizer/src/OrganizerLayer.tsx` as-is.
- Row `#19` may only mine it for a thinner orchestration seam if host-mode restoration needs one.
- Row `#20` remains Smart Container scope, and row `#21` remains the place for organizer-surface restoration once the host shell is ready.

## 6. Security and UX Constraints

### Transparent / click-through behavior

- `main` may only become transparent/click-through in explicit `overlay_v2` mode
- no click-through behavior may leak into normal mode
- overlay mode must expose a deterministic recovery path if focus or pointer interaction becomes unusable

### Always-on-top / desktop-level behavior

- reuse the preserved AppKit/window-level logic first; do not invent new constants casually
- any changes to desktop icon window levels or spaces behavior require real macOS hardware verification before ship

### Focus and activation

- control/grid windows must not steal focus from normal mode when overlay mode is disabled
- overlay mode needs explicit focus/open/close expectations for:
  - control window open
  - grid creation
  - grid drag/move
  - returning focus to normal browsing/work

### Multi-monitor

- all overlay/grid placement must clamp to the active monitor set
- monitor topology changes must degrade safely:
  - unplugging a monitor
  - changing scale factor
  - changing work-area bounds
- `applyNativeEdgeSnap` and host-owned window-state normalization should be treated as the existing seam, not bypassed

### Data access boundaries

- host config persists host mode and host window state only
- organizer layout/content remains plugin-owned and local-first
- file access remains user-initiated through existing drag-drop/bookmark flows
- overlay-v2 must not gain blanket desktop scanning or unrelated account/session access

## 7. Recommended Phase Outline For Feature-Build

### Phase 1 - Asset and contract normalization

- freeze the keep/refactor/drop decisions in code-facing docs
- normalize direct-import violations in overlay-only shells
- record the dormant-command truth for `commands/window.rs`
- define host-mode config schema, overlay-disabled command error contract, and `OrganizerLayer.tsx` deferral boundary

### Phase 2 - Host-mode gate and startup wiring

- add persisted host-mode selection with default `normal`
- keep normal startup unchanged
- re-register `commands::window::*` plus `GridWindowsState` / `ConsoleWindowFrameState` in `lib.rs`
- only when `overlay_v2` is selected, route startup into legacy overlay bootstrap and overlay-specific window shells
- keep the re-registered command handlers fail-closed in `normal`

### Phase 3 - Capability, command, and event hardening

- add dedicated overlay capability/runtime checks
- gate grid/control/console lifecycle commands by active mode
- converge organizer overlay events onto typed/core-wrapped seams where practical
- if needed, split host/window orchestration out of `OrganizerLayer.tsx` without pulling Smart Container or organizer-product expansion into this row

### Phase 4 - Overlay safety and manual verification

- verify normal mode remains unchanged
- verify overlay-specific startup, focus, click-through, and multi-monitor behavior
- capture explicit real-macOS residuals before any ship decision

## 8. Risks and Open Questions

- `docs/SYSTEM_ARCHITECTURE.md` still documents the legacy overlay multi-window pattern as if it were the active default; build may need follow-up doc reconciliation after the host-mode contract is implemented.
- `@repo/plugin-ai-cube` is `In-Dev` in `docs/PLUGIN_MAP.md`; overlay-v2 should treat control-surface coupling conservatively and avoid deepening unstable dependencies without review.
- `plugin-organizer/manifest.json` currently advertises an always-on overlay/control/grid runtime that no longer matches startup truth; this mismatch must be corrected carefully during build.
- Console-window restoration is still a scope decision, but that decision now sits on top of explicit dormant-command truth instead of an assumed live command surface.
