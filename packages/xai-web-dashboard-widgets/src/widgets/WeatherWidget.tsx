/**
 * WeatherWidget — current temp + 5-day forecast.
 *
 * Mock-fixture driven (fixtures.WEATHER) per design.md §1.1 #11.
 * Ported from `web design/module-dashboard.jsx` lines 402-430.
 */
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Icon } from "../internal/Icon.js";
import { WEATHER } from "../internal/fixtures.js";

export interface WeatherWidgetProps {
  lang: Lang;
}

export function WeatherWidget({ lang }: WeatherWidgetProps) {
  const { s } = useI18n(lang);
  return (
    <div className="widget-content w-weather-body">
      <div className="ww-head">
        <span>
          {s("dashboard.weather")} · {WEATHER.city[lang]}
        </span>
      </div>
      <div className="ww-now">
        <div className="ww-temp mono">{WEATHER.temp}°</div>
        <div className="ww-info">
          <Icon name={WEATHER.icon} size={28} color="var(--text-2)" />
          <div>
            <div className="ww-cond">{WEATHER.condition[lang]}</div>
            <div className="ww-hilo mono">
              {WEATHER.hi}° / {WEATHER.lo}°
            </div>
          </div>
        </div>
      </div>
      <div className="ww-forecast">
        {WEATHER.forecast.map((d, i) => (
          <div key={i} className="wwf-day">
            <div className="wwf-d">{d.d[lang]}</div>
            <Icon name={d.ico} size={16} color="var(--text-2)" />
            <div className="wwf-t mono">
              {d.hi}°<span className="muted">{d.lo}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
