# Metric Tracker Design

## Scope

`@repo/plugin-web-metric-tracker` owns the Web Console `/app/metrics` module.
V1 implements weight tracking as the first numeric metric while preserving a
generic metric definition shape for future sleep, water, exercise, blood
pressure, study time, and custom numeric metrics.

## Product Shape

- Metric tabs show Weight as active and future metrics as planned.
- Weight data uses kg as the canonical analysis unit; original user-entered
  unit (`kg` or `斤`) is preserved on each record.
- Profile data contains height, target weight, and preferred display unit.
- The UI follows the selected Product Design option 3: goal progress left,
  chronological log center, share card right, and analytics charts below.
  Quick logging is modal-only from the top `记一下` action so the form does not
  stay permanently visible on the page.
- The record log and data preview use separate range selectors. The preview
  selector drives the share card, KPI board, weight curve, BMI curve, and stage
  comparison with presets for recent 30 days, last month, recent 3 months, this
  year, all time, and custom dates.
- Weight and BMI curves expose per-day values on hover/focus so users can read
  the exact value behind each point without leaving the chart.

## Persistence

V1 uses browser-local `localStorage` at `xai_metric_tracker_state_v1` with
`syncStatus=device-local` by product decision. Account sync is future `sync`
module work and must go through ADR-0013 D4 before cloud transport.


## REL-01 amendment — 2026-09-09 local civil time

This section supersedes historical UTC-day / fixed-24-hour / 2026-Pacific-only assumptions above. User time zone currently follows the browser/device; `xai_pref_dt_timezone` is a display boolean, not a stored IANA choice. Civil `YYYY-MM-DD` keys are date identities and existing keys are not shifted. Absolute ISO/epoch values keep their instant. Natural-day boundaries use the next local midnight (23/24/25 hours and fractional DST days), not 86,400,000 milliseconds.

Shared owner: `@repo/plugin-web-tokens` public `localDateKey`, `parseLocalDateKey`, `addLocalDays`, `startOfLocalDay`, `nextLocalDayStart`, `useLocalDayClock`. The hook refreshes on midnight, focus, pageshow, visible and a 60-second system-clock/time-zone calibration. It cleans timers/listeners on unmount and makes no closed-page execution promise. User-selected historical dates are preserved when today advances.

Regression evidence is tracked in `docs/reviews/web-local-time-contract/dev_log.md`; focused localDate suites run under UTC, America/Los_Angeles, Asia/Shanghai and Australia/Lord_Howe. Full feature suites retain unrelated behavior coverage. Independent verification remains a separate workflow step.

New/edited measurements serialize measuredAt as an explicit UTC ISO instant after resolving the entered local clock. Today/yesterday quick-entry dates resolve at save time. Legacy offsetless records are preserved (their historical source timezone cannot be reconstructed); they retain legacy device-local interpretation until edited.

The edit draft retains original measuredAt plus its initial date/time inputs. Minute-precision controls cannot round-trip an absolute instant in repeated DST hours or with sub-minute precision, so unchanged civil inputs preserve the original instant.
