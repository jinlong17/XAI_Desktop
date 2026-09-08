/**
 * Verifies the xai_pref_week_start entry exists in the upstream registry
 * with the expected shape. AC-REGISTRY-1..2.
 *
 * This test is scoped to the calendar row only — sibling registry-count tests
 * in @repo/plugin-web-storage are out of this row's write scope (per
 * user prompt §"Concurrency rules"). The count drift is tracked as a
 * cross-row housekeeping follow-up in the verify report.
 */
import { describe, it, expect } from "vitest";
import { PREF_REGISTRY } from "@repo/plugin-web-storage";

describe("xai_pref_week_start registry presence", () => {
  it("AC-REGISTRY-1: PREF_REGISTRY.xai_pref_week_start exists", () => {
    expect(PREF_REGISTRY.xai_pref_week_start).toBeDefined();
  });

  it("AC-REGISTRY-2: entry shape matches expectations", () => {
    const entry = PREF_REGISTRY.xai_pref_week_start;
    expect(entry.key).toBe("xai_pref_week_start");
    expect(entry.codec).toBe("number");
    expect(entry.default).toBe(0);
    expect(entry.schemaVersion).toBe(1);
    expect(entry.owner).toBe("xai-web-calendar");
    expect(entry.category).toBe("pref");
  });
});

describe("xai_calendar_view registry presence (gap-closure row #4)", () => {
  it("AC-REGISTRY-EXT-1: PREF_REGISTRY.xai_calendar_view exists", () => {
    expect(PREF_REGISTRY.xai_calendar_view).toBeDefined();
  });

  it("AC-REGISTRY-EXT-2: entry shape — codec string, default month, category module", () => {
    const entry = PREF_REGISTRY.xai_calendar_view;
    expect(entry.key).toBe("xai_calendar_view");
    expect(entry.codec).toBe("string");
    expect(entry.default).toBe("month");
    expect(entry.schemaVersion).toBe(1);
    expect(entry.owner).toBe("xai-web-calendar");
    expect(entry.category).toBe("module");
  });
});
