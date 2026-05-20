# G6-E1 Widget Host Feature Brief

## Scope

Build the desktop widget scaffold for Track C:
- `WidgetEntity` with id, type, position, size, config, and visible fields.
- `WidgetHost` container for all registered widgets.
- `WidgetFrame` draggable and resizable prototype frame.
- `useWidgetStore` backed by mock repo shape and localStorage.
- Registry contract for other plugins to register widget types.
- Compact and comfortable density.
- System-following light/dark intent through CSS custom properties.

## Non-goals

- No real Tauri wallpaper API.
- No cross-device sync.
- No production drag collision engine.

## Mock Strategy

Widget state persists in localStorage and mirrors into an in-memory repo-compatible adapter. Wallpaper contrast is represented by a user-controlled mock tone.

## Cross-review fixes 2026-05-20

Track C proposes registering `calendar.event` in the canonical data repository contract, clarifies calendar weekday labels with accessible names, derives day keys in local time, and treats `@repo/plugin-widgets` as a peer/dev dependency for calendar widget registration.

- Moved `toLocalIsoDate` from `components/CalendarMini` to `utils/date` so hooks no longer import from components.
