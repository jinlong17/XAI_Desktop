# plugin-ai-cube Design

## Selected Option

Option B from the discovery review: register `plugin-ai-cube` statically and let the plugin own a single control-surface widget for the control window. Host keeps only shell concerns (native window size/focus, organizer bridge callbacks, settings adapter injection); business UI moves into `packages/plugin-ai-cube/`.

## Review Doc Path

`docs/reviews/plugin-ai-cube/20260521-discovery-review.md`

## Review Date / Version

2026-05-21 · v1

## Naming Rationale

- Workflow target stays `plugin-ai-cube` because this feature maps 1:1 to the existing business package and manifest owner.
- The feature title emphasizes the F2 outcome: turning the package into the real control-surface owner, not just a mock conversation library.

## Frozen Assumptions

1. Phase 0–3 behavior remains tray-first per PRD §5.8; any conversation UI is preview-only and must not imply real AI is enabled.
2. Host may keep `SettingsContext` temporarily, but only as a shell-side adapter source. `plugin-ai-cube` must not import Host context directly.
3. `plugin-organizer` integration in F2 stays limited to existing create-grid / clear-all bridges. No F3 grid redesign, `OrganizerLayer`, or `useMultiWindowGrids` migration is pulled in.
4. `@repo/ui` token/icon consumption is allowed as a same-wave dependency on F1; no new shared design system work is reopened here.
5. Static import registration is required; no runtime plugin discovery or dynamic loading is introduced.

## Dependency Overview

### Upstream

- `@repo/ui` token / icon baseline from F1
- `@repo/core` registry and typed event primitives
- Existing Host shell callbacks for control window sizing, blur-dismiss, and organizer bridge
- Existing `@repo/core-data` repo adapters already used by `plugin-ai-cube`

### Downstream

- `apps/desktop/src/main.tsx` for static registration
- `apps/desktop/src/windows/ControlWindow.tsx` as control-window shell
- Real macOS manual verification for click vs drag behavior

## Implementation Snapshot (2026-05-21)

- Added `registerAiCubePlugin()` (`packages/plugin-ai-cube/src/register-plugin.ts`) and static registration in `apps/desktop/src/main.tsx`.
- `ControlWindow` now renders `ControlHost` via `AiCubeControlProvider`; Host retains only shell/window sizing/focus + organizer bridge callbacks.
- Control-surface business UI lives in `packages/plugin-ai-cube/src/control/ControlWidget.tsx` and consumes `@repo/ui/icons` + `@repo/ui/tokens`.
- Phase 0–3 preview guard is explicit (`PREVIEW_STATUS_TEXT`) and placeholder actions for clipboard/pomodoro/search remain disabled.

## Scope Boundary

### In Scope

- `plugin-ai-cube` control widget registration
- plugin-own control surface UI composition
- settings information architecture rewrite
- token/icon adoption for AI Cube visual refresh
- Host residual cleanup for `AiCube.tsx` / `SettingsPanel.tsx`

### Out of Scope

- Real LLM wiring / Phase 4 AI behavior
- Organizer grid redesign or organizer state refactor
- New typed event keys / protocol changes
- plugin-settings extraction
