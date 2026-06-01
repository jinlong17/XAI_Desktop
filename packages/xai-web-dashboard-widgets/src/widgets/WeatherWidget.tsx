/**
 * WeatherWidget — manual-entry current conditions (§G-A real store).
 *
 * §G-A wiring:
 *   - reads UserWeather | null from useWeather() (xai_dashboard_weather key)
 *   - honest empty state when null ("Set your weather" / "设置你的天气")
 *   - Edit button (data-no-drag) opens native <dialog> WeatherEditor
 *   - renders temp + condition icon + optional hi/lo on set weather
 *   - 5-day forecast REMOVED on the live path (fixture export kept — RW4)
 *
 * WEATHER fixture export is kept for fixtures.test.ts back-compat (RW4).
 * Ported from `web design/module-dashboard.jsx` lines 402-430.
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §G
 * API:    packages/xai-web-dashboard-widgets/docs/api.md §G.3.5
 */
import { useState } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Icon } from "../internal/Icon.js";
import { CONDITION_ICON } from "../internal/weatherStore/types.js";
import { useWeather } from "../internal/weatherStore/useWeather.js";
import { strWeather } from "../internal/strings.js";
import { WeatherEditor } from "../WeatherEditor.js";

export interface WeatherWidgetProps {
  lang: Lang;
}

export function WeatherWidget({ lang }: WeatherWidgetProps) {
  const { s } = useI18n(lang);
  const { weather, set } = useWeather();
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div className="widget-content w-weather-body">
      <div className="ww-head">
        <span>
          {s("dashboard.weather")}
          {weather ? ` · ${weather.city}` : ""}
        </span>
        <button
          type="button"
          className="ww-edit-btn"
          data-no-drag
          aria-label={strWeather("edit_aria", lang)}
          onClick={() => setEditorOpen(true)}
        >
          <Icon name="note" size={12} />
        </button>
      </div>

      {weather === null ? (
        /* Honest empty state */
        <div className="ww-empty">
          <span>{strWeather("empty", lang)}</span>
        </div>
      ) : (
        /* User-set weather */
        <>
          <div className="ww-now">
            <div className="ww-temp mono">{weather.temp}°</div>
            <div className="ww-info">
              <Icon name={CONDITION_ICON[weather.condition]} size={28} color="var(--text-2)" />
              <div>
                <div className="ww-cond">{strWeather(`cond_${weather.condition}`, lang)}</div>
                {weather.hi !== undefined && weather.lo !== undefined && (
                  <div className="ww-hilo mono">
                    {weather.hi}° / {weather.lo}°
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 5-day forecast REMOVED on live path (RW4 — fixture export kept) */}
        </>
      )}

      <WeatherEditor
        open={editorOpen}
        lang={lang}
        initial={weather}
        onSave={(draft) => {
          set(draft);
          setEditorOpen(false);
        }}
        onClose={() => setEditorOpen(false)}
      />
    </div>
  );
}
