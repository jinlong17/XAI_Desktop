# Organizer — Test Plan

## Unit Coverage

- `SmartContainer`
  - header action visibility/state transitions
  - direct close affordance
  - fold/lock/view-mode toggles
  - local optimistic drag state vs. final rect commit
  - edge snap/hide behavior if implemented in plugin space
- `GridItem`
  - token/icon rendering by item kind
  - right-click menu entries for file/folder/app/url items
  - thumbnail fallback rendering
- `OrganizerGridContent`
  - menu wiring that does not mutate event payload shape
  - placeholder-to-thumbnail presentation flow
- `useMultiWindowGrids`
  - event coalescing budget
  - final committed rect propagation
- `useGridWindow`
  - invoke payload shapes stay aligned with `{ gridId, rect }` / `{ gridId }`
- thumbnail adapter/cache helper
  - cache keying
  - recoverable error fallback

## Contract Coverage

- Verify no event payload schema changes for:
  - `organizer:grid:update`
  - `organizer:grid:close`
  - `organizer:grid:file-drop`
  - `organizer:grid:ready`
  - `organizer:create-grid-request`
- Verify window command callers still invoke:
  - `create_grid_window({ gridId, rect })`
  - `update_grid_window({ gridId, rect })`
  - `close_grid_window({ gridId })`
- Verify finder client callers still invoke:
  - `reveal_in_finder({ input: { path } })`
  - `open_path({ input: { path } })`
  - `register_path_bookmark({ input: { path } })`
  - `clear_path_bookmark({ input: { path } })`
- Preserve bookmark-gated semantics in tests; do not replace them with weaker absolute-path-only mocks.
- If `generate_file_thumbnail` is approved, add contract tests that prove it is additive and does not mutate existing command signatures.

## Integration / Regression Coverage

- F3-P1 cleanup regression:
  - no G0 fallback panel
  - no Finder telemetry panel
  - no multi-window banner/count badge
  - no uncontrolled production `console.*` noise in organizer sources
- F3-P2 interaction regression:
  - grid-level menu includes rename/delete/lock/settings as planned
  - item-level menu includes reveal/open/remove and any approved task/tag actions
  - direct close affordance triggers existing close flow only
- F3-P3 multi-window regression:
  - active grid drag feels smooth
  - event volume stays within budget
  - final rect propagates cross-window on commit
  - `GridWindow.tsx` and `ControlWindow.tsx` still honor the live `{ gridId, rect }` contract
- F3-P4 thumbnail/edge regression:
  - placeholder renders before native thumbnail availability
  - image/PDF/video thumbnails upgrade correctly
  - edge snap/hide does not corrupt persisted rects

## Quantitative Acceptance Gates

- Move drag target:
  - `0` continuous cross-window emits during pointer move
  - `1` commit emit on drag stop
- Resize target:
  - commit-only preferred
  - if live feedback is required, throttle to `>= 120ms`
- Thumbnail loading must never block basic grid rendering.

## Mock Strategy

- Mock `@repo/ui/tokens` / `@repo/ui/icons` only where visual snapshots need stable references.
- Mock native thumbnail IPC in unit/component tests.
- Reuse existing finder bookmark mocks and real `finderClient` payload shapes.
- If host bridge callers are tested in isolation, mock `invoke` and `emitTo` without changing payload shapes.

## Manual Verification (real macOS hardware)

- Multi-grid drag/resize/collapse feels smooth on a real desktop.
- `ControlWindow` create-grid flow still spawns grids with the expected rect.
- `GridWindow` drag handoff still works with header capture and Finder bookmark registration.
- Edge snap/hide behaves correctly at each screen edge and restores cleanly.
- Image, PDF, and video thumbnails render with realistic previews.
- Finder drag-drop still registers authorized paths and does not regress reveal/open behavior.
