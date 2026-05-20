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

- `packages/plugin-widgets/src/components/WidgetHost.tsx:1,24-31` imports `useMemo`, memoizes the widget registry from built-ins plus registrations, and keeps the built-in seed stable for store hydration.
- `packages/plugin-widgets/src/hooks/useWidgetStore.ts:13,38-43,81-106` strengthens the non-crypto widget id fallback, documents seed widgets as localStorage-empty fallback only, hydrates the repo before refreshing widget state, and lets `refreshFromRepo()` persist repo state back to React state and localStorage.
- `packages/plugin-widgets/src/components/WidgetFrame.tsx:1,27-30,33-59` stores active drag listeners behind an `AbortController`, aborts any previous drag before starting another, aborts on pointerup, and aborts in-flight drag listeners on unmount.
- Stabilized WidgetHost default `registrations` via module-level constant to preserve useMemo identity.
- Track C proposes registering `calendar.event` in the canonical data repository contract, clarifies calendar weekday labels with accessible names, derives day keys in local time, and treats `@repo/plugin-widgets` as a peer/dev dependency for calendar widget registration.
