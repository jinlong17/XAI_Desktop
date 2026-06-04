# Design - xai-web-board-saved-filters

## Selected Model

Saved filters are a board UI preference, not Board entity data.

```text
xai_board_filter_by_id
  -> BoardWorkspacesModule narrows persisted map
  -> active board FilterState
  -> applyFilter(...) for Board/Table/Calendar/Timeline/Dashboard/Map/Planner
```

## User Behavior

1. User opens `/app/board`.
2. User chooses filter facets for the current board.
3. The filter immediately applies across Board views.
4. User switches boards; each board restores its own saved filter.
5. User presses Clear; the active board's saved filter resets to empty.

## UI Rules

- Keep the existing Filter popover shape.
- Clear remains the reset affordance.
- No separate Save button. Filter changes persist immediately.
- No named presets in this row.

## Ownership

- `@repo/plugin-web-board-views` owns `FilterState` and `applyFilter`.
- `@repo/plugin-web-board-workspaces` owns reading/writing saved board filter
  preference state.
- `@repo/plugin-web-storage` owns the registered storage key.
- `@repo/plugin-web-board-core` remains uninvolved; filter changes must not
  mutate `xai_boards_v2`.

## Future Work

- Named filter presets.
- Stale filter cleanup on board permanent delete.
- Backend sync/export inclusion for board UI preferences.
