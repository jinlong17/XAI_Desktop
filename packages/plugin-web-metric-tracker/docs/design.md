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
  chronological log center, quick log plus share card right, and analytics
  charts below.

## Persistence

V1 uses browser-local `localStorage` at `xai_metric_tracker_state_v1` with
`syncStatus=device-local` by product decision. Account sync is future `sync`
module work and must go through ADR-0013 D4 before cloud transport.
