# Proposed Contract Changes

Future EventMap candidates:
- `widgets:changed` with `{ widgetId, kind }`
- `widgets:preference-updated` with `{ density, theme, contrast }`

Future Tauri command candidate:
- `sample_wallpaper_tone() -> { tone: "light" | "dark" | "mixed", accent?: string }`

## Propose: register `calendar.event` (2026-05-20)

Add to docs/contracts/data-repository-v0.md §3.1:

| `CalendarEvent` | `calendar.event` | `account-sync` | `title`, `startsAt`, `endsAt`, `source`, `color` |

Rationale: packages/plugin-calendar/src/types.ts already extends RepoRecord with this entityType and syncScope: "device-local" (mock; production default should be `account-sync` for cross-device calendar). schemaVersion starts at 1.

Migration: none — entity is new.
