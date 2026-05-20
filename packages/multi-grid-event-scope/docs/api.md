# multi-grid-event-scope — API

## Planning Contract

No production API was changed in this slice.

## Candidate Event Names

```ts
type OrganizerGridEvents = {
  "organizer:grid:ready": { gridId: string };
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

## Runtime Guard Target

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

Final guard placement should be decided during production build.
