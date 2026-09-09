# plugin-web-statistics — api

## STAT-01 amendment — 2026-09-09 measured focus time

`elapsedMs` is the actual focus duration, excluding pauses. `durationMs` remains the configured limit and is never substituted for elapsed work. A finite elapsed value from zero through the configured duration is measured; missing, negative, nonnumeric, nonfinite or over-limit values are unknown. Legacy rows remain readable and unchanged, but unknown duration contributes no measured minutes. `RangeAggregate.unmeasuredFocusSessions` counts such focus rows in the selected time range and the module displays a bilingual exclusion notice.

KPI, trend buckets, hour distribution and the 26-week heatmap use the same measured-duration function. Subminute values are retained during aggregation; formatting of displayed minutes uses at most two decimal places. Sessions are attributed to their local completion day/hour, not reconstructed as continuous wall-clock intervals because pauses cannot be inferred. This amendment does not introduce task completion timestamps or close STAT-02.

## REL-01 amendment — 2026-09-09 local civil time

This section supersedes historical UTC-day / fixed-24-hour / 2026-Pacific-only assumptions above. User time zone currently follows the browser/device; `xai_pref_dt_timezone` is a display boolean, not a stored IANA choice. Civil `YYYY-MM-DD` keys are date identities and existing keys are not shifted. Absolute ISO/epoch values keep their instant. Natural-day boundaries use the next local midnight (23/24/25 hours and fractional DST days), not 86,400,000 milliseconds.

Shared owner: `@repo/plugin-web-tokens` public `localDateKey`, `parseLocalDateKey`, `addLocalDays`, `startOfLocalDay`, `nextLocalDayStart`, `useLocalDayClock`. The hook refreshes on midnight, focus, pageshow, visible and a 60-second system-clock/time-zone calibration. It cleans timers/listeners on unmount and makes no closed-page execution promise. User-selected historical dates are preserved when today advances.

Regression evidence is tracked in `docs/reviews/web-local-time-contract/dev_log.md`; focused localDate suites run under UTC, America/Los_Angeles, Asia/Shanghai and Australia/Lord_Howe. Full feature suites retain unrelated behavior coverage. Independent verification remains a separate workflow step.
