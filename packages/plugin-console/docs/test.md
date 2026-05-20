# Plugin Console Test Notes

## Current Gate

- `pnpm --filter @repo/plugin-console check-types`

## Manual Coverage

- Navigate default sidebar entries.
- Register additional nav items through `PluginSlotRegistry`.
- Open Cmd+K, search mock entities, and execute actions.
- Mark notifications read and delete notifications.
- Convert a mock grid item into a task draft with `gridItemToTask`.
