/**
 * UpcomingWidget — list of 4 upcoming events.
 *
 * Ported from `web design/module-dashboard.jsx` lines 473-496.
 */
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Icon } from "../internal/Icon.js";
import { UPCOMING } from "../internal/fixtures.js";

export interface UpcomingWidgetProps {
  lang: Lang;
}

export function UpcomingWidget({ lang }: UpcomingWidgetProps) {
  const { s } = useI18n(lang);
  return (
    <div className="widget-content w-upcoming-body">
      <div className="wgt-h">
        <Icon name="calendar" size={14} />
        <span>{s("dashboard.upcoming")}</span>
      </div>
      <ul className="upc-list">
        {UPCOMING.map((e) => (
          <li key={e.id} className="upc-row" data-upc-id={e.id}>
            <div className="upc-date">
              <div className="upc-d mono">{e.date}</div>
              <div className="upc-m">{e.month[lang]}</div>
            </div>
            <div className="grow upc-body">
              <div className="upc-title">{e.title[lang]}</div>
              <div className="upc-time mono">{e.time}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
