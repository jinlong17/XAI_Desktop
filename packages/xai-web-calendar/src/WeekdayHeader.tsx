/**
 * WeekdayHeader — 7-column weekday label row.
 *
 * Pulls labels from `t.weekdays_short` (the Sun..Sat tuple) and rotates by
 * `weekStart`. Renders as `<div class="cal-weekheader">` matching the
 * prototype DOM.
 */

import type { JSX } from "react";
import type { I18NBundle, Lang } from "@repo/plugin-web-tokens";
import { weekdayLabels } from "./internal/weekdays.js";

interface WeekdayHeaderProps {
  weekStart: 0 | 1;
  t: I18NBundle;
  lang: Lang;
}

/** ZH labels — the prototype uses "周一/周二/...". Tokens bundle has "Sun..Sat"
 *  but not Chinese weekday names yet, so we inline ZH labels here. EN reads
 *  from `t.weekdays_short`. */
const ZH_WEEKDAYS_SHORT = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"] as const;

export function WeekdayHeader({ weekStart, t, lang }: WeekdayHeaderProps): JSX.Element {
  const source =
    lang === "zh" ? (ZH_WEEKDAYS_SHORT as readonly string[]) : t.weekdays_short;
  const labels = weekdayLabels(source, weekStart);
  return (
    <div className="cal-weekheader" role="row">
      {labels.map((label, i) => (
        <div key={i} className="cal-weekday" role="columnheader">
          {label}
        </div>
      ))}
    </div>
  );
}
