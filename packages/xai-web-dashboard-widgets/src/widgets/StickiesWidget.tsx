/**
 * StickiesWidget — rotated note stack.
 *
 * Ported from `web design/module-dashboard.jsx` lines 431-449.
 */
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Icon } from "../internal/Icon.js";
import { STICKIES } from "../internal/fixtures.js";

export interface StickiesWidgetProps {
  lang: Lang;
}

export function StickiesWidget({ lang }: StickiesWidgetProps) {
  const { s } = useI18n(lang);
  return (
    <div className="widget-content w-stickies-body">
      <div className="wgt-h">
        <Icon name="note" size={14} />
        <span>{s("dashboard.sticky_notes")}</span>
        <span className="grow" />
        <button type="button" className="icon-btn" data-no-drag aria-label={s("dashboard.sticky_notes")}>
          <Icon name="plus" size={14} />
        </button>
      </div>
      <div className="sticky-stack">
        {STICKIES.map((n, i) => (
          <div
            key={n.id}
            className="sticky"
            style={{
              background: n.color,
              transform: `rotate(${(i - 1) * 2}deg)`,
            }}
          >
            {n.text[lang]}
          </div>
        ))}
      </div>
    </div>
  );
}
