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
