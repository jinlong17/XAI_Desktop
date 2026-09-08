# Roadmap Seed — xai-web-statistics

> xai-web-console roadmap · feature #20 · wave W3 · Aggregator
> Source PRD: web design/DESIGN.md §4.11 (Statistics)
> Source Code: web design/module-statistics.jsx
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23). SUPERSEDES web-ticktick-parity `web-statistics-views`.

## Requirement

Port the Statistics module: range tabs (本周 / 本月 / 全部), 4 KPI cards (tasks / focus / habits / day-avg) with trend %, focus-duration line chart with shaded area, 24-hour productivity bar chart with peak auto-highlight + glow, label-distribution ring chart, top-5 habit ranking + streak flame, half-year focus heatmap + legend, and weekly-insight dynamic copy.

## Hard constraints

- Reads aggregations from xai-web-tasks (completion), xai-web-pomodoro (sessions), xai-web-habits (check-ins) via the event bus or shared store — NO direct module-internal imports.
- Charts must be deterministic from the same source data (no random sampling).
- Insight copy bilingual (template strings interpolated, not concatenated).
- Heatmap covers exactly 26 weeks (half year) with weekday columns.

## Acceptance signal

Statistics renders with real data from Tasks/Pomodoro/Habits, range tabs recalc all 7 visualizations, peak bar highlights correctly, insight copy reads naturally in both languages, and the heatmap covers half a year.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-tasks (ready_to_ship), xai-web-pomodoro (ready_to_ship), xai-web-habits (ready_to_ship).
