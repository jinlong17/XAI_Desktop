# Proposed Contract Changes: Console Desktop Linkage

## Need

Console actions need a typed path to request desktop behavior, especially creating a Todo from a desktop Grid item.

## Proposed Events

- `console:create-task-from-grid-item`
  - Payload: `{ item: GridItemSnapshot; task: GridItemTaskDraft }`
- `console:reveal-grid-item`
  - Payload: `GridItemSnapshot`
- `organizer:grid-item-selected`
  - Payload: `GridItemSnapshot`

## Proposed Shared Types

```ts
interface GridItemSnapshot {
  id: string;
  title: string;
  path?: string;
  kind: "file" | "folder" | "app" | "url" | "unknown";
  gridId?: string;
}
```

## Notes

Track B keeps these as local types and mock events until Track A owns the canonical event map.
