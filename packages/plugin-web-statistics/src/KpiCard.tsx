/**
 * KpiCard.tsx — single KPI cell.
 *
 * Renders icon + label + value (+ optional unit) + trend.
 * api.md §7.
 */

import * as React from "react";
import type { KpiCellId } from "./types.js";
import {
  IconCheck,
  IconFlame,
  IconPin,
  IconTimer,
} from "./internal/icons.js";

export interface KpiCardProps {
  cellId: KpiCellId;
  colorVar: string;
  icon: "check" | "timer" | "pin" | "flame";
  label: string;
  value: string | number;
  unit?: string;
  trend: string;
}

const ICON_BY_NAME = {
  check: IconCheck,
  timer: IconTimer,
  pin: IconPin,
  flame: IconFlame,
} as const;

export function KpiCard({
  cellId,
  colorVar,
  icon,
  label,
  value,
  unit,
  trend,
}: KpiCardProps): React.ReactElement {
  const Icon = ICON_BY_NAME[icon];
  const iconBg = `color-mix(in oklch, ${colorVar} 14%, transparent)`;
  return (
    <div
      className="kpi panel"
      data-cell-id={cellId}
      aria-label={`KPI ${cellId}`}
    >
      <div className="kpi-head">
        <span
          className="kpi-ico"
          style={{ color: colorVar, background: iconBg }}
        >
          <Icon size={14} />
        </span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-row-val">
        <div className="kpi-val mono">
          {value}
          {unit ? <span className="kpi-unit">{unit}</span> : null}
        </div>
        <div className="kpi-trend">{trend}</div>
      </div>
    </div>
  );
}
