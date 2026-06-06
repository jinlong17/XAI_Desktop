# API Contract - xai-web-board-saved-filters

## Storage Key

```ts
const key = "xai_board_filter_by_id";
```

Registry entry:

```ts
{
  key: "xai_board_filter_by_id",
  codec: "json",
  default: {},
  schemaVersion: 1,
  owner: "xai-web-board-saved-filters",
  category: "module",
}
```

## Persisted Shape

```ts
type BoardFilterDueRange = "all" | "overdue" | "today" | "week";

interface SavedBoardFilter {
  labels: string[];
  members: string[];
  dueRange: BoardFilterDueRange;
}

type SavedBoardFilterById = Record<string, SavedBoardFilter>;
```

Rules:

- labels and members are stored as sorted unique string arrays
- `dueRange` defaults to `"all"` when invalid or absent
- an empty filter can be stored as the canonical empty shape
- malformed map entries are dropped during narrowing

## Runtime Conversion

Runtime uses the existing `FilterState` shape:

```ts
interface FilterState {
  labels: Set<string>;
  members: Set<string>;
  dueRange: "all" | "overdue" | "today" | "week";
}
```

`BoardWorkspacesModule` converts between the persisted array shape and
`FilterState` at the boundary. No board-core internal imports are permitted.

## Non-Contracts

- No named presets.
- No backend sync.
- No stale-id garbage collection on board delete.
