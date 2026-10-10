# Time Tracker API

Package: `@repo/plugin-web-time-tracker`

Public exports:

- `timeTrackerWebModuleRegistration`
- `TimeTrackerModule`
- `getTimeTrackerSnapshot(nowMs?)`
- `readTimeTrackerCategories()`
- `readTimeTrackerEntries()`
- `writeTimeTrackerEntries(entries)`
- exported key/event/creation helpers: `TIME_TRACKER_CATEGORIES_KEY`, `TIME_TRACKER_ENTRIES_KEY`, `TIME_TRACKER_MODE_KEY`, `TIME_TRACKER_STORAGE_EVENT`, `createTimeTrackerEntry`
- public types include `TimeTrackerMode` (`single | multi`), category, entry, segment and snapshot types
- time helpers: `isActiveEntry`, `isRunningEntry`, `entryDuration`, `entryStart`, `formatDuration`, `formatTimer`, `dayKey`, `startOfDay`, `startOfWeek`

Storage keys:

- `xai_tt_categories_v2`
- `xai_tt_entries_v2`
- `xai_tt_mode`
- `xai_tt_insights_v1`

The storage model is segment-based. An active entry is unfinished (`done=false`); a running entry additionally has an open last segment (`end=null`). A paused unfinished entry has no open interval.

`xai_tt_mode` is an unscoped browser-origin device preference: only the literal `multi` reads Multi; absent/other values read Single. Category/entry JSON uses account/generation physical keys derived from the logical names above. This is not an account-cloud synchronization guarantee. Mode write emits `TIME_TRACKER_STORAGE_EVENT`; its internal hook listens for storage/package events with captured-owner readiness checks. Mode read/write/hook and `commitTimeTrackerEntries` are internal functions, not public exports from [index.ts](../src/index.ts).


## REL-01 amendment — 2026-09-09 local civil time

This section supersedes historical UTC-day / fixed-24-hour / 2026-Pacific-only assumptions above. User time zone currently follows the browser/device; `xai_pref_dt_timezone` is a display boolean, not a stored IANA choice. Civil `YYYY-MM-DD` keys are date identities and existing keys are not shifted. Absolute ISO/epoch values keep their instant. Natural-day boundaries use the next local midnight (23/24/25 hours and fractional DST days), not 86,400,000 milliseconds.

Shared owner: `@repo/plugin-web-tokens` public `localDateKey`, `parseLocalDateKey`, `addLocalDays`, `startOfLocalDay`, `nextLocalDayStart`, `useLocalDayClock`. The hook refreshes on midnight, focus, pageshow, visible and a 60-second system-clock/time-zone calibration. It cleans timers/listeners on unmount and makes no closed-page execution promise. User-selected historical dates are preserved when today advances.

Regression evidence is tracked in `docs/reviews/web-local-time-contract/dev_log.md`; focused localDate suites run under UTC, America/Los_Angeles, Asia/Shanghai and Australia/Lord_Howe. Full feature suites retain unrelated behavior coverage. Independent verification remains a separate workflow step.

REL-01 changes civil-day navigation/refresh behavior. TT-01 window allocation was subsequently independently accepted at `c5b08a723a47cf8cec59a585a714195efa98b1ba` ([report](../../../docs/reviews/web-time-window-independent/20260909-verification.md)); TT-03 hourly/rhythm/CSV acceptance uses `cd3146b8c241a6ac5434a10e555ae813b2cc2961` ([report](../../../docs/reviews/web-time-hour-independent/20260909-review.md)). Report-window projections retain source identity and do not replace persisted source segments. Running segment epoch values remain absolute instants. These are historical acceptances, not new executions in this documentation iteration.

## TT02 entry command boundary

Interactive entry writes use `commitTimeTrackerEntries(next, expected, capturedScope)` under a Web Lock named from the account/generation physical key. It rereads canonical source under lock, validates intervals, checks the expected source snapshot, and enforces the current device single/multi policy before committing. `useTimeTrackerEntries` now returns `[entries, commitAsync, {error, exportSource}]`; `commitAsync` resolves boolean and editors close only on true. Missing Web Locks, changed owner/source, unavailable storage and malformed intervals reject without overwriting raw data. `exportSource` is captured-owner guarded and returns original raw JSON for recovery. Low-level write helpers remain for validated migration/seeding/tests; interactive consumers must use the locked controller.

Metadata-only edits preserve all source segments and terminal status exactly. Multi-segment records currently permit note/category changes in the editor, with interval controls explicitly disabled. Existing malformed/overlapping segments are not automatically rewritten: export the original raw file and use a separately reviewed recovery procedure; there is currently no in-app import/repair operation. Pure finish/pause helpers close all open intervals without introducing negative ordering, but the repository does not silently use that to repair overlapping history.


## TT08 consumer and enforcement clarification — 2026-10-10

The [module](../src/TimeTrackerModule.tsx) owns the EN/ZH selector and Start confirmation. Its accepted single Start rule rechecks the captured running set inside the entry update before ending running rows and appending a new row at one timestamp. Multi permits distinct running sessions. Pause/Resume/End share the [locked entry controller](../src/internal/storage.ts); Resume has no Start dialog. The controller refuses a newly running ID if single mode would leave more than one running session. Paused records are not competing running work, and neither mode permits invalid/overlapping per-session intervals.

**Implementation observation:** `writeTimeTrackerMode` writes only the preference and emits an event. Multi→Single selection does not itself stop or choose a session, and unchanged pre-existing running IDs do not trigger the newly-running rejection. Thus several existing running sessions can remain after conversion. This is not an owner-approved conversion policy or a guarantee that every persisted Single state has at most one running row. Preference writes are not part of the entry Web Lock transaction and have no established entry-controller recovery guarantee.

[getTimeTrackerSnapshot](../src/internal/storage.ts) projects entries/categories into totals and runningCount. The [widget](../../xai-web-dashboard-widgets/src/widgets/TimeTrackerWidget.tsx) displays those values and navigates to the module, without direct mode/timer commands. Insights and CSV consume window projections while retaining source IDs/timestamps; the reporting projection must not be persisted as a replacement source record. The [canonical PRD](../../../docs/product/time-tracker/prd.md) traces these bounded requirements and the separate pending TT08 verification/status/acceptance chain. This API clarification adds no exports, storage schema, widget control or runtime change.
