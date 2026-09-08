/**
 * WeatherWidget — current conditions (§G-A real store + Open-Meteo refresh).
 *
 * §G-A wiring:
 *   - reads UserWeather | null from useWeather() (xai_dashboard_weather key)
 *   - honest empty state when null ("Set your weather" / "设置你的天气")
 *   - Edit button (data-no-drag) opens native <dialog> WeatherEditor
 *   - renders temp + condition icon + optional hi/lo on set/manual weather
 *   - renders a compact 3-day forecast when Open-Meteo data is cached
 *
 * WEATHER fixture export is kept for fixtures.test.ts back-compat (RW4).
 * Ported from `web design/module-dashboard.jsx` lines 402-430.
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §G
 * API:    packages/xai-web-dashboard-widgets/docs/api.md §G.3.5
 */
import { useEffect, useState } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Icon } from "../internal/Icon.js";
import type { WeatherCitySearchFn, WeatherFetchFn } from "../internal/weatherStore/types.js";
import { CONDITION_ICON } from "../internal/weatherStore/types.js";
import { useWeather } from "../internal/weatherStore/useWeather.js";
import {
  fetchOpenMeteoWeather,
  hasOpenMeteoLocation,
  isOpenMeteoCacheFresh,
  searchOpenMeteoCities,
} from "../internal/weatherStore/openMeteo.js";
import { strWeather } from "../internal/strings.js";
import { WeatherEditor } from "../WeatherEditor.js";

export interface WeatherWidgetProps {
  lang: Lang;
  fetchWeather?: WeatherFetchFn;
  searchCities?: WeatherCitySearchFn;
}

type FetchState = "idle" | "loading" | "error";

function formatWeatherNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatForecastDate(date: string, lang: Lang): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date.slice(5);
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    weekday: "short",
  }).format(parsed);
}

export function WeatherWidget({
  lang,
  fetchWeather = fetchOpenMeteoWeather,
  searchCities = searchOpenMeteoCities,
}: WeatherWidgetProps) {
  const { s } = useI18n(lang);
  const { weather, set } = useWeather();
  const [editorOpen, setEditorOpen] = useState(false);
  const [fetchState, setFetchState] = useState<FetchState>("idle");

  useEffect(() => {
    if (!hasOpenMeteoLocation(weather)) return;
    if (isOpenMeteoCacheFresh(weather)) {
      setFetchState("idle");
      return;
    }

    let cancelled = false;
    setFetchState("loading");
    fetchWeather(weather)
      .then((draft) => {
        if (cancelled) return;
        set(draft);
        setFetchState("idle");
      })
      .catch(() => {
        if (!cancelled) setFetchState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [weather?.latitude, weather?.longitude, weather?.fetchedAt, fetchWeather, set]);

  const hasCurrentWeather = weather?.temp !== undefined && weather.condition !== undefined;

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
          <Icon name="sun" size={12} />
        </button>
      </div>

      {weather === null ? (
        /* Honest empty state */
        <button
          type="button"
          className="ww-empty"
          data-no-drag
          onClick={() => setEditorOpen(true)}
        >
          <span>{strWeather("empty", lang)}</span>
        </button>
      ) : hasCurrentWeather ? (
        /* User-set or Open-Meteo weather */
        <>
          <div className="ww-now">
            <div className="ww-temp mono">{formatWeatherNumber(weather.temp!)}°</div>
            <div className="ww-info">
              <Icon name={CONDITION_ICON[weather.condition!]} size={28} color="var(--text-2)" />
              <div>
                <div className="ww-cond">{strWeather(`cond_${weather.condition!}`, lang)}</div>
                {weather.hi !== undefined && weather.lo !== undefined && (
                  <div className="ww-hilo mono">
                    {formatWeatherNumber(weather.hi)}° / {formatWeatherNumber(weather.lo)}°
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="ww-source">
            <span>
              {weather.provider === "open-meteo"
                ? strWeather("source_open_meteo", lang)
                : strWeather("source_manual", lang)}
            </span>
            {fetchState === "loading" && <span>{strWeather("updating", lang)}</span>}
          </div>
          {(weather.apparentTemp !== undefined ||
            weather.humidity !== undefined ||
            weather.windSpeed !== undefined ||
            weather.precipitationProbability !== undefined) && (
            <div className="ww-metrics">
              {weather.apparentTemp !== undefined && (
                <span>{`${strWeather("feels_like", lang)} ${formatWeatherNumber(weather.apparentTemp)}°`}</span>
              )}
              {weather.humidity !== undefined && (
                <span>{`${strWeather("humidity", lang)} ${formatWeatherNumber(weather.humidity)}%`}</span>
              )}
              {weather.windSpeed !== undefined && (
                <span>{`${strWeather("wind", lang)} ${formatWeatherNumber(weather.windSpeed)} km/h`}</span>
              )}
              {weather.precipitationProbability !== undefined && (
                <span>{`${strWeather("rain_chance", lang)} ${weather.precipitationProbability}%`}</span>
              )}
            </div>
          )}
          {fetchState === "error" && (
            <button type="button" className="ww-alert" data-no-drag onClick={() => setEditorOpen(true)}>
              {strWeather("fetch_error", lang)}
            </button>
          )}
          {weather.forecast && weather.forecast.length > 0 && (
            <div className="ww-forecast" aria-label={strWeather("search_results", lang)}>
              {weather.forecast.map((day) => (
                <div className="wwf-day" key={day.date}>
                  <span className="wwf-d">{formatForecastDate(day.date, lang)}</span>
                  <Icon name={CONDITION_ICON[day.condition]} size={14} />
                  <span className="wwf-t mono">
                    {day.hi !== undefined ? formatWeatherNumber(day.hi) : "--"}°
                    <span className="muted">
                      {day.lo !== undefined ? formatWeatherNumber(day.lo) : "--"}°
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <button
          type="button"
          className="ww-empty ww-empty--pending"
          data-no-drag
          onClick={() => setEditorOpen(true)}
        >
          <span>
            {fetchState === "loading" ? strWeather("updating", lang) : strWeather("needs_manual", lang)}
          </span>
        </button>
      )}

      <WeatherEditor
        open={editorOpen}
        lang={lang}
        initial={weather}
        searchCities={searchCities}
        onSave={(draft) => {
          set(draft);
          setEditorOpen(false);
        }}
        onClose={() => setEditorOpen(false)}
      />
    </div>
  );
}
