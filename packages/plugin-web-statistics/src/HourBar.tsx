/**
 * HourBar.tsx — 24-column productivity bar chart with peak auto-highlight.
 *
 * Ported from web design/module-statistics.jsx HourBar.
 *
 * api.md §7.
 */

import * as React from "react";

export interface HourBarProps {
  data: number[];
  peak: number | null;
}

export function HourBar({ data, peak }: HourBarProps): React.ReactElement {
  const max = data.reduce((a, b) => Math.max(a, b), 0);
  const safeMax = max > 0 ? max : 1;
  // Pad / trim to 24 columns defensively.
  const cols = data.length === 24 ? data : new Array<number>(24).fill(0);
  return (
    <div className="hour-bar">
      {cols.map((v, i) => {
        const isPeak = peak !== null && i === peak;
        const heightPct = max === 0 ? 0 : (v / safeMax) * 100;
        const classes = "hbar-col" + (isPeak ? " peak" : "");
        return (
          <div key={i} className={classes}>
            <div className="hbar-track">
              <div className="hbar-fill" style={{ height: `${heightPct}%` }} />
            </div>
            {i % 3 === 0 && (
              <div className="hbar-label mono">
                {String(i).padStart(2, "0")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
