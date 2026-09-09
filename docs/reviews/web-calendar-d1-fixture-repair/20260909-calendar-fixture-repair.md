# Calendar D1 fixture repair

The activated canonical-writer test setup intentionally rejects legacy synchronous writes to `xai_calendar_events`. Five Calendar integration suites used that path to seed their initial persisted event collection, leaving the module with no user events before the business assertion ran.

The fixtures now write their initial raw collection directly to the authenticated account generation key produced by `accountScope.physicalKey("xai_calendar_events")`. This is setup only; real create, update, delete, retry, and failure assertions continue through the public Calendar UI and its ordinary canonical writer.

`CalendarModule.recurrence`, `CalendarModule.dst-recurrence`, `CalendarModule.eventcrud`, `YearView`, and `CalendarModule.saveRecovery` retain their original business assertions. The asynchronous interaction cases await completion. Save recovery now reads the committed canonical envelope's `data` collection rather than treating envelope metadata as calendar events.

Verification after the repair:

- `pnpm --filter @repo/plugin-web-calendar test` — 50 files, 372 tests passed.
- `pnpm --filter @repo/plugin-web-calendar check-types` — passed.
- `pnpm --filter @repo/plugin-web-calendar lint` — passed.
