# Metric Tracker Dev Log

## Status

READY_FOR_VERIFY

## Work Log

- 2026-06-08: Added Web module package for `/app/metrics`, V1 weight tracking
  data model, BMI/statistics helpers, local persistence, selected option-3 UI,
  host rail/route integration, Cmd-K adapter, and tests.

### REL-01 independent review correction — 2026-09-09

Executor: Codex parent bug-fix. Independent Chromium review found unchanged date/time edit normalization changed the instant. Draft now retains original measuredAt and initial civil inputs; unchanged inputs preserve the value. Package 16 tests passed. Status remains FIX_READY_FOR_VERIFY; independent browser recheck pending. This does not close REL-01 or the Metrics backlog.
