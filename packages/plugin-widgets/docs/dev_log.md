# plugin-widgets Dev Log

## 2026-05-20

Plan:
- Create widget host shell with device-local mock persistence.
- Add widget registration contract for plugin manifests.
- Add built-in time progress, countdown, personalization, and habit stats widgets.

Updates:
- Implemented `WidgetHost`, `WidgetFrame`, `useWidgetStore`, registry, built-in widgets, and CSS token helpers.
- Widget state persists through localStorage and mirrors into an in-memory repo-shaped mock adapter.
- 2026-05-20 Track D: replaced hardcoded in-memory widget repo with `DataAdapter`, `RepoAdapter`, `WidgetRepoProvider`, and localStorage fallback; passed `pnpm --filter @repo/plugin-widgets check-types`.
