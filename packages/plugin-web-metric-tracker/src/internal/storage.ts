import { accountScope, registerAccountMigrationValidator } from "@repo/plugin-web-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MetricTrackerState, WeightProfile, WeightRecord } from "../types.js";
import { createSeedMetricTrackerState, DEFAULT_METRICS, DEFAULT_PROFILE, METRIC_TRACKER_STATE_KEY, METRIC_TRACKER_STORAGE_EVENT } from "./seed.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeParse(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isWeightProfile(value: unknown): value is WeightProfile {
  return (
    isRecord(value) &&
    typeof value["heightCm"] === "number" &&
    typeof value["targetWeightKg"] === "number" &&
    (value["preferredUnit"] === "kg" || value["preferredUnit"] === "jin")
  );
}

function isWeightRecord(value: unknown): value is WeightRecord {
  return (
    isRecord(value) &&
    typeof value["id"] === "string" &&
    value["metricId"] === "weight" &&
    typeof value["value"] === "number" &&
    Number.isFinite(value["value"]) &&
    (value["unit"] === "kg" || value["unit"] === "jin") &&
    typeof value["measuredAt"] === "string" &&
    typeof value["note"] === "string" &&
    typeof value["createdAt"] === "string" &&
    typeof value["updatedAt"] === "string" &&
    (value["deleted"] === undefined || typeof value["deleted"] === "boolean")
  );
}

function normalizeState(value: unknown): MetricTrackerState {
  const seed = createSeedMetricTrackerState(new Date().toISOString());
  if (!isRecord(value) || value["schemaVersion"] !== 1) return seed;
  const records = Array.isArray(value["records"]) ? value["records"].filter(isWeightRecord) : seed.records;
  return {
    schemaVersion: 1,
    activeMetricId: "weight",
    metrics: DEFAULT_METRICS,
    profile: isWeightProfile(value["profile"]) ? value["profile"] : DEFAULT_PROFILE,
    records,
    updatedAt: typeof value["updatedAt"] === "string" ? value["updatedAt"] : seed.updatedAt,
  };
}

function dispatchStorageEvent(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(METRIC_TRACKER_STORAGE_EVENT));
}

export function readMetricTrackerState(scope = accountScope.capture()): MetricTrackerState {
  if (typeof window === "undefined") return createSeedMetricTrackerState();
  return normalizeState(safeParse(window.localStorage.getItem(accountScope.physicalKey(METRIC_TRACKER_STATE_KEY, scope))));
}

export function writeMetricTrackerState(state: MetricTrackerState, scope = accountScope.capture()): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(accountScope.physicalKey(METRIC_TRACKER_STATE_KEY, scope), JSON.stringify(state));
  dispatchStorageEvent();
}

export function upsertWeightRecord(
  state: MetricTrackerState,
  record: Omit<WeightRecord, "createdAt" | "updatedAt"> & Partial<Pick<WeightRecord, "createdAt">>,
  nowIso = new Date().toISOString(),
): MetricTrackerState {
  const nextRecord: WeightRecord = {
    ...record,
    createdAt: record.createdAt ?? nowIso,
    updatedAt: nowIso,
  };
  const exists = state.records.some((item) => item.id === nextRecord.id);
  return {
    ...state,
    records: exists
      ? state.records.map((item) => (item.id === nextRecord.id ? { ...item, ...nextRecord, createdAt: item.createdAt } : item))
      : [nextRecord, ...state.records],
    updatedAt: nowIso,
  };
}

export function deleteWeightRecord(state: MetricTrackerState, id: string, nowIso = new Date().toISOString()): MetricTrackerState {
  return {
    ...state,
    records: state.records.map((record) => (record.id === id ? { ...record, deleted: true, updatedAt: nowIso } : record)),
    updatedAt: nowIso,
  };
}

export function updateWeightProfile(state: MetricTrackerState, profile: WeightProfile, nowIso = new Date().toISOString()): MetricTrackerState {
  return {
    ...state,
    profile,
    metrics: state.metrics.map((metric) => metric.id === "weight" ? { ...metric, goalValue: profile.targetWeightKg, unit: profile.preferredUnit } : metric),
    updatedAt: nowIso,
  };
}

export function createWeightRecordId(now = Date.now()): string {
  return `mw_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useMetricTrackerState(): readonly [MetricTrackerState, (next: MetricTrackerState | ((prev: MetricTrackerState) => MetricTrackerState)) => void] {
  const scope = useRef(accountScope.capture()).current;
  const [state, setState] = useState<MetricTrackerState>(() => readMetricTrackerState(scope));
  const stateRef = useRef(state);

  useEffect(() => {
    function refresh(): void {
      if (!accountScope.isReady(scope)) return;
      const next = readMetricTrackerState(scope);
      stateRef.current = next;
      setState(next);
    }
    window.addEventListener("storage", refresh);
    window.addEventListener(METRIC_TRACKER_STORAGE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(METRIC_TRACKER_STORAGE_EVENT, refresh);
    };
  }, []);

  const setPersisted = useCallback((next: MetricTrackerState | ((prev: MetricTrackerState) => MetricTrackerState)) => {
    if (!accountScope.isReady(scope)) return;
    const value = typeof next === "function" ? next(stateRef.current) : next;
    writeMetricTrackerState(value, scope);
    stateRef.current = value;
    setState(value);
  }, []);

  return [state, setPersisted];
}

registerAccountMigrationValidator(METRIC_TRACKER_STATE_KEY, value => isRecord(value) && value["schemaVersion"] === 1 && isWeightProfile(value["profile"]) && Array.isArray(value["records"]) && value["records"].every(isWeightRecord));
