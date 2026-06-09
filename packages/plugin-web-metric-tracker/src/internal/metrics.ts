import type { ChartPoint, DateRange, WeightProfile, WeightRecord, WeightStats, WeightUnit } from "../types.js";
import { formatMonthDay } from "./date.js";

export function weightToKg(value: number, unit: WeightUnit): number {
  return unit === "jin" ? value / 2 : value;
}

export function kgToUnit(valueKg: number, unit: WeightUnit): number {
  return unit === "jin" ? valueKg * 2 : valueKg;
}

export function formatWeight(valueKg: number, unit: WeightUnit): string {
  return kgToUnit(valueKg, unit).toFixed(1);
}

export function bmiFor(weightKg: number, heightCm: number): number | null {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || heightCm <= 0) return null;
  const meters = heightCm / 100;
  return weightKg / (meters * meters);
}

export function bmiStatus(bmi: number | null, lang: "en" | "zh" = "zh") {
  if (bmi === null) return { label: lang === "en" ? "Unset" : "未设置", tone: "muted" as const };
  if (bmi < 18.5) return { label: lang === "en" ? "Low" : "偏低", tone: "warn" as const };
  if (bmi < 24) return { label: lang === "en" ? "Normal" : "正常", tone: "good" as const };
  if (bmi < 28) return { label: lang === "en" ? "High" : "偏高", tone: "warn" as const };
  return { label: lang === "en" ? "Very high" : "较高", tone: "risk" as const };
}

export function sortRecords(records: readonly WeightRecord[], direction: "desc" | "asc" = "desc"): WeightRecord[] {
  const sign = direction === "desc" ? -1 : 1;
  return records
    .filter((record) => record.deleted !== true)
    .slice()
    .sort((a, b) => sign * (new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()));
}

export function filterRecordsByRange(records: readonly WeightRecord[], range: DateRange): WeightRecord[] {
  return records.filter((record) => {
    if (record.deleted === true) return false;
    const time = new Date(record.measuredAt).getTime();
    if (range.start && time < range.start.getTime()) return false;
    if (range.end && time > range.end.getTime()) return false;
    return true;
  });
}

export function computeWeightStats(records: readonly WeightRecord[], profile: WeightProfile): WeightStats {
  const sortedDesc = sortRecords(records, "desc");
  const sortedAsc = sortRecords(records, "asc");
  const current = sortedDesc[0] ?? null;
  if (sortedDesc.length === 0 || current === null) {
    return { current: null, highest: null, lowest: null, averageKg: null, trendKg: null, distanceToGoalKg: null, bmiCurrent: null, bmiTrend: null };
  }

  const byKg = sortedDesc.map((record) => ({ record, kg: weightToKg(record.value, record.unit) }));
  const highest = byKg.reduce((best, item) => (item.kg > best.kg ? item : best), byKg[0]!).record;
  const lowest = byKg.reduce((best, item) => (item.kg < best.kg ? item : best), byKg[0]!).record;
  const averageKg = byKg.reduce((total, item) => total + item.kg, 0) / byKg.length;
  const first = sortedAsc[0]!;
  const trendKg = weightToKg(current.value, current.unit) - weightToKg(first.value, first.unit);
  const distanceToGoalKg = weightToKg(current.value, current.unit) - profile.targetWeightKg;
  const bmiCurrent = bmiFor(weightToKg(current.value, current.unit), profile.heightCm);
  const firstBmi = bmiFor(weightToKg(first.value, first.unit), profile.heightCm);
  const bmiTrend = bmiCurrent === null || firstBmi === null ? null : bmiCurrent - firstBmi;

  return { current, highest, lowest, averageKg, trendKg, distanceToGoalKg, bmiCurrent, bmiTrend };
}

export function chartPoints(records: readonly WeightRecord[], profile: WeightProfile, lang: "en" | "zh" = "zh"): ChartPoint[] {
  return sortRecords(records, "asc").map((record) => {
    const weightKg = weightToKg(record.value, record.unit);
    return {
      label: formatMonthDay(new Date(record.measuredAt), lang),
      weightKg,
      bmi: bmiFor(weightKg, profile.heightCm),
    };
  });
}

export function stageComparison(records: readonly WeightRecord[]): readonly { label: string; valueKg: number; deltaKg: number }[] {
  const sorted = sortRecords(records, "asc");
  if (sorted.length === 0) return [];
  const groups = [
    sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 3))),
    sorted.slice(Math.max(1, Math.ceil(sorted.length / 3)), Math.max(2, Math.ceil((sorted.length * 2) / 3))),
    sorted.slice(Math.max(2, Math.ceil((sorted.length * 2) / 3))),
  ].filter((group) => group.length > 0);
  const firstAvg = avgKg(groups[0] ?? []);
  return groups.map((group, index) => {
    const valueKg = avgKg(group);
    return {
      label: index === 0 ? "起始阶段" : index === 1 ? "中段" : "最近",
      valueKg,
      deltaKg: valueKg - firstAvg,
    };
  });
}

function avgKg(records: readonly WeightRecord[]): number {
  if (records.length === 0) return 0;
  return records.reduce((total, record) => total + weightToKg(record.value, record.unit), 0) / records.length;
}
