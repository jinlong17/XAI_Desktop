# Metric Tracker Test Plan

## Automated

- Metric math: kg/斤 conversion, BMI, current/high/low/average/trend, rolling
  range filtering, and previous-calendar-month filtering.
- Storage: seeded fallback, normalized persistence, upsert, soft-delete,
  profile update.
- UI: V1 surface renders, preview range selector exposes year/all/last
  month/recent 3 months/custom choices, chart points expose exact values,
  quick-log dialog creates a record, edit/delete flow updates persisted state.
- Host integration: registration exports `/app/metrics`; apps/web route tests
  assert the module marker renders.
- Cmd-K: metrics adapter matches `metrics`, `weight`, `bmi`, `体重`, and `指标`.

## Browser QA

- Open `/app/metrics` in the Web shell.
- Verify desktop layout matches Product Design option 3 at 1440px width.
- Verify quick-log dialog, edit, delete, log range filter, preview range filter,
  chart hover values, sort, custom ranges, profile save, download image, and
  share fallback.
- Verify a narrow/mobile viewport stacks without text overlap.


## REL-01 amendment — 2026-09-09 local civil time

This section supersedes historical UTC-day / fixed-24-hour / 2026-Pacific-only assumptions above. User time zone currently follows the browser/device; `xai_pref_dt_timezone` is a display boolean, not a stored IANA choice. Civil `YYYY-MM-DD` keys are date identities and existing keys are not shifted. Absolute ISO/epoch values keep their instant. Natural-day boundaries use the next local midnight (23/24/25 hours and fractional DST days), not 86,400,000 milliseconds.

Shared owner: `@repo/plugin-web-tokens` public `localDateKey`, `parseLocalDateKey`, `addLocalDays`, `startOfLocalDay`, `nextLocalDayStart`, `useLocalDayClock`. The hook refreshes on midnight, focus, pageshow, visible and a 60-second system-clock/time-zone calibration. It cleans timers/listeners on unmount and makes no closed-page execution promise. User-selected historical dates are preserved when today advances.

Regression evidence is tracked in `docs/reviews/web-local-time-contract/dev_log.md`; focused localDate suites run under UTC, America/Los_Angeles, Asia/Shanghai and Australia/Lord_Howe. Full feature suites retain unrelated behavior coverage. Independent verification remains a separate workflow step.

New/edited measurements serialize measuredAt as an explicit UTC ISO instant after resolving the entered local clock. Today/yesterday quick-entry dates resolve at save time. Legacy offsetless records are preserved (their historical source timezone cannot be reconstructed); they retain legacy device-local interpretation until edited.

Independent Chrome review reproduced unchanged-time edits moving the second Pacific 01:30 occurrence by one hour and truncating seconds/milliseconds. Added component regressions for 2026-11-01T09:30:00.000Z and 2026-09-09T18:30:45.123Z; changing weight alone must preserve exact measuredAt. Package suite: 16 passing tests after fix. Browser re-verification is tracked in docs/reviews/web-local-time-contract.


## REL-05 metric save recovery

REL-05 Metrics: full 7 files/22 tests PASS. Five new tests cover native Storage quota with retained editor/latest draft and one successful retry; read denial after hydration with recoverable pending profile; conflict refusal against newer raw bytes; stale A retry/export refusal with B bytes retained; actual Blob JSON containing the pending snapshot and latest edited record draft. Existing absolute-time edit and account-isolation assertions remain. Package typecheck/lint passed before the final copy-only scope explanation. Independent browser verification is still required.


Follow-up final package run: 7 files/24 tests PASS; typecheck and lint PASS. Added latest-profile retry with disabled unrelated Log and repository refusal to replace an existing pending operation. Independent fixed-snapshot native before/after verification is being recorded separately.
