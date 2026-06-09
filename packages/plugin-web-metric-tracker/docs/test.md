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
