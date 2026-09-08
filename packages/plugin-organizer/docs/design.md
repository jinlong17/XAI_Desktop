# Organizer — Design Snapshot

## Selected Option

Adopt the F3 organizer polish plan as four bounded phases with explicit ownership:

1. `F3-P1` visual/debug cleanup in `OrganizerGridContent.tsx`, `SmartContainer.tsx`, `GridItem.tsx`, and `resize-handles.css`.
2. `F3-P2` action-information architecture in `SmartContainer.tsx`, `GridItem.tsx`, and organizer menu wiring.
3. `F3-P3` interaction smoothness in `SmartContainer.tsx`, `OrganizerLayer.tsx`, `useMultiWindowGrids.ts`, `useGridWindow.ts`, and host bridge callers `GridWindow.tsx` / `ControlWindow.tsx`.
4. `F3-P4` edge snap/hide plus real thumbnails through plugin UI files and an additive Rust thumbnail seam only.

## Review Doc Path

`docs/reviews/plugin-organizer/20260521-discovery-review.md`

## Review Date / Version

- 2026-05-21
- F3 revised planning pass (`Revise` mode after feature-review)

## Frozen Assumptions

- `plugin-organizer` remains the feature owner; host and Tauri changes are supporting seams only.
- Existing typed event payload shapes stay unchanged in F3.
- Existing window command payloads stay unchanged in F3:
  - `create_grid_window({ gridId, rect })`
  - `update_grid_window({ gridId, rect })`
  - `close_grid_window({ gridId })`
- Finder/open-path keeps the existing bookmark-gated `{ input: { path } }` semantics.
- `PersistedLayout` remains backward-compatible.
- `@repo/ui/tokens` and `@repo/ui/icons` are available for consumption in this workspace.
- Thumbnail work, if approved, is additive only and must not weaken existing command signatures or authorization rules.

## Dependency Overview

| Dependency | Status | F3 usage |
|---|---|---|
| `packages/plugin-organizer` | owner | SmartContainer, GridItem, OrganizerGridContent, OrganizerLayer, organizer hooks |
| `@repo/core/events` / `@repo/core/hooks` | Stable | existing cross-window event transport and invoke wrappers |
| `@repo/ui/tokens` | parent says shipped via F1 | colors, spacing, radius, motion, shadow, typography |
| `@repo/ui/icons` | parent says shipped via F1 | header actions, item affordances, menu icons |
| `react-draggable` | existing dep | container/window dragging only |
| `@dnd-kit/*` | existing dep | item/grid droppable interactions only |
| `apps/desktop/src/windows/GridWindow.tsx` | host bridge | provider wiring, Finder client injection, native drag handoff |
| `apps/desktop/src/windows/ControlWindow.tsx` | host bridge | create-grid caller using live `{ gridId, rect }` contract |
| `apps/desktop/src-tauri/src/commands/window.rs` | stable runtime seam | existing create/update/close lifecycle commands, unchanged payloads |
| `apps/desktop/src-tauri/src/commands/finder.rs` + `bookmarks.rs` | stable runtime seam | existing bookmark-gated reveal/open behavior, unchanged payloads |
| Quick Look Thumbnailing | gated candidate | additive native thumbnail command for image/PDF/video previews |

## Delivery Shape

| Phase | Primary outcome | Primary ownership |
|---|---|---|
| F3-P1 | remove debug shell residue and align baseline visuals to F1 tokens | organizer UI files only |
| F3-P2 | ship header/menu/GridItem information architecture | organizer UI files only |
| F3-P3 | reduce event spam and smooth drag/resize/fold flows | organizer hooks plus host bridge callers |
| F3-P4 | ship edge snap/hide and thumbnails with additive native seam | organizer UI plus additive Tauri command/docs seam |
