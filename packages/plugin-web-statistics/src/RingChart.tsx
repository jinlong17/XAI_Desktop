/**
 * RingChart.tsx — donut chart of percent-weighted segments.
 *
 * Ported from web design/module-statistics.jsx RingChart.
 *
 * api.md §7.
 */

import * as React from "react";

export interface RingChartProps {
  segments: Array<{ percent: number; color: string }>;
}

const R = 50;
const CIRC = 2 * Math.PI * R;

export function RingChart({ segments }: RingChartProps): React.ReactElement {
  const total = segments.reduce((a, s) => a + s.percent, 0);
  // Always render the background circle. When total === 0, that's all we render.
  let acc = 0;
  return (
    <svg
      viewBox="0 0 120 120"
      width="160"
      height="160"
      className="ringchart"
      aria-hidden="true"
    >
      <circle
        cx="60"
        cy="60"
        r={R}
        fill="none"
        stroke="var(--border-1)"
        strokeWidth="10"
      />
      {total > 0 &&
        segments.map((seg, i) => {
          const len = (seg.percent / total) * CIRC;
          const offset = CIRC - acc;
          acc += len;
          return (
            <circle
              key={i}
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${len} ${CIRC - len}`}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset .4s var(--ease-out)" }}
            />
          );
        })}
    </svg>
  );
}
