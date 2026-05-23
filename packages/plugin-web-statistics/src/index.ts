/**
 * @repo/plugin-web-statistics — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/.
 *
 * API contract: packages/xai-web-statistics/docs/api.md §0
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4 (port map "module-statistics.jsx")
 *
 * NOTE: StatisticsModule + statisticsWebModuleRegistration are added to
 * this surface in P2 / P3 of the build plan respectively.
 */

// Side-effect CSS — applied once globally when this package is first imported.
import "./styles.css";

// ---- Components ------------------------------------------------------------
export { StatisticsModule } from "./StatisticsModule.js";

// ---- Public types ----------------------------------------------------------
export type {
  RangeId,
  KpiCellId,
  StatisticsKpis,
  HeatmapCell,
  RingSegment,
  HabitRankingRow,
  RangeAggregate,
  StatisticsModuleProps,
} from "./types.js";
