# desktop-overlay-host-v2 - Test Plan

## Validation Goals

- confirm overlay-v2 can be introduced without changing the default host
- confirm legacy asset reuse is bounded to audited keep/refactor decisions
- confirm the docs and future build treat `commands/window.rs` as dormant today, then re-register it explicitly rather than assuming it is already live
- confirm overlay-specific commands and capabilities stay disabled in normal mode
- confirm `OrganizerLayer.tsx` is not reused as-is for row `#19` and that any extracted seam stays separate from rows `#20` and `#21`
- confirm host config remains host-owned and does not absorb organizer/local-first data
- confirm overlay-specific UX risks are separated into repo-side and real-macOS evidence

## Contract Checks

- `apps/desktop/src-tauri/src/app_config.rs`
  - host config adds mode gating without taking business data ownership
- `apps/desktop/src-tauri/src/lib.rs`
  - normal startup remains unchanged unless overlay mode is explicitly enabled
  - if row `#19` activates window commands, the same change also registers the related state managers
- `apps/desktop/src-tauri/src/commands/window.rs`
  - current source truth is dormant until `lib.rs` re-registers it
  - after row `#19` activation, overlay commands fail closed in normal mode and succeed only in overlay mode
- `apps/desktop/src-tauri/capabilities/*.json`
  - default runtime stays `main`-only unless overlay mode is active
- `packages/plugin-organizer/manifest.json`
  - declared windows/commands stay aligned with actual gated runtime loading
- `packages/plugin-organizer/src/OrganizerLayer.tsx`
  - row `#19` either leaves it untouched or extracts only a thinner orchestration seam; it must not become implicit Smart Container or organizer-restoration work
- `packages/core/src/types/events.ts` and organizer event callers
  - payloads remain typed and mode-safe

## Recommended Automated Gates

- `pnpm --filter @repo/plugin-organizer test`
- `pnpm --filter @repo/plugin-organizer check-types`
- `pnpm --filter @repo/plugin-ai-cube test`
- `pnpm --filter @repo/plugin-ai-cube check-types`
- `pnpm --filter @repo/plugin-console test`
- `pnpm --filter @repo/plugin-console check-types`
- `pnpm --filter desktop build`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`

If overlay-v2 introduces new host-only tests, they should stay narrowly scoped to:

- mode config migration/defaulting
- dormant-command to registered-command transition in `lib.rs`
- overlay-disabled command errors
- startup branch selection
- `OrganizerLayer` seam extraction boundaries if row `#19` touches that file

## Manual Desktop Verification

### Normal mode regression check

- launch desktop app with default config
- confirm only the normal main window starts
- confirm no transparent overlay, control window, or grid windows appear
- confirm existing Phase 2/3 host behavior still works

### Overlay-v2 mode check

- explicitly switch to overlay mode
- if the implementation requires restart for command registration/startup branching, verify the restart path explicitly
- confirm main overlay, control surface, and grid windows only appear in overlay mode
- confirm dormant grid/console commands become intentionally callable only after the overlay-capable build wiring lands
- confirm exiting back to normal mode leaves the overlay inactive on next startup

### Transparent / focus safety

- verify pointer click-through only applies to overlay mode
- verify there is an obvious recovery path if focus/pointer interaction becomes confusing
- verify control/grid windows remain interactable without trapping focus

### Multi-monitor and monitor-change safety

- create and move grid windows across monitors
- verify placement clamps to visible work areas
- verify relaunch after monitor topology change keeps windows visible
- verify folded/edge-snapped grids still behave correctly

### Data-access boundary checks

- verify overlay mode does not trigger blanket filesystem reads
- verify drag-drop/bookmark flows remain user initiated
- verify organizer/local-first data persists through existing package-owned seams, not host config

## Regression Policy

- if normal mode regresses, stop and fix host gating before reactivating overlay assets further
- if command re-registration lands without explicit `OVERLAY_MODE_DISABLED` handling, stop and fix that contract before accepting the row
- if overlay mode requires new desktop-level/window-level constants, classify as manual-risk and verify on real hardware before ship
- if existing overlay assets violate host/core/plugin boundaries, refactor the seam before reusing more behavior
- if `OrganizerLayer.tsx` starts absorbing Smart Container or organizer-restoration work, stop and push that scope back to rows `#20` and `#21`

## Mock Strategy

- mock unstable legacy plugin dependencies where needed rather than deepening runtime coupling during early phases
- prefer host-mode/unit tests over end-to-end overlay automation for focus/click-through behavior
- reuse organizer/package tests for layout and event semantics before adding new integrated overlay harnesses

## Acceptance Rules

- normal mode remains the default and shows no overlay startup regression
- overlay lifecycle commands are mode-gated and explicit about disabled-mode failures
- host config remains narrowly scoped
- every reused legacy asset has a documented keep/refactor/drop disposition
- the plan and future build explicitly agree on when `commands/window.rs` changes from dormant source to registered runtime surface
- `OrganizerLayer.tsx` has an explicit refactor/defer boundary that keeps row `#19` separate from rows `#20` and `#21`
- real-macOS residuals for transparent/focus/multi-monitor behavior are explicitly recorded before ship
