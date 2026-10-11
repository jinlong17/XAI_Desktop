import type { MetricDefinition, MetricTrackerState, WeightProfile, WeightRecord } from "../types.js";

export const METRIC_TRACKER_STATE_KEY = "xai_metric_tracker_state_v1";
export const METRIC_TRACKER_STORAGE_EVENT = "xai:metric-tracker-storage";

export const DEFAULT_PROFILE: WeightProfile = {
  heightCm: 178,
  targetWeightKg: 70,
  preferredUnit: "kg",
};

export const DEFAULT_METRICS: readonly MetricDefinition[] = [
  {
    id: "weight",
    name: "体重",
    unit: "kg",
    frequency: "daily",
    goalValue: 70,
    trendDirection: "lower",
    color: "var(--accent)",
    icon: "target",
    noteField: true,
  },
  {
    id: "sleep",
    name: "睡眠",
    unit: "h",
    frequency: "daily",
    goalValue: 8,
    trendDirection: "range",
    color: "var(--blue)",
    icon: "moon",
    noteField: true,
  },
  {
    id: "water",
    name: "饮水",
    unit: "ml",
    frequency: "daily",
    goalValue: 2000,
    trendDirection: "higher",
    color: "var(--blue)",
    icon: "droplet",
    noteField: true,
  },
  {
    id: "exercise",
    name: "运动",
    unit: "次",
    frequency: "weekly",
    goalValue: 4,
    trendDirection: "higher",
    color: "var(--amber)",
    icon: "activity",
    noteField: true,
  },
];

const SEED_RECORDS: readonly Omit<WeightRecord, "createdAt" | "updatedAt">[] = [
  { id: "mw_20260525", metricId: "weight", value: 72.3, unit: "kg", measuredAt: "2026-05-25T08:15:00.000", note: "早餐前测量" },
  { id: "mw_20260523", metricId: "weight", value: 72.9, unit: "kg", measuredAt: "2026-05-23T07:50:00.000", note: "早晨前" },
  { id: "mw_20260521", metricId: "weight", value: 73.4, unit: "kg", measuredAt: "2026-05-21T07:45:00.000", note: "早餐前" },
  { id: "mw_20260518", metricId: "weight", value: 72.8, unit: "kg", measuredAt: "2026-05-18T08:00:00.000", note: "周末复测" },
  { id: "mw_20260516", metricId: "weight", value: 73.3, unit: "kg", measuredAt: "2026-05-16T07:55:00.000", note: "早餐前" },
  { id: "mw_20260514", metricId: "weight", value: 73.6, unit: "kg", measuredAt: "2026-05-14T07:40:00.000", note: "早餐前" },
  { id: "mw_20260511", metricId: "weight", value: 73.4, unit: "kg", measuredAt: "2026-05-11T08:05:00.000", note: "早餐前" },
  { id: "mw_20260509", metricId: "weight", value: 74.2, unit: "kg", measuredAt: "2026-05-09T07:50:00.000", note: "早晨前" },
  { id: "mw_20260507", metricId: "weight", value: 74.5, unit: "kg", measuredAt: "2026-05-07T07:45:00.000", note: "起始记录" },
];

export function createSeedMetricTrackerState(nowIso = "2026-05-25T08:30:00.000"): MetricTrackerState {
  return {
    schemaVersion: 1,
    activeMetricId: "weight",
    metrics: DEFAULT_METRICS,
    profile: DEFAULT_PROFILE,
    records: SEED_RECORDS.map((record) => ({
      ...record,
      createdAt: nowIso,
      updatedAt: nowIso,
    })),
    updatedAt: nowIso,
  };
}
