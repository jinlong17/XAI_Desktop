# grid-shell-organizer-content — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Production split via public `OrganizerGridContent` |
| Review Doc Path | docs/reviews/grid-shell-organizer-content/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | G1 boundary implementation |

## Previous Shape

- Host `GridWindow.tsx` renders `SmartContainer` directly.
- Host `GridWindow.tsx` owns grid event handlers, close/update/toggle wiring, native drag handoff, and G0 telemetry.
- `plugin-organizer/src/index.ts` exports public building blocks, but not one dedicated Grid window content component.

## Implemented Shape

```tsx
export function GridWindow({ gridId }: { gridId: string }) {
  return (
    <SettingsProvider>
      <GlobalDndProvider>
        <GridWindowShell gridId={gridId} />
      </GlobalDndProvider>
    </SettingsProvider>
  );
}
```

`GridWindowShell` reads Host settings and renders:

```tsx
<OrganizerGridContent gridId={gridId} gridOpacity={gridOpacity} gridBlur={gridBlur} />
```

`OrganizerGridContent` owns the content previously embedded in Host:

- Grid state from cross-window update/delete events.
- `SmartContainer` rendering and item resolution.
- Grid close/update/fold/lock callbacks.
- Finder DnD telemetry and `grid-window-file-drop` emission.
- G0 fallback panel while Organizer state is pending.

Host `GridWindow.tsx` owns only provider wiring and native AppKit drag handoff.

## Frozen Assumptions

- Host may keep native window/provider concerns.
- Organizer owns Grid business UI, item placement, drop semantics, and scoped event behavior.
- G1.2 does not rename legacy events or change DnD payload shape; that remains G1.4/G1.3 work.
