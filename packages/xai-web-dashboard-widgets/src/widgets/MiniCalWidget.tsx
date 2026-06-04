/**
 * MiniCalWidget — Mac-style monthly mini calendar (REAL DATA).
 *
 * §F real-data wiring: reads `xai_calendar_events` via `usePref`, computes
 * day-of-month dots via `dataReads/calMonthDots.monthDots`.
 *
 * Replaces `CAL_EVENTS` fixture import on the live path.
 * `CAL_EVENTS` export in fixtures.ts is KEPT for back-compat + fixtures.test.ts.
 *
 * Behavior unchanged:
 * - Monday-first week; prev/next month navigation.
 * - Clicking body (outside [data-no-drag]) calls ctx.goTo("calendar").
 * - .mc-head + .mc-foot carry data-no-drag.
 *
 * Empty month → no dots (the grid IS the honest empty state).
 *
 * All 5 colorPresets (mint|amber|blue|violet|rose) render via `.mc-dot-<color>`.
 * (RD4: `.mc-dot-rose` class added in F2 styles.css if absent.)
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #10
 */
import { useState } from "react";

import { usePref } from "@repo/plugin-web-storage";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Icon } from "../internal/Icon.js";
import { monthDots } from "../internal/dataReads/calMonthDots.js";

export interface MiniCalWidgetProps {
  lang: Lang;
  now: Date;
  goTo: (moduleId: string) => void;
}

function monthLabel(view: Date, lang: Lang): string {
  if (lang === "zh") {
    return `${view.getFullYear()} 年 ${view.getMonth() + 1} 月`;
  }
  return view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const WEEKDAY_HEADERS: Record<Lang, readonly string[]> = {
  en: ["M", "T", "W", "T", "F", "S", "S"],
  zh: ["一", "二", "三", "四", "五", "六", "日"],
};

export function MiniCalWidget({ lang, now, goTo }: MiniCalWidgetProps) {
  const { s } = useI18n(lang);
  const [offset, setOffset] = useState(0);
  const [store] = usePref("xai_calendar_events");

  const view = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const month = view.getMonth();
  const year = view.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1);
  const startCol = (firstDay.getDay() + 6) % 7; // Monday-first
  const todayInView =
    view.getMonth() === now.getMonth() && view.getFullYear() === now.getFullYear();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startCol; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Real calendar dots from xai_calendar_events
  const dots = monthDots(store, year, month);

  const handleBodyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest("[data-no-drag]")) return;
    goTo("calendar");
  };

  return (
    <div className="widget-content w-mini-cal-body" onClick={handleBodyClick}>
      <header className="mc-head" data-no-drag>
        <button
          type="button"
          className="mc-nav"
          onClick={(e) => {
            e.stopPropagation();
            setOffset((o) => o - 1);
          }}
          aria-label="Previous month"
        >
          <Icon name="arrowL" size={12} />
        </button>
        <div className="mc-title">
          <div className="mc-m">{monthLabel(view, lang)}</div>
          {todayInView && <div className="mc-today mono">{now.getDate()}</div>}
        </div>
        <button
          type="button"
          className="mc-nav"
          onClick={(e) => {
            e.stopPropagation();
            setOffset((o) => o + 1);
          }}
          aria-label="Next month"
        >
          <Icon name="arrowR" size={12} />
        </button>
      </header>
      <div className="mc-grid">
        {WEEKDAY_HEADERS[lang].map((d, i) => (
          <div key={"h" + i} className="mc-wd">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d == null) return <div key={"e" + i} className="mc-cell empty" />;
          const isToday = todayInView && d === now.getDate();
          const dayDots = dots[d] ?? [];
          const ev = dayDots.slice(0, 3);
          return (
            <div
              key={"d" + i}
              className={
                "mc-cell" + (isToday ? " today" : "") + (dayDots.length ? " has" : "")
              }
              data-day={d}
            >
              <span className="mc-num">{d}</span>
              {ev.length > 0 && (
                <span className="mc-dots">
                  {ev.map((color, ii) => (
                    <span key={ii} className={"mc-dot mc-dot-" + color} />
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <footer className="mc-foot" data-no-drag>
        <button
          type="button"
          className="mc-jump"
          onClick={(e) => {
            e.stopPropagation();
            goTo("calendar");
          }}
        >
          {s("dashboard.widgets.mini_cal.open")} <Icon name="arrowR" size={11} />
        </button>
      </footer>
    </div>
  );
}
