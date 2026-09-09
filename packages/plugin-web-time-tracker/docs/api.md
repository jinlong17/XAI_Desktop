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
- `xai_tt_insights_v1`

The storage model is segment-based. A live entry has `done=false` and its last segment has `end=null`.


## REL-01 amendment — 2026-09-09 local civil time

This section supersedes historical UTC-day / fixed-24-hour / 2026-Pacific-only assumptions above. User time zone currently follows the browser/device; `xai_pref_dt_timezone` is a display boolean, not a stored IANA choice. Civil `YYYY-MM-DD` keys are date identities and existing keys are not shifted. Absolute ISO/epoch values keep their instant. Natural-day boundaries use the next local midnight (23/24/25 hours and fractional DST days), not 86,400,000 milliseconds.

Shared owner: `@repo/plugin-web-tokens` public `localDateKey`, `parseLocalDateKey`, `addLocalDays`, `startOfLocalDay`, `nextLocalDayStart`, `useLocalDayClock`. The hook refreshes on midnight, focus, pageshow, visible and a 60-second system-clock/time-zone calibration. It cleans timers/listeners on unmount and makes no closed-page execution promise. User-selected historical dates are preserved when today advances.

Regression evidence is tracked in `docs/reviews/web-local-time-contract/dev_log.md`; focused localDate suites run under UTC, America/Los_Angeles, Asia/Shanghai and Australia/Lord_Howe. Full feature suites retain unrelated behavior coverage. Independent verification remains a separate workflow step.

REL-01 changes civil-day navigation/window boundaries only. Segment splitting and cross-midnight allocation remain TT-01 follow-up work; running segment epoch values are preserved.

## TT02 entry command boundary

Interactive entry writes use `commitTimeTrackerEntries(next, expected, capturedScope)` under a Web Lock named from the account/generation physical key. It rereads canonical source under lock, validates intervals, checks the expected source snapshot, and enforces the current device single/multi policy before committing. `useTimeTrackerEntries` now returns `[entries, commitAsync, {error, exportSource}]`; `commitAsync` resolves boolean and editors close only on true. Missing Web Locks, changed owner/source, unavailable storage and malformed intervals reject without overwriting raw data. `exportSource` is captured-owner guarded and returns original raw JSON for recovery. Low-level write helpers remain for validated migration/seeding/tests; interactive consumers must use the locked controller.

Metadata-only edits preserve all source segments and terminal status exactly. Multi-segment records currently permit note/category changes in the editor, with interval controls explicitly disabled. Existing malformed/overlapping segments are not automatically rewritten: export the original raw file and use a separately reviewed recovery procedure; there is currently no in-app import/repair operation. Pure finish/pause helpers close all open intervals without introducing negative ordering, but the repository does not silently use that to repair overlapping history.
