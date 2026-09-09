# Time Tracker Test Plan

Focused automated coverage:

- Time helper duration/day/week behavior.
- Module bilingual render.
- Start, pause, resume, and end persistence.
- Manual record persistence.
- Subcategory start picker.
- Category editor persistence.
- Configurable insights board render.
- Insight hover metadata and richer insight cards after tracking time.
- Insight Year/Custom range controls, CSV export affordance, and confirmed range deletion.
- Shell registration shape.

Release verification should also smoke `/app/timetrack` in the web shell and confirm the dashboard Time Tracker widget opens the module.


## REL-01 amendment — 2026-09-09 local civil time

This section supersedes historical UTC-day / fixed-24-hour / 2026-Pacific-only assumptions above. User time zone currently follows the browser/device; `xai_pref_dt_timezone` is a display boolean, not a stored IANA choice. Civil `YYYY-MM-DD` keys are date identities and existing keys are not shifted. Absolute ISO/epoch values keep their instant. Natural-day boundaries use the next local midnight (23/24/25 hours and fractional DST days), not 86,400,000 milliseconds.

Shared owner: `@repo/plugin-web-tokens` public `localDateKey`, `parseLocalDateKey`, `addLocalDays`, `startOfLocalDay`, `nextLocalDayStart`, `useLocalDayClock`. The hook refreshes on midnight, focus, pageshow, visible and a 60-second system-clock/time-zone calibration. It cleans timers/listeners on unmount and makes no closed-page execution promise. User-selected historical dates are preserved when today advances.

Regression evidence is tracked in `docs/reviews/web-local-time-contract/dev_log.md`; focused localDate suites run under UTC, America/Los_Angeles, Asia/Shanghai and Australia/Lord_Howe. Full feature suites retain unrelated behavior coverage. Independent verification remains a separate workflow step.

REL-01 changes civil-day navigation/window boundaries only. Segment splitting and cross-midnight allocation remain TT-01 follow-up work; running segment epoch values are preserved.
