import { describe, it, expect } from "vitest";
import { getPresetCountdowns, mergePresetCountdowns } from "../internal/presetCards.js";
import type { CountdownCard } from "../types.js";

describe("preset countdowns", () => {
  it("creates the nine default preset countdowns", () => {
    const presets = getPresetCountdowns(new Date(2026, 5, 4, 9, 0));
    expect(presets).toHaveLength(9);
    expect(presets.map((card) => card.preset_id)).toEqual([
      "christmas",
      "yuandan",
      "new-year",
      "spring-festival",
      "month-end",
      "next-month",
      "next-year",
      "quarter-end",
      "year-end",
    ]);
    expect(presets.find((card) => card.preset_id === "spring-festival")?.target_date).toBe("2027-02-06");
  });

  it("does not re-add a deleted preset", () => {
    const deleted: CountdownCard = {
      ...getPresetCountdowns(new Date(2026, 5, 4, 9, 0))[0]!,
      status: "deleted",
      is_hidden: true,
      deleted_at: "2026-06-04T09:00:00.000Z",
    };
    const merged = mergePresetCountdowns([deleted], new Date(2026, 5, 4, 9, 0));
    const christmas = merged.filter((card) => card.preset_id === "christmas");
    expect(christmas).toHaveLength(1);
    expect(christmas[0]!.status).toBe("deleted");
  });
});
