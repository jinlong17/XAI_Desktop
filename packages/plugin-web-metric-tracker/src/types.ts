export type Lang = "en" | "zh";
export type WeightUnit = "kg" | "jin";
export type MetricTrendDirection = "higher" | "lower" | "range";
export type RangeId = "7d" | "30d" | "lastMonth" | "3m" | "year" | "all" | "custom";

export interface MetricDefinition {
  readonly id: string;
  readonly name: string;
  readonly unit: string;
  readonly frequency: "daily" | "weekly" | "monthly" | "ad-hoc";
  readonly goalValue: number | null;
  readonly trendDirection: MetricTrendDirection;
  readonly color: string;
  readonly icon: string;
  readonly noteField: boolean;
}

export interface WeightProfile {
  readonly heightCm: number;
  readonly targetWeightKg: number;
  readonly preferredUnit: WeightUnit;
}

export interface WeightRecord {
  readonly id: string;
  readonly metricId: "weight";
  readonly value: number;
  readonly unit: WeightUnit;
  readonly measuredAt: string;
  readonly note: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deleted?: boolean;
}

export interface MetricTrackerState {
  readonly schemaVersion: 1;
  readonly activeMetricId: "weight";
  readonly metrics: readonly MetricDefinition[];
  readonly profile: WeightProfile;
  readonly records: readonly WeightRecord[];
  readonly updatedAt: string;
}

export interface DateRange {
  readonly id: RangeId;
  readonly start: Date | null;
  readonly end: Date | null;
}

export interface WeightStats {
  readonly current: WeightRecord | null;
  readonly highest: WeightRecord | null;
  readonly lowest: WeightRecord | null;
  readonly averageKg: number | null;
  readonly trendKg: number | null;
  readonly distanceToGoalKg: number | null;
  readonly bmiCurrent: number | null;
  readonly bmiTrend: number | null;
}

export interface ChartPoint {
  readonly label: string;
  readonly weightKg: number;
  readonly bmi: number | null;
}
