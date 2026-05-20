# multi-grid-event-scope — API

## Production Contract

Production event constants live in `packages/plugin-organizer/src/gridEvents.ts` and are exported through `packages/plugin-organizer/src/index.ts`.

## Event Names

```ts
type OrganizerGridEvents = {
  "organizer:grid:ready": { gridId: string };
  "organizer:grid:state": {
    gridId: string;
    grid: GridBox;
    items: Record<string, DesktopItem>;
  };
  "organizer:grid:update": { gridId: string; changes: Partial<GridBox> };
  "organizer:grid:close": { gridId: string };
  "organizer:grid:create-request": {
    gridId?: string;
    rect: Rect;
    source?: "control" | "shortcut";
  };
  "organizer:file:drop": { gridId: string; files: DroppedFile[] };
};
```

## Runtime Guards

```ts
function hasGridId(payload: unknown): payload is { gridId: string } {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { gridId?: unknown }).gridId === "string" &&
    (payload as { gridId: string }).gridId.length > 0
  );
}
```

Production listeners use dedicated guards such as `isGridUpdatePayload`, `isGridReadyPayload`, and `isFileDropPayload`.

Compatibility listeners remain for:

- `organizer:create-grid-request`
- `create-grid-request`
