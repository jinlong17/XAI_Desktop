/**
 * StatCard — a single 4-up stat card.
 *
 * Design: design.md §3 (stat-grid section)
 * CSS: design.md §4 — color-mix(in oklch, var(--token) 14%, transparent) for icon background.
 */

import React from "react";
import {
  CheckIcon,
  BoltIcon,
  TargetIcon,
  FireIcon,
} from "./internal/icons.js";

type StatIconName = "check" | "bolt" | "target" | "fire";

interface StatCardProps {
  icon: StatIconName;
  color: string;
  label: string;
  value: string | number;
  unit: string;
}

const ICON_MAP: Record<StatIconName, React.FC<{ size: number }>> = {
  check: CheckIcon,
  bolt: BoltIcon,
  target: TargetIcon,
  fire: FireIcon,
};

export function StatCard({ icon, color, label, value, unit }: StatCardProps) {
  const IconComponent = ICON_MAP[icon];
  const bgStyle = `color-mix(in oklch, ${color} 14%, transparent)`;

  return (
    <div className="stat-card panel">
      <div className="stat-head">
        <span
          className="stat-ico"
          style={{ color, background: bgStyle }}
        >
          {IconComponent && <IconComponent size={13} />}
        </span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value mono">
        {value}
        <span className="stat-unit">{unit}</span>
      </div>
    </div>
  );
}
