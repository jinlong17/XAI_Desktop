# STAT-01/02 current-state reproduction

Product module: web. Baseline `277084f178242373cd9698cbda1ee050ced874d4`. These are pure aggregator checks against current product code, not native browser or production evidence. No product files were changed for this diagnosis.

The four original business assertions in `reproduction.test.ts` all FAIL; `before.log` contains the actual nonzero Vitest result. A focus session with 25-minute configuration and one measured minute is counted as 25 in the KPI and heatmap. An immediate End with zero elapsed is also counted as 25. A completed task without a completion instant is placed in the last date bucket instead of remaining an undated current total.

`aggregators.ts:55` and `heatmapCells.ts:41` read `durationMs`; the actual Pomodoro producer explicitly defines this as configured time and `elapsedMs` as time excluding pauses. The Statistics boundary ignores `elapsedMs`. `aggregators.ts` deliberately fills the last task bucket with the current total, which contradicts STAT-02 even though its existing header says “current board”.

Next implementation must use a shared measured-duration rule for KPI, focus trend, hourly grouping and heatmap; retain subminute measurements before aggregate display rounding; and make missing/invalid elapsed data visible without silently claiming the configured duration was worked. Raw legacy rows must remain unchanged. Completion-time series requires TASK-02's real completion timestamps; no timestamp can be invented from task location, current date or total count. These two audit items remain open.

Reproduce from repository root:

```sh
node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-statistics-time-contract/verify.config.mjs
```
