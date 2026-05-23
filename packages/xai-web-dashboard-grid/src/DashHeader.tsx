/**
 * DashHeader — top of the dashboard module: greeting + bilingual date + Add-widget button.
 *
 * Ported from web design/module-dashboard.jsx:160-169 with two adaptations:
 * - The "百事 / Aki" name placeholder is replaced with the i18n key
 *   `dashboard.hello` (already exists in @repo/plugin-web-tokens i18n bundle).
 * - The button receives an `onAddWidget` callback. In v1 (this row) the
 *   callback is wired in P3 to emit `web:dashboard:add-widget-clicked`.
 */
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";

import { formatDashboardDate, pickGreetingKey } from "./internal/greeting.js";

export interface DashHeaderProps {
  /** Active language. */
  lang: Lang;
  /** Current tick — used for greeting band + date subline. */
  now: Date;
  /** Click handler for the Add-widget button. Wired in P3. */
  onAddWidget?: () => void;
}

/** PlusIcon — minimal inline SVG matching the prototype's <Icon name="plus" size={14}/>. */
function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function DashHeader({ lang, now, onAddWidget }: DashHeaderProps) {
  const { s } = useI18n(lang);
  const greetingKey = pickGreetingKey(now);
  const greeting = s(greetingKey);
  const hello = s("dashboard.hello");
  const dateStr = formatDashboardDate(now, lang);
  const addWidget = s("dashboard.add_widget");
  const ariaLabel = s("dashboard.add_widget_aria");

  return (
    <header className="dash-head">
      <div>
        <h1 className="dash-greeting">
          {greeting}, {hello}.
        </h1>
        <div className="dash-date">{dateStr}</div>
      </div>
      <button
        type="button"
        className="btn ghost dash-add"
        aria-label={ariaLabel}
        onClick={onAddWidget}
      >
        <PlusIcon />
        <span>{addWidget}</span>
      </button>
    </header>
  );
}
