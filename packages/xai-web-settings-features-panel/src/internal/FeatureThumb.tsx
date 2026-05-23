/**
 * @internal — FeatureThumb.tsx
 *
 * Inline SVG previews for each FeatureId. Ports the 6 source thumbnails
 * (cal/matrix/pomo/habits/board/med) from web design/module-settings.jsx
 * lines 197-300 and adds 2 new ones (tasks/dash) following the same visual
 * idiom (280×130 viewBox, tokens.css palette).
 *
 * No external image fetches; safe for offline / CSP-locked deployments.
 */

import * as React from "react";
import type { FeatureId } from "../featureIds.js";

interface FeatureThumbProps {
  readonly kind: FeatureId;
}

export function FeatureThumb({ kind }: FeatureThumbProps): React.ReactElement {
  switch (kind) {
    case "tasks":      return <TasksThumb />;
    case "board":      return <BoardThumb />;
    case "dashboard":  return <DashboardThumb />;
    case "calendar":   return <CalendarThumb />;
    case "matrix":     return <MatrixThumb />;
    case "pomodoro":   return <PomodoroThumb />;
    case "habits":     return <HabitsThumb />;
    case "meditation": return <MeditationThumb />;
  }
}

// ---- Tasks (new) -----------------------------------------------------------
function TasksThumb(): React.ReactElement {
  return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" data-thumb-kind="tasks">
      <rect width="280" height="130" fill="oklch(96% 0.02 165)" />
      {Array.from({ length: 5 }).map((_, i) => {
        const y = 14 + i * 22;
        const checked = i % 2 === 0;
        return (
          <g key={i}>
            <rect x="14" y={y} width="14" height="14" rx="3"
                  fill={checked ? "oklch(58% 0.10 165)" : "white"}
                  stroke="oklch(58% 0.10 165)" strokeWidth="1" />
            {checked && (
              <path d={`M17 ${y + 7} L20 ${y + 10} L25 ${y + 5}`}
                    stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            )}
            <rect x="36" y={y + 2} width={120 + (i % 3) * 30} height="4" rx="2" fill="#d9d9d9" />
            <rect x="36" y={y + 9} width="60" height="3" rx="2" fill="#eee" />
          </g>
        );
      })}
    </svg>
  );
}

// ---- Board (port from source line 263-276) ---------------------------------
function BoardThumb(): React.ReactElement {
  return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" data-thumb-kind="board">
      <rect width="280" height="130" fill="oklch(94% 0.02 220)" />
      {[10, 80, 150, 220].map((x, i) => (
        <g key={i}>
          <rect x={x} y="10" width="58" height="110" rx="6" fill="white" />
          <rect x={x + 6} y="16" width="40" height="4" fill="#ddd" />
          {Array.from({ length: 3 }).map((_, c) => (
            <rect
              key={c}
              x={x + 6}
              y={28 + c * 26}
              width="46"
              height="20"
              rx="3"
              fill={["#9bd1c5", "#a0c4ed", "#f5c97b"][c]}
              opacity="0.7"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

// ---- Dashboard (new) -------------------------------------------------------
function DashboardThumb(): React.ReactElement {
  return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" data-thumb-kind="dashboard">
      <rect width="280" height="130" fill="oklch(96% 0.02 240)" />
      {/* Clock card */}
      <rect x="10" y="10" width="80" height="50" rx="6" fill="white" />
      <text x="50" y="42" fontSize="18" textAnchor="middle" fill="oklch(40% 0.10 240)" fontWeight="600">10:24</text>
      {/* Mini cal card */}
      <rect x="100" y="10" width="80" height="50" rx="6" fill="white" />
      {Array.from({ length: 3 }).map((_, r) =>
        Array.from({ length: 5 }).map((_, c) => (
          <circle key={`${r}-${c}`} cx={110 + c * 13} cy={22 + r * 12} r="3"
                  fill={r === 1 && c === 2 ? "oklch(60% 0.13 165)" : "#e8e8e8"} />
        )),
      )}
      {/* Stats card */}
      <rect x="190" y="10" width="80" height="50" rx="6" fill="white" />
      <rect x="196" y="40" width="6" height="12" fill="oklch(70% 0.10 30)" />
      <rect x="206" y="32" width="6" height="20" fill="oklch(70% 0.10 60)" />
      <rect x="216" y="24" width="6" height="28" fill="oklch(70% 0.10 145)" />
      <rect x="226" y="36" width="6" height="16" fill="oklch(70% 0.10 240)" />
      <rect x="236" y="28" width="6" height="24" fill="oklch(70% 0.10 280)" />
      {/* Wide footer card */}
      <rect x="10" y="70" width="260" height="48" rx="6" fill="white" />
      <rect x="18" y="80" width="120" height="4" rx="2" fill="#d9d9d9" />
      <rect x="18" y="92" width="200" height="3" rx="2" fill="#eee" />
      <rect x="18" y="100" width="160" height="3" rx="2" fill="#eee" />
      <rect x="18" y="108" width="180" height="3" rx="2" fill="#eee" />
    </svg>
  );
}

// ---- Calendar (port from source line 196-207) ------------------------------
function CalendarThumb(): React.ReactElement {
  return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" data-thumb-kind="calendar">
      <rect width="280" height="130" fill="oklch(96% 0.02 165)" />
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 7 }).map((_, c) => {
          const x = 10 + c * 38;
          const y = 14 + r * 22;
          // Deterministic dotting (no Math.random) to keep tests stable.
          const hasBar = (r * 7 + c) % 5 === 2 || (r + c) % 4 === 1;
          const barW = ((r + c) % 3) * 4 + 16;
          const colors = ["#9bd1c5", "#f5c97b", "#c4b6e9", "#f5a3a3"];
          return (
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width="34" height="18" rx="2" fill="white" />
              {hasBar && (
                <rect x={x + 2} y={y + 4} width={barW} height="4" rx="2"
                      fill={colors[(r + c) % 4]} />
              )}
            </g>
          );
        }),
      )}
    </svg>
  );
}

// ---- Matrix (port from source line 208-222) --------------------------------
function MatrixThumb(): React.ReactElement {
  const cells: ReadonlyArray<readonly [number, number, string]> = [
    [20, 15, "#f5a3a3"],
    [160, 15, "#f5c97b"],
    [20, 80, "#a0c4ed"],
    [160, 80, "#9bd1c5"],
  ];
  return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" data-thumb-kind="matrix">
      <rect width="280" height="130" fill="white" />
      <line x1="140" y1="0" x2="140" y2="130" stroke="#e5e5e5" />
      <line x1="0" y1="65" x2="280" y2="65" stroke="#e5e5e5" />
      {cells.map(([x, y, c], i) => (
        <g key={i}>
          <circle cx={x} cy={y + 4} r="3" fill={c} />
          <rect x={x + 8} y={y + 2} width="40" height="4" fill="#ddd" />
          <rect x={x + 8} y={y + 10} width="30" height="3" fill="#eee" />
          <rect x={x + 8} y={y + 18} width="50" height="3" fill="#eee" />
        </g>
      ))}
    </svg>
  );
}

// ---- Pomodoro (port from source line 223-234) ------------------------------
function PomodoroThumb(): React.ReactElement {
  return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" data-thumb-kind="pomodoro">
      <rect width="280" height="130" fill="oklch(96% 0.04 30)" />
      <circle cx="100" cy="65" r="34" fill="none" stroke="white" strokeWidth="3" />
      <circle cx="100" cy="65" r="34" fill="none" stroke="oklch(60% 0.16 30)" strokeWidth="3"
              strokeDasharray="160 50" transform="rotate(-90 100 65)" />
      <text x="100" y="71" fontSize="14" textAnchor="middle" fill="oklch(40% 0.10 30)" fontWeight="700">
        16:36
      </text>
      <rect x="160" y="40" width="100" height="6" rx="3" fill="#eee" />
      <rect x="160" y="54" width="80" height="6" rx="3" fill="#eee" />
      <rect x="160" y="68" width="100" height="6" rx="3" fill="#eee" />
      <rect x="160" y="82" width="60" height="6" rx="3" fill="#eee" />
    </svg>
  );
}

// ---- Habits (port from source line 235-251) --------------------------------
function HabitsThumb(): React.ReactElement {
  return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" data-thumb-kind="habits">
      <rect width="280" height="130" fill="oklch(94% 0.06 145)" />
      {Array.from({ length: 4 }).map((_, r) => (
        <g key={r}>
          <circle cx="22" cy={22 + r * 26} r="9" fill="white" />
          <rect x="38" y={18 + r * 26} width="60" height="4" rx="2" fill="white" />
          <rect x="38" y={26 + r * 26} width="40" height="3" rx="2" fill="white" opacity="0.6" />
          {Array.from({ length: 7 }).map((_, c) => {
            // Deterministic — odd days filled, even unfilled.
            const filled = (r * 7 + c) % 3 !== 0;
            return (
              <circle
                key={c}
                cx={120 + c * 20}
                cy={22 + r * 26}
                r="4"
                fill={filled ? "oklch(60% 0.13 145)" : "none"}
                stroke={filled ? "none" : "white"}
                strokeWidth="1"
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

// ---- Meditation (port from source line 277-288) ----------------------------
function MeditationThumb(): React.ReactElement {
  return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" data-thumb-kind="meditation">
      <defs>
        <linearGradient id="med-thumb-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="oklch(45% 0.07 145)" />
          <stop offset="1" stopColor="oklch(20% 0.04 145)" />
        </linearGradient>
      </defs>
      <rect width="280" height="130" fill="url(#med-thumb-grad)" />
      <circle cx="140" cy="65" r="30" fill="none" stroke="oklch(82% 0.10 145)"
              strokeWidth="1" opacity="0.6" />
      <circle cx="140" cy="65" r="18" fill="none" stroke="oklch(82% 0.10 145)" strokeWidth="1.5" />
      <text x="140" y="69" fontSize="14" textAnchor="middle" fill="oklch(85% 0.08 145)" fontWeight="300">
        03:44
      </text>
    </svg>
  );
}
