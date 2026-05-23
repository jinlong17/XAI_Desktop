import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Heatmap } from "../Heatmap.js";
import type { HeatmapCell } from "../types.js";

function makeCells(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (let w = 0; w < 26; w++) {
    for (let d = 0; d < 7; d++) {
      cells.push({
        week: w,
        day: d,
        date: "2026-01-01",
        minutes: 0,
        level: 0,
      });
    }
  }
  return cells;
}

describe("Heatmap", () => {
  it("HM1: renders exactly 182 .heat-cell divs", () => {
    const { container } = render(<Heatmap cells={makeCells()} />);
    expect(container.querySelectorAll(".heat-cell").length).toBe(182);
  });

  it("HM2: cells with level=3 carry .heat-3 class", () => {
    const cells = makeCells();
    cells[5]!.level = 3;
    const { container } = render(<Heatmap cells={cells} />);
    const lvl3 = container.querySelectorAll(".heat-3");
    expect(lvl3.length).toBeGreaterThan(0);
  });

  it("HM3: all level 0 still renders 182 cells", () => {
    const { container } = render(<Heatmap cells={makeCells()} />);
    expect(container.querySelectorAll(".heat-cell").length).toBe(182);
  });
});
