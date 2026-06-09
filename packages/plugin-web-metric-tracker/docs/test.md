# Metric Tracker Test Plan

## Automated

- Metric math: kg/斤 conversion, BMI, current/high/low/average/trend, range
  filtering.
- Storage: seeded fallback, normalized persistence, upsert, soft-delete,
  profile update.
- UI: V1 surface renders, quick log creates a record, edit/delete flow updates
  persisted state.
- Host integration: registration exports `/app/metrics`; apps/web route tests
  assert the module marker renders.
- Cmd-K: metrics adapter matches `metrics`, `weight`, `bmi`, `体重`, and `指标`.

## Browser QA

- Open `/app/metrics` in the Web shell.
- Verify desktop layout matches Product Design option 3 at 1440px width.
- Verify quick log, edit, delete, range filter, sort, custom range, profile
  save, download image, and share fallback.
- Verify a narrow/mobile viewport stacks without text overlap.
