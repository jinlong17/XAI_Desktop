/**
 * StatusOverviewBanner — PM template's progress banner.
 *
 * Left: title + description. Center: SVG ring chart driven by
 * `computeRingSegments` + `computeDonePct`. Right: legend.
 *
 * Port of `web design/module-board.jsx` lines 1422..1492.
 */

import type { BoardListData } from "@repo/plugin-web-board-core";
import { computeRingSegments, computeDonePct } from "./internal/ringMath.js";
import { STR_STATUS_OVERVIEW, type Lang } from "./internal/strings.js";

export interface StatusOverviewBannerProps {
  lists: readonly BoardListData[];
  lang: Lang;
  onClose?: () => void;
}

const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function StatusOverviewBanner({ lists, lang, onClose }: StatusOverviewBannerProps) {
  const segs = computeRingSegments(lists, lang);
  const donePct = computeDonePct(lists);
  const total = segs.reduce((n, s) => n + s.count, 0);
  const sum = total || 1;

  let acc = 0;
  const ringCircles = segs.map((seg) => {
    const len = (seg.count / sum) * RING_CIRCUMFERENCE;
    const offset = RING_CIRCUMFERENCE - acc;
    acc += len;
    return {
      listId: seg.listId,
      color: seg.color,
      dashArray: `${len} ${RING_CIRCUMFERENCE - len}`,
      dashOffset: offset,
    };
  });

  return (
    <div className="status-overview panel" data-testid="status-overview">
      <div className="so-left">
        <header className="so-head">
          <h3>{STR_STATUS_OVERVIEW.title[lang]}</h3>
          <span className="muted">{STR_STATUS_OVERVIEW.last7Days[lang]}</span>
          {onClose && (
            <button
              type="button"
              className="icon-btn"
              onClick={onClose}
              aria-label={lang === "zh" ? "关闭" : "Close"}
            >
              ×
            </button>
          )}
        </header>
        <p className="so-desc">{STR_STATUS_OVERVIEW.description[lang]}</p>
      </div>

      <div className="so-ring">
        <svg viewBox="0 0 120 120" width="148" height="148" data-testid="so-ring-svg">
          <circle
            cx="60"
            cy="60"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--border-1)"
            strokeWidth="14"
          />
          {ringCircles.map((rc) => (
            <circle
              key={rc.listId}
              cx="60"
              cy="60"
              r={RING_RADIUS}
              fill="none"
              stroke={rc.color}
              strokeWidth="14"
              strokeDasharray={rc.dashArray}
              strokeDashoffset={rc.dashOffset}
              transform="rotate(-90 60 60)"
            />
          ))}
        </svg>
        <div className="so-ring-center">
          <div className="so-ring-pct mono" data-testid="so-ring-pct">
            {donePct}%
          </div>
          <div className="so-ring-label">{STR_STATUS_OVERVIEW.doneLabel[lang]}</div>
        </div>
      </div>

      <ul className="so-legend">
        {segs.map((s) => (
          <li key={s.listId}>
            <span className="leg-dot" style={{ background: s.color }}></span>
            <span className="so-leg-name">{s.label}</span>
            <span className="so-leg-val mono">{s.count}</span>
          </li>
        ))}
        <li className="so-total">
          <span className="so-leg-name">{STR_STATUS_OVERVIEW.total[lang]}</span>
          <span className="so-leg-val mono">{total}</span>
        </li>
      </ul>
    </div>
  );
}
