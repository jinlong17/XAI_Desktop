# Time Tracker API

Package: `@repo/plugin-web-time-tracker`

Public exports:

- `timeTrackerWebModuleRegistration`
- `TimeTrackerModule`
- `getTimeTrackerSnapshot(nowMs?)`
- `readTimeTrackerCategories()`
- `readTimeTrackerEntries()`
- `writeTimeTrackerEntries(entries)`
- time helpers: `entryDuration`, `entryStart`, `formatDuration`, `formatTimer`, `dayKey`, `startOfDay`, `startOfWeek`

Storage keys:

- `xai_tt_categories_v2`
- `xai_tt_entries_v2`
- `xai_tt_mode`

The storage model is segment-based. A live entry has `done=false` and its last segment has `end=null`.
