/**
 * UpcomingWidget — list of upcoming events (REAL DATA).
 *
 * §F real-data wiring: reads `xai_calendar_events` via `usePref`, selects
 * the next ≤4 events via `dataReads/calUpcoming.upcomingEvents`.
 *
 * Metric: next ≤4 events with startISO >= now, sorted ascending.
 * Date basis = LOCAL-CLOCK ISO ("YYYY-MM-DDTHH:MM", no TZ suffix).
 * Recurrence: minimal local expansion (non-recurring + daily + weekly; N3).
 *
 * Empty state: honest "no upcoming events" label (NOT a fixture sample —
 * per §F.3 Q3 divergence from §E stickies; calendar-empty is an honest view).
 *
 * `now` is passed from the registration ctx (F2 N1 build note: 1-line additive
 * thread in registrations.tsx; NOT a WidgetRenderContext type change).
 *
 * NO new registry key; zero write path; zero cross-plugin import.
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #11
 */
import { usePref } from "@repo/plugin-web-storage";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Icon } from "../internal/Icon.js";
import { upcomingEvents } from "../internal/dataReads/calUpcoming.js";
import { strEmpty } from "../internal/strings.js";

export interface UpcomingWidgetProps {
  lang: Lang;
  now: Date;
  goTo?: (moduleId: string) => void;
}

const MONTH_NAMES: Record<Lang, readonly string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  zh: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
};

export function UpcomingWidget({ lang, now, goTo = () => {} }: UpcomingWidgetProps) {
  const { s } = useI18n(lang);
  const [store] = usePref("xai_calendar_events");

  const items = upcomingEvents(store, now, 60, 4);

  return (
    <div className="widget-content w-upcoming-body">
      <div className="wgt-h">
        <Icon name="calendar" size={14} />
        <span>{s("dashboard.upcoming")}</span>
        <span className="grow" />
        <button
          type="button"
          className="widget-open-btn"
          data-no-drag
          onClick={() => goTo("calendar")}
        >
          {s("dashboard.widgets.mini_cal.open")} <Icon name="arrowR" size={11} />
        </button>
      </div>
      {items.length === 0 ? (
        <button
          type="button"
          className="upc-empty upc-empty--action"
          data-no-drag
          onClick={() => goTo("calendar")}
        >
          {strEmpty("upcoming_empty", lang)}
        </button>
      ) : (
        <ul className="upc-list">
          {items.map((item) => {
            const [, monthStr, dayStr] = item.dateKey.split("-");
            const monthIdx = parseInt(monthStr ?? "1", 10) - 1;
            const monthLabel = MONTH_NAMES[lang][monthIdx] ?? item.dateKey;
            const dayNum = dayStr ?? "";
            return (
              <li
                key={item.id}
                className="upc-row"
                data-no-drag
                role="button"
                tabIndex={0}
                onClick={() => goTo("calendar")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goTo("calendar");
                  }
                }}
              >
                <div className="upc-date">
                  <div className="upc-d mono">{dayNum}</div>
                  <div className="upc-m">{monthLabel}</div>
                </div>
                <div className="grow upc-body">
                  <div className="upc-title">{item.title}</div>
                  <div className="upc-time mono">{item.timeStr}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
