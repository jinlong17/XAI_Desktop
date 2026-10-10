# Time Tracker Design

Historical prototype provenance (external files not reverified in TT08): `/Users/lijinlong/Desktop/AI_Desktop/web design/module-timetrack.jsx`, `tt-shared.jsx`, `tt-insights.jsx`.

Existing surface ported from the Claude Design prototype (capability inventory, not a current release verdict):

- Category-based start flow with Study, Work, Life, and Rest defaults.
- Single-task and multi-task modes, including explicit End and start confirmation when Start encounters running sessions in single-task mode.
- Category subcategory picker before starting categories such as Study and Life.
- Active tray with pause, resume, end, and edit.
- Date navigation across previous, next, today, and selected-day history.
- Manual record creation plus record edit and delete confirmation.
- Category creation/editing, color and icon selection, goal minutes, subcategory add/remove/reorder, and soft delete.
- Category detail modal with total, last activity, goal progress, and recent records.
- Side insights panel with selected-day total, seven-day trend, clickable bars, and category distribution.
- Configurable Insights board with range tabs, reset, add/remove widgets, drag reorder, and persisted layout.
- Insight hover/focus details on bars, heatmap cells, line points, distribution rows, category rankings, and recent-session rows.
- Additional insight forms beyond simple charts: range summary metrics, category mosaic, 24-hour focus rhythm, and recent-session detail list.
- Report-style Insights controls with Week, Month, Year, Custom, and All ranges.
- CSV export for the selected report range, plus confirmed soft-delete for records in the selected range.
- Shared localStorage data model for the main module and dashboard widget.

The prototype's full grouped/searchable icon library is represented by a curated local icon set for this release so the package remains self-contained.


## REL-01 amendment — 2026-09-09 local civil time

This section supersedes historical UTC-day / fixed-24-hour / 2026-Pacific-only assumptions above. User time zone currently follows the browser/device; `xai_pref_dt_timezone` is a display boolean, not a stored IANA choice. Civil `YYYY-MM-DD` keys are date identities and existing keys are not shifted. Absolute ISO/epoch values keep their instant. Natural-day boundaries use the next local midnight (23/24/25 hours and fractional DST days), not 86,400,000 milliseconds.

Shared owner: `@repo/plugin-web-tokens` public `localDateKey`, `parseLocalDateKey`, `addLocalDays`, `startOfLocalDay`, `nextLocalDayStart`, `useLocalDayClock`. The hook refreshes on midnight, focus, pageshow, visible and a 60-second system-clock/time-zone calibration. It cleans timers/listeners on unmount and makes no closed-page execution promise. User-selected historical dates are preserved when today advances.

Regression evidence is tracked in `docs/reviews/web-local-time-contract/dev_log.md`; focused localDate suites run under UTC, America/Los_Angeles, Asia/Shanghai and Australia/Lord_Howe. Full feature suites retain unrelated behavior coverage. Independent verification remains a separate workflow step.

REL-01 changes civil-day navigation/refresh behavior. TT-01 window allocation was subsequently independently accepted at `c5b08a723a47cf8cec59a585a714195efa98b1ba` ([report](../../../docs/reviews/web-time-window-independent/20260909-verification.md)); TT-03 hourly/rhythm/CSV acceptance uses `cd3146b8c241a6ac5434a10e555ae813b2cc2961` ([report](../../../docs/reviews/web-time-hour-independent/20260909-review.md)). Report-window projections retain source identity and do not replace persisted source segments. Running segment epoch values remain absolute instants. These are historical acceptances, not new executions in this documentation iteration.

### TT02 cross-tab state contract

Single task is the default: Start while another session runs requires explicit End and start confirmation. The confirmed old running-source snapshot is rechecked inside the account-scoped lock; changed sessions reject the stale confirmation. Multiple tasks is explicitly selectable, permits distinct running sessions, and never permits duplicate open intervals within one session. Stale commands reject/replay as no-ops rather than resurrecting terminal sessions. No lock availability means writes are disabled with a visible explanation, not an emulated localStorage CAS. UI errors preserve editor drafts on the mounted page and offer a guarded download of original persisted session bytes; this export is not an unsaved-draft export or automatic cross-reload recovery.


## TT08 mode/page correspondence — 2026-10-10

The [bounded canonical PRD](../../../docs/product/time-tracker/prd.md) records accepted mode/session requirements and their historical evidence. Current source is frozen at `f9eb4b1f207bc4b46f547b90afc250424b3c8695`; TT08 changes documentation only. The old audit's unused-mode observation is historical and is superseded for current claims by TT02 and these consumers.

The actual [module](../src/TimeTrackerModule.tsx) consumes `useTimeTrackerMode` in its EN/ZH selector (`Timer mode` / `计时模式`, `Single task` / `单任务`, `Multiple tasks` / `多任务`) and Start path. Start is available for selected Today. Single is the default. Start with running sessions asks for explicit End and start, rechecks the captured running-source set inside the account-scoped entry lock, ends the running set and appends a distinct new session at the same timestamp. Multi permits distinct running sessions without this switch dialog. Neither mode permits duplicate open intervals within a session.

“Active” means unfinished, which includes paused sessions; “running” means unfinished with an open last segment ([time helpers](../src/internal/time.ts)). Single does not limit the number of paused/unfinished records. Pause, Resume and End use the entry controller. Resume does not open Start's confirmation: a newly resumed session that would leave multiple running sessions in single mode is rejected with the controller error. Replays do not resurrect a terminal session.

**Observed conversion limit, not owner-approved migration policy:** [mode writes](../src/internal/storage.ts) only change the device preference and emit the event. Selecting Single after Multi can leave several existing running sessions; the controller's single-mode check rejects newly running IDs rather than reconciling unchanged existing IDs. A later confirmed single Start ends the then-running set. Immediate reconciliation on selection would require a separate product decision. Mode preference writes do not inherit the entry controller's storage-error/recovery guarantees.

The [dashboard widget](../../xai-web-dashboard-widgets/src/widgets/TimeTrackerWidget.tsx) reads snapshot totals/runningCount and opens `timetrack`; it has no direct mode selector or Start/Pause/End handler. Insights/CSV use entry/window helpers, not another mode controller. The selector, confirmation and mounted-page error/export surface already match this description in both languages; page synchronization for TT08 is static source correspondence with zero page/source edits, not a browser, visual or accessibility acceptance.

TT02's [independent report](../../../docs/reviews/web-time-tracker-session-independent/20260909-report.md) covers lock/source refusal, terminal replay and source-preserving edits. Original-byte export is not unsaved-draft export or automatic reload restore; multi-segment interval editing is disabled while note/category editing preserves source segments, and no in-app import/repair exists. REL01's [independent report](../../../docs/reviews/web-local-time-consumers-independent/20260909-review.md) preserves the initial idle-midnight failure and subsequent `91497787b9ca7deabf88a3683d5a344699c39bf6` repair. TT02→current package changes only module day refresh/selected-day behavior and the added day-rollover test; the complete historical TT02 package is not byte-identical to current P0.
