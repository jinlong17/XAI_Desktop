/**
 * LineChart.tsx — SVG line chart with shaded area + dot markers + 4 gridlines.
 *
 * Ported from web design/module-statistics.jsx LineChart.
 * Deterministic; empty data renders an empty-state placeholder, not NaN.
 *
 * api.md §7.
 */

import * as React from "react";

export interface LineChartProps {
  labels: string[];
  data: number[];
  colorVar: string;
  unit?: string;
}

const W = 600;
const H = 180;
const PAD = 30;

export function LineChart({
  labels,
  data,
  colorVar,
}: LineChartProps): React.ReactElement {
  if (data.length === 0) {
    return (
      <div className="line-chart">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        />
        <div className="lc-labels" />
      </div>
    );
  }

  const max = data.reduce((a, b) => Math.max(a, b), Number.NEGATIVE_INFINITY);
  const min = data.reduce((a, b) => Math.min(a, b), Number.POSITIVE_INFINITY);
  const span = max - min === 0 ? 1 : max - min;
  const denom = Math.max(1, data.length - 1);
  const pts = data.map((v, i) => {
    const x = PAD + (i * (W - 2 * PAD)) / denom;
    const y = H - PAD - ((v - min) / span) * (H - 2 * PAD);
    return { x, y };
  });

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const last = pts[pts.length - 1]!;
  const first = pts[0]!;
  const areaPath = `${linePath} L${last.x},${H - PAD} L${first.x},${H - PAD} Z`;

  const gradientId = "lc-fill-" + Math.abs(hashString(colorVar)).toString(36);

  return (
    <div className="line-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={colorVar} stopOpacity=".25" />
            <stop offset="1" stopColor={colorVar} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((g) => {
          const y = PAD + (g * (H - 2 * PAD)) / 3;
          return (
            <line
              key={g}
              x1={PAD}
              x2={W - PAD}
              y1={y}
              y2={y}
              stroke="var(--border-1)"
              strokeWidth="1"
            />
          );
        })}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={colorVar}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill={colorVar} />
            <circle cx={p.x} cy={p.y} r="6" fill={colorVar} opacity=".18" />
          </g>
        ))}
      </svg>
      <div className="lc-labels">
        {labels.map((l, i) => (
          <span key={`${l}-${i}`}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// Tiny djb2 hash so we get stable gradient IDs without colliding across charts.
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h | 0;
}
