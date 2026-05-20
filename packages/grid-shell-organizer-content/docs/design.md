# grid-shell-organizer-content — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Safe prep only; production shell/content split blocked |
| Review Doc Path | docs/reviews/grid-shell-organizer-content/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | G1 boundary planning |

## Current Shape

- Host `GridWindow.tsx` renders `SmartContainer` directly.
- Host `GridWindow.tsx` owns grid event handlers, close/update/toggle wiring, native drag handoff, and G0 telemetry.
- `plugin-organizer/src/index.ts` exports public building blocks, but not one dedicated Grid window content component.

## Target Shape

```tsx
export function GridWindow({ gridId }: { gridId: string }) {
  return (
    <SettingsProvider>
      <GlobalDndProvider>
        <OrganizerGridContent gridId={gridId} />
      </GlobalDndProvider>
    </SettingsProvider>
  );
}
```

`OrganizerGridContent` is a placeholder target API. Exact naming should be finalized during G1.2 production build after G1.1 command contracts and G0 DnD conclusions are available.

## Frozen Assumptions

- Host may keep native window/provider concerns.
- Organizer owns Grid business UI, item placement, drop semantics, and scoped event behavior.
- No production boundary movement should start while G0 and G1.1 are blocked.
