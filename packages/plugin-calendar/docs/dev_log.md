# plugin-calendar Dev Log

## 2026-05-20

Plan:
- Implement a mock calendar store with aggregated event source labels.
- Build month mini view and day timeline view.
- Expose a widget manifest registration for `WidgetHost`.

Updates:
- Added `CalendarMini`, `CalendarDay`, `CalendarWidget`, and `calendarWidgetManifest`.
- 2026-05-20 Track D: added optional local `calendar.event` Repository v0 data layer with `RepoAdapter`/`CalendarRepoProvider` while preserving mock aggregate mode; passed `pnpm --filter @repo/plugin-calendar check-types`.
