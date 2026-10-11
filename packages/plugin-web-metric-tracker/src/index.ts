import "./styles.css";

export { MetricTrackerModule } from "./MetricTrackerModule.js";
export { metricTrackerWebModuleRegistration } from "./registration.js";
export { METRIC_TRACKER_STATE_KEY, METRIC_TRACKER_STORAGE_EVENT, createSeedMetricTrackerState } from "./internal/seed.js";
export { readMetricTrackerState, writeMetricTrackerState, upsertWeightRecord, deleteWeightRecord, updateWeightProfile } from "./internal/storage.js";
export { bmiFor, bmiStatus, chartPoints, computeWeightStats, filterRecordsByRange, formatWeight, kgToUnit, sortRecords, stageComparison, weightToKg } from "./internal/metrics.js";
export type { ChartPoint, DateRange, MetricDefinition, MetricTrackerState, MetricTrendDirection, RangeId, WeightProfile, WeightRecord, WeightStats, WeightUnit } from "./types.js";
