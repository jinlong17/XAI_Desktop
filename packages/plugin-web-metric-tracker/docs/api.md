# Metric Tracker API

## Public Exports

- `MetricTrackerModule`
- `metricTrackerWebModuleRegistration`
- `readMetricTrackerState()`
- `writeMetricTrackerState(state)`
- `upsertWeightRecord(state, record, nowIso?)`
- `deleteWeightRecord(state, id, nowIso?)`
- `updateWeightProfile(state, profile, nowIso?)`
- `computeWeightStats(records, profile)`
- `chartPoints(records, profile, lang?)`
- `bmiFor(weightKg, heightCm)`

## Route Contract

The host registers `moduleId="metrics"` at `/app/metrics` with rail icon
`target` and i18n key `nav.metrics`.

## Storage Contract

```ts
localStorage["xai_metric_tracker_state_v1"] = MetricTrackerState
```

`MetricTrackerState.records[].deleted` is a soft-delete flag. Consumers should
filter deleted records unless explicitly building restore/audit UI.


## REL-01 amendment — 2026-09-09 local civil time

This section supersedes historical UTC-day / fixed-24-hour / 2026-Pacific-only assumptions above. User time zone currently follows the browser/device; `xai_pref_dt_timezone` is a display boolean, not a stored IANA choice. Civil `YYYY-MM-DD` keys are date identities and existing keys are not shifted. Absolute ISO/epoch values keep their instant. Natural-day boundaries use the next local midnight (23/24/25 hours and fractional DST days), not 86,400,000 milliseconds.

Shared owner: `@repo/plugin-web-tokens` public `localDateKey`, `parseLocalDateKey`, `addLocalDays`, `startOfLocalDay`, `nextLocalDayStart`, `useLocalDayClock`. The hook refreshes on midnight, focus, pageshow, visible and a 60-second system-clock/time-zone calibration. It cleans timers/listeners on unmount and makes no closed-page execution promise. User-selected historical dates are preserved when today advances.

Regression evidence is tracked in `docs/reviews/web-local-time-contract/dev_log.md`; focused localDate suites run under UTC, America/Los_Angeles, Asia/Shanghai and Australia/Lord_Howe. Full feature suites retain unrelated behavior coverage. Independent verification remains a separate workflow step.

New/edited measurements serialize measuredAt as an explicit UTC ISO instant after resolving the entered local clock. Today/yesterday quick-entry dates resolve at save time. Legacy offsetless records are preserved (their historical source timezone cannot be reconstructed); they retain legacy device-local interpretation until edited.

REL-01 independent verification follow-up: editing weight/note/unit without changing the displayed date/time preserves the original measuredAt string, including DST fold identity, seconds and milliseconds. Only an effective date/time change constructs a new instant from the civil inputs.
