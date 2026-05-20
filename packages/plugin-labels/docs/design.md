# Plugin Labels Design

## Scope

`@repo/plugin-labels` owns the local label entity, label store, and reusable React UI for selecting and displaying labels.

## Decisions

- Data access is hidden behind `DataAdapter<Label>`.
- `LocalStorageAdapter<Label>` is the mock-first default and can be replaced with a Repository adapter later.
- Consumers store label IDs, not embedded label snapshots.
- The package has no dependency on other in-development plugins.
