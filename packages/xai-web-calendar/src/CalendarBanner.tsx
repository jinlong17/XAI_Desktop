/**
 * CalendarBanner — sample-data banner at the bottom of the module.
 *
 * Matches prototype `.cal-banner` block (module-calendar.jsx:80-84).
 */

import type { JSX } from "react";
import type { I18NBundle } from "@repo/plugin-web-tokens";
import { CalIcon } from "./internal/icons.js";

interface CalendarBannerProps {
  t: I18NBundle;
}

export function CalendarBanner({ t }: CalendarBannerProps): JSX.Element {
  return (
    <div className="cal-banner">
      <CalIcon name="star" size={14} />
      <span>{t.cal.sample_banner}</span>
      <button type="button" className="banner-upgrade">
        {t.common.upgrade} <CalIcon name="chevR" size={12} />
      </button>
    </div>
  );
}
