import { describe, expect, it } from "vitest";
import { createSeedMetricTrackerState, METRIC_TRACKER_STATE_KEY } from "../internal/seed.js";
import { deleteWeightRecord, readMetricTrackerState, updateWeightProfile, upsertWeightRecord, writeMetricTrackerState } from "../internal/storage.js";

describe("metric tracker storage", () => {
  it("returns seeded V1 state when storage is empty", () => {
    const state = readMetricTrackerState();
    expect(state.schemaVersion).toBe(1);
    expect(state.profile.preferredUnit).toBe("kg");
    expect(state.records.length).toBeGreaterThan(0);
  });

  it("persists normalized state", () => {
    const state = createSeedMetricTrackerState();
    writeMetricTrackerState(state);
    expect(JSON.parse(localStorage.getItem(METRIC_TRACKER_STATE_KEY) ?? "{}")).toMatchObject({ schemaVersion: 1 });
    expect(readMetricTrackerState().records).toHaveLength(state.records.length);
  });

  it("upserts, soft-deletes, and updates the profile", () => {
    const state = createSeedMetricTrackerState();
    const withRecord = upsertWeightRecord(state, {
      id: "mw_new",
      metricId: "weight",
      value: 143.2,
      unit: "jin",
      measuredAt: "2026-05-25T09:00:00.000",
      note: "斤单位",
    }, "2026-05-25T09:01:00.000");
    expect(withRecord.records.some((record) => record.id === "mw_new")).toBe(true);

    const deleted = deleteWeightRecord(withRecord, "mw_new", "2026-05-25T09:02:00.000");
    expect(deleted.records.find((record) => record.id === "mw_new")?.deleted).toBe(true);

    const profiled = updateWeightProfile(deleted, { heightCm: 180, targetWeightKg: 68, preferredUnit: "jin" });
    expect(profiled.profile).toEqual({ heightCm: 180, targetWeightKg: 68, preferredUnit: "jin" });
    expect(profiled.metrics.find((metric) => metric.id === "weight")?.goalValue).toBe(68);
  });
});
