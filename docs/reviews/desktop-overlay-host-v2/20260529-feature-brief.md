# Feature Brief - desktop-overlay-host-v2

> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5 inline)
> Source: `docs/reviews/desktop-overlay-host-v2/20260528-roadmap-seed.md`
> Roadmap: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row `#19`

## Feature Title

Optional Desktop Overlay Host V2

## Canonical Name

`desktop-overlay-host-v2`

## Naming Rationale

The roadmap slug already matches the real job of this row:

- `desktop` keeps the work on the Tauri/macOS host on branch `dev`
- `overlay-host` makes this a host-shell reintroduction row, not organizer feature work by itself
- `v2` distinguishes the future optional overlay from the superseded pre-ADR-0011 default overlay runtime

## Motivation

ADR-0011 moved the desktop product to a normal-window React+Tauri+local-first app and demoted the transparent overlay stack to P3 Future. Since then, the repo has intentionally preserved reusable overlay/control/grid assets instead of deleting them:

- `apps/desktop/src-tauri/src/legacy_overlay.rs`
- `apps/desktop/src-tauri/src/platform/macos/window_ext.rs` `legacy_overlay`
- `apps/desktop/src-tauri/src/commands/window.rs` dormant grid/console command source
- `apps/desktop/src/windows/ControlWindow.tsx`
- `apps/desktop/src/windows/GridWindow.tsx`
- `packages/plugin-organizer/src/OrganizerLayer.tsx` main-window overlay orchestration
- `packages/plugin-organizer/src/*` multi-window organizer surface

What is still missing is a conservative re-entry plan that answers:

- which quarantined assets are still worth keeping, which need refactor, and which should not come back
- how an overlay host can be reintroduced without replacing the normal host or widening the default runtime
- whether and how dormant `commands::window::*` handlers return as an overlay-capable runtime surface under `hostMode`
- whether `OrganizerLayer.tsx` is reused directly, split into a thinner seam, or deferred to later organizer rows
- how to gate transparent/click-through/desktop-level behavior behind explicit config and safety checks
- how to keep host-owned window/config concerns separate from plugin-owned organizer data and UI logic

## Target Outcome

Produce an approved implementation plan that:

- reintroduces overlay mode only as an explicit optional host mode
- preserves the current normal app window as the default and primary host
- audits quarantined legacy overlay/control/grid assets with explicit keep/refactor/drop decisions
- states the current runtime truth that `commands/window.rs` is dormant until `lib.rs` re-registers it
- names the planned `hostMode`-gated re-registration path for grid/console commands and related state
- classifies `OrganizerLayer.tsx` explicitly so row `#19` does not absorb organizer-restoration scope
- introduces a host-owned mode gate/config seam before any overlay bootstrap returns
- defines security and UX guardrails for transparent click-through, focus behavior, permissions, multi-monitor placement, and data boundaries
- stops at `NEEDS_REVIEW` with `Suggested Next = feature-review`

## In Scope

- roadmap-row-#19 planning only for optional overlay host v2
- current host seam audit across:
  - `apps/desktop/src-tauri/src/lib.rs`
  - `apps/desktop/src-tauri/src/legacy_overlay.rs`
  - `apps/desktop/src-tauri/src/platform/macos/window_ext.rs`
  - `apps/desktop/src/main.tsx`
  - `apps/desktop/src/windows/ControlWindow.tsx`
  - `apps/desktop/src/windows/GridWindow.tsx`
  - `apps/desktop/src/windows/ConsoleWindow.tsx`
  - `packages/plugin-organizer/src/*`
- host-mode gating strategy:
  - default `normal`
  - explicit opt-in `overlay_v2`
  - host-owned persisted config and startup selection
- capability / command / event boundary plan for overlay-specific windows
- keep/refactor/drop matrix for reusable legacy assets
- explicit disposition for `packages/plugin-organizer/src/OrganizerLayer.tsx`
- explicit decision for dormant `commands::window::*` registration under `hostMode`
- executable test and manual verification plan for the future build

## Out of Scope

- changing the current default host away from the normal app window
- shipping overlay mode in this planning run
- row `#20` smart-container scope and row `#21` organizer-restoration scope beyond host planning needs
- mounting `OrganizerLayer.tsx` as-is in the normal host
- reopening the pre-ADR-0011 overlay product as the primary desktop surface
- silent reactivation of `control`, `grid_*`, or overlay commands on normal startup
- unrelated roadmap-row edits or ship actions

## Hard Constraints

- Overlay mode must stay optional. Normal window remains the default and primary host.
- Reused legacy assets must have explicit keep/refactor/drop decisions.
- Dormant `commands/window.rs` code must not be described as live runtime surface until `lib.rs` explicitly re-registers it.
- If row `#19` touches `OrganizerLayer.tsx`, it may only split host wiring from organizer business logic; smart-container and organizer-surface expansion stay with later rows.
- Host/business boundaries still apply:
  - host logic in `apps/desktop/src/` and `apps/desktop/src-tauri/`
  - business logic in plugin packages
  - plugin-to-plugin interaction through `@repo/core/events`
- Do not widen Tauri capabilities or window command access on the default runtime.
- Do not change desktop window-level constants casually; any overlay-level/window-level behavior needs real macOS hardware verification.
- Host config stays host-owned; plugin organizer data must not move into host config files.
- File-system access remains user-driven and bounded to existing bookmark/path flows, not blanket desktop scanning.

## Dependency Hints

- roadmap and seed:
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
  - `docs/reviews/desktop-overlay-host-v2/20260528-roadmap-seed.md`
- governing ADRs and shipped host/storage authority:
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - `docs/adr/0012-phase3-local-first-storage.md`
  - `docs/reviews/desktop-tauri-web-dist-normal-window/20260527-discovery-review.md`
  - `packages/desktop-tauri-web-dist-normal-window/docs/dev_log.md`
  - `packages/desktop-phase3-integrated-rc-gate/docs/dev_log.md`
- current host/config seams:
  - `apps/desktop/src-tauri/src/app_config.rs`
  - `apps/desktop/src-tauri/src/commands/mod.rs`
  - `apps/desktop/src-tauri/src/commands/window.rs`
  - `apps/desktop/src-tauri/capabilities/default.json`
- quarantined legacy assets:
  - `apps/desktop/src-tauri/src/legacy_overlay.rs`
  - `apps/desktop/src-tauri/src/platform/macos/window_ext.rs`
  - `apps/desktop/src/main.tsx`
  - `apps/desktop/src/windows/ControlWindow.tsx`
  - `apps/desktop/src/windows/GridWindow.tsx`
  - `packages/plugin-organizer/src/OrganizerLayer.tsx`
  - `packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts`
  - `packages/plugin-organizer/src/hooks/useGridWindow.ts`
  - `packages/plugin-organizer/src/useGridSystem.tsx`

## Acceptance Signal

- The plan names one recommended optional-host strategy and rejects default-host replacement.
- Every major quarantined overlay/control/grid asset is classified as keep, refactor, or drop-from-v2.
- The plan treats `commands/window.rs` as dormant today and explicitly states whether/how `lib.rs` re-registers it under `hostMode`.
- The plan gives `OrganizerLayer.tsx` an explicit refactor/defer decision that keeps row `#19` separate from rows `#20` and `#21`.
- The gating story is explicit: startup mode selection, config persistence, command/capability enablement, and UX exposure are all opt-in.
- Security/UX constraints are concrete enough for build/verify:
  - transparent click-through behavior
  - focus stealing avoidance
  - multi-monitor placement and monitor changes
  - data access boundaries
  - manual macOS verification requirements
