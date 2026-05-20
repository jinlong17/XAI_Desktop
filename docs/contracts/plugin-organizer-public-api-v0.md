# Plugin Organizer Public API Contract v0

| Field | Value |
|---|---|
| Owner | `@repo/plugin-organizer` |
| Source | `packages/plugin-organizer/src/index.ts` |
| Status | Draft |
| Applies To | Desktop Host, Organizer package |

## 1. Principles

- Desktop Host imports Organizer UI only from `@repo/plugin-organizer`.
- Host must not import Organizer internal source files.
- Host owns native window shell, provider wiring, and AppKit drag handoff.
- Organizer owns Grid business UI, item rendering, file-drop behavior, and scoped cross-window events.

## 2. Public Grid Window Surface

```ts
export interface OrganizerGridContentProps {
  gridId: string;
  gridOpacity?: number;
  gridBlur?: boolean;
}

export function OrganizerGridContent(
  props: OrganizerGridContentProps
): JSX.Element;
```

`OrganizerGridContent` is the only public content component the desktop Grid
window shell may render.

## 3. Host Boundary

Allowed Host responsibilities:

- Parse or receive `gridId` from the native window route.
- Install `SettingsProvider` and drag/drop providers.
- Pass presentation settings into `OrganizerGridContent`.
- Handle native window dragging/chrome behavior.

Disallowed Host responsibilities:

- Render `SmartContainer` directly for Grid windows.
- Own Grid item placement or drop semantics.
- Emit Grid update/drop/close business events directly, except through the Organizer public component.

## 4. Tests

- `apps/desktop/src/windows/GridWindow.tsx` imports `OrganizerGridContent` from `@repo/plugin-organizer`.
- `apps/desktop/src/windows/GridWindow.tsx` does not import `SmartContainer`, `GridBox`, `DesktopItem`, or Organizer internal paths.
- `packages/plugin-organizer/src/index.ts` exports `OrganizerGridContent`.
