/**
 * BarChart.tsx — vertical bar chart with track + fill + label.
 *
 * Ported from web design/module-statistics.jsx BarChart.
 * Deterministic; empty data renders zero-height bars without NaN.
 *
 * api.md §7.
 */

import * as React from "react";

export interface BarChartProps {
  labels: string[];
  data: number[];
  colorVar: string;
  unit?: string;
}

export function BarChart({
  labels,
  data,
  colorVar,
  unit,
}: BarChartProps): React.ReactElement {
  const max = data.reduce((acc, v) => (v > acc ? v : acc), 0);
  const safeMax = max > 0 ? max : 1;
  const colCount = Math.max(1, data.length);
  const style: React.CSSProperties = { ["--bar-cols" as string]: colCount };
  return (
    <div className="bar-chart" style={style}>
      {data.map((v, i) => {
        const heightPct = max === 0 ? 0 : (v / safeMax) * 100;
        const label = labels[i] ?? "";
        return (
          <div key={`${label}-${i}`} className="bar-col">
            <div className="bar-val mono">
              {v}
              {unit ?? ""}
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ height: `${heightPct}%`, background: colorVar }}
              />
            </div>
            <div className="bar-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
