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
