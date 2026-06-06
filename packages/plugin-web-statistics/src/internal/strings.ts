/**
 * @internal — Local STR table for xai-web-statistics (B1 / Path 1).
 *
 * Per §SRA design: ZERO `plugin-web-tokens` edit. The ≤2 user-visible
 * "current board" honesty-marker strings live here, mirroring the SHIPPED
 * dashboard `STR_WIDGET_EMPTY` + `strEmpty` pattern
 * (`packages/xai-web-dashboard-widgets/src/internal/strings.ts`).
 *
 * This is the project's local-STR convention (tasks `STR_TASK_COMPOSER`,
 * calendar `STR_EVENT_COMPOSER`, dashboard `STR_WIDGET_EMPTY`) — NOT an
 * i18n-bundle change.
 *
 * NOT exported from `src/index.ts` — `@internal` only.
 *
 * Shape: `Record<key, { en: string; zh: string }>` — access via
 * `strStats(key, lang)` where `lang: "en" | "zh"`.
 *
 * Authority: packages/xai-web-statistics/docs/dev_log.md §SRA Phase P1
 * Discovery: docs/reviews/xai-web-statistics-real-aggregation/20260529-discovery-review.md §3.5
 */

/** "current board" marker strings for the Tasks KPI and BarChart panel. */
export const STR_STATS_TASKS = {
  /** Sub-label shown on the Tasks KPI card and the Tasks BarChart panel header. */
  current_board: { en: "current board", zh: "当前看板" },
} as const;

/** Typed key for STR_STATS_TASKS. */
export type StatsTasksStrKey = keyof typeof STR_STATS_TASKS;

/** Convenience accessor: `strStats(key, lang)`. */
export function strStats(key: StatsTasksStrKey, lang: "en" | "zh"): string {
  return STR_STATS_TASKS[key][lang];
}
