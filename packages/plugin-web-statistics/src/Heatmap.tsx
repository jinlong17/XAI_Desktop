/**
 * Heatmap.tsx — 26-week × 7-day deterministic focus heatmap.
 *
 * Renders 182 pre-computed cells (input from internal/heatmapCells.ts).
 * No Math.random anywhere in this module.
 *
 * api.md §7.
 */

import * as React from "react";
import type { HeatmapCell } from "./types.js";

export interface HeatmapProps {
  cells: HeatmapCell[];
}

export function Heatmap({ cells }: HeatmapProps): React.ReactElement {
  return (
    <div className="heatmap" role="img" aria-label="Focus heatmap (last 26 weeks)">
      {cells.map((cell, i) => (
        <div
          key={i}
          className={`heat-cell heat-${cell.level}`}
          data-date={cell.date}
          data-minutes={cell.minutes}
        />
      ))}
    </div>
  );
}
