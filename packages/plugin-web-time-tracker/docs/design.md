# Time Tracker Design

Source: `/Users/lijinlong/Desktop/AI_Desktop/web design/module-timetrack.jsx`, `tt-shared.jsx`, `tt-insights.jsx`.

This implementation ports the releasable Time Tracker surface from the Claude Design prototype:

- Category-based start flow with Study, Work, Life, and Rest defaults.
- Single-task and multi-task modes, including switch confirmation when a single-task session is already active.
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

REL-01 changes civil-day navigation/window boundaries only. Segment splitting and cross-midnight allocation remain TT-01 follow-up work; running segment epoch values are preserved.
