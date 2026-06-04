/**
 * WeatherEditor — native <dialog> for setting the current weather.
 *
 * Pattern mirrors StickyComposer.tsx (§E):
 *   - showModal()/close() driven by `open` prop
 *   - native `cancel` event for ESC
 *   - backdrop click via e.target === dialogRef.current
 *   - setTimeout(0) autofocus on city input
 *   - role="radiogroup" for condition preset picker
 *
 * Props:
 *   open     — controls visibility (true → showModal, false → close)
 *   lang     — active language for STR_WEATHER labels
 *   initial  — pre-fill when editing existing; null → blank defaults
 *   onSave   — called with draft after validation passes
 *   onClose  — called on ESC / backdrop click / Cancel (changes discarded)
 *
 * a11y:
 *   - aria-modal="true" + aria-labelledby="weather-editor-title"
 *   - city/temp inputs: aria-required + aria-describedby when error present
 *   - condition picker: role="radiogroup" + per-chip role="radio" + aria-checked
 *
 * Design:  packages/xai-web-dashboard-widgets/docs/design.md §G
 * API:     packages/xai-web-dashboard-widgets/docs/api.md §G.3.4
 */

import type { MouseEvent, ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type {
  UserWeather,
  NewWeatherDraft,
  WeatherCityCandidate,
  WeatherCitySearchFn,
  WeatherCondition,
} from "./internal/weatherStore/types.js";
import { CONDITION_ICON } from "./internal/weatherStore/types.js";
import { searchOpenMeteoCities } from "./internal/weatherStore/openMeteo.js";
import { strWeather } from "./internal/strings.js";
import { Icon } from "./internal/Icon.js";

export interface WeatherEditorProps {
  /** Controls visibility: true → showModal(), false → close(). */
  open: boolean;
  /** Active language for STR_WEATHER labels. */
  lang: Lang;
  /** Pre-fill when editing an existing entry; null → blank defaults. */
  initial: UserWeather | null;
  /** Called after validation passes with the draft. */
  onSave: (draft: NewWeatherDraft) => void;
  /** Called on ESC / backdrop click / Cancel (changes discarded). */
  onClose: () => void;
  /** Test seam / alternate provider seam. Defaults to Open-Meteo geocoding. */
  searchCities?: WeatherCitySearchFn;
}

const CONDITION_OPTIONS: readonly WeatherCondition[] = ["sunny", "cloudy", "rainy"] as const;

const CONDITION_STR_KEY: Readonly<Record<WeatherCondition, "cond_sunny" | "cond_cloudy" | "cond_rainy">> = {
  sunny: "cond_sunny",
  cloudy: "cond_cloudy",
  rainy:  "cond_rainy",
} as const;

type SearchStatus = "idle" | "loading" | "success" | "empty" | "error";

function weatherToCandidate(initial: UserWeather | null): WeatherCityCandidate | null {
  if (initial?.latitude === undefined || initial.longitude === undefined) return null;
  return {
    id: 0,
    name: initial.city,
    latitude: initial.latitude,
    longitude: initial.longitude,
    timezone: initial.timezone || "auto",
    country: initial.country,
    countryCode: initial.countryCode,
    admin1: initial.admin1,
  };
}

function candidateSubtitle(candidate: WeatherCityCandidate): string {
  return [candidate.admin1, candidate.country, candidate.timezone].filter(Boolean).join(" · ");
}

export function WeatherEditor(props: WeatherEditorProps): ReactElement | null {
  const { open, lang, initial, onSave, onClose, searchCities = searchOpenMeteoCities } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // Form state — reset whenever open changes (like StickyComposer pattern)
  const [city, setCity]                         = useState(initial?.city ?? "");
  const [tempStr, setTempStr]                   = useState(initial?.temp !== undefined ? String(initial.temp) : "");
  const [condition, setCondition]               = useState<WeatherCondition>(initial?.condition ?? "sunny");
  const [hiStr, setHiStr]                       = useState(initial?.hi !== undefined ? String(initial.hi) : "");
  const [loStr, setLoStr]                       = useState(initial?.lo !== undefined ? String(initial.lo) : "");
  const [cityErr, setCityErr]                   = useState(false);
  const [tempErr, setTempErr]                   = useState(false);
  const [searchStatus, setSearchStatus]         = useState<SearchStatus>("idle");
  const [candidates, setCandidates]             = useState<WeatherCityCandidate[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<WeatherCityCandidate | null>(
    weatherToCandidate(initial),
  );

  useEffect(() => {
    setCity(initial?.city ?? "");
    setTempStr(initial?.temp !== undefined ? String(initial.temp) : "");
    setCondition(initial?.condition ?? "sunny");
    setHiStr(initial?.hi !== undefined ? String(initial.hi) : "");
    setLoStr(initial?.lo !== undefined ? String(initial.lo) : "");
    setCityErr(false);
    setTempErr(false);
    setSearchStatus("idle");
    setCandidates([]);
    setSelectedLocation(weatherToCandidate(initial));
  }, [open, initial]);

  // Open/close imperatively (HTML semantics)
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open && typeof el.showModal === "function") {
        try {
          el.showModal();
        } catch {
          // Already-open or interrupted dialog state; React state remains source of truth.
        }
      } else if (!el.open) {
        el.setAttribute("open", "");
      }
      // autofocus city input (jsdom-friendly via setTimeout 0)
      setTimeout(() => {
        cityInputRef.current?.focus();
      }, 0);
    } else {
      if (el.open && typeof el.close === "function") el.close();
      else if (el.open) el.removeAttribute("open");
    }
  }, [open]);

  // ESC fires native `cancel` event on <dialog>
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onClose();
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [onClose]);

  // Backdrop click: direct click on the <dialog> element (not its children)
  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  const handleSearch = useCallback(async () => {
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setCityErr(true);
      return;
    }

    setCityErr(false);
    setTempErr(false);
    setSearchStatus("loading");
    setCandidates([]);
    try {
      const results = await searchCities(trimmedCity, lang);
      setCandidates(results);
      setSearchStatus(results.length > 0 ? "success" : "empty");
    } catch {
      setSearchStatus("error");
    }
  }, [city, lang, searchCities]);

  const handleSelectCandidate = useCallback((candidate: WeatherCityCandidate) => {
    setSelectedLocation(candidate);
    setCity(candidate.name);
    setCityErr(false);
  }, []);

  const handleSave = useCallback(() => {
    const trimmedCity = city.trim();
    const parsedTemp = parseFloat(tempStr);
    const hasSelectedLocation = selectedLocation !== null;
    let valid = true;

    if (!trimmedCity) {
      setCityErr(true);
      valid = false;
    }
    if ((!hasSelectedLocation && tempStr.trim() === "") || (tempStr.trim() !== "" && isNaN(parsedTemp))) {
      setTempErr(true);
      valid = false;
    }
    if (!valid) return;

    const draft: NewWeatherDraft = {
      city: trimmedCity,
      provider: hasSelectedLocation ? "open-meteo" : "manual",
    };
    if (hasSelectedLocation) {
      draft.latitude = selectedLocation.latitude;
      draft.longitude = selectedLocation.longitude;
      draft.timezone = selectedLocation.timezone;
      if (selectedLocation.country !== undefined) draft.country = selectedLocation.country;
      if (selectedLocation.countryCode !== undefined) draft.countryCode = selectedLocation.countryCode;
      if (selectedLocation.admin1 !== undefined) draft.admin1 = selectedLocation.admin1;
    }
    if (tempStr.trim() !== "") {
      draft.temp = parsedTemp;
      draft.condition = condition;
    } else if (!hasSelectedLocation) {
      draft.temp = parsedTemp;
      draft.condition = condition;
    }
    const parsedHi = parseFloat(hiStr);
    const parsedLo = parseFloat(loStr);
    if (hiStr.trim() !== "" && !isNaN(parsedHi)) draft.hi = parsedHi;
    if (loStr.trim() !== "" && !isNaN(parsedLo)) draft.lo = parsedLo;

    onSave(draft);
  }, [city, tempStr, selectedLocation, condition, hiStr, loStr, onSave]);

  return (
    <dialog
      ref={dialogRef}
      className="weather-editor"
      data-no-drag
      aria-modal="true"
      aria-labelledby="weather-editor-title"
      onClick={handleBackdropClick}
    >
      <div className="weather-editor-panel">
        <h2 id="weather-editor-title" className="weather-editor-title">
          {strWeather("editor_title", lang)}
        </h2>

        <div className="weather-editor-grid">
          <section className="weather-editor-section">
            <div className="weather-editor-section-head">
              <span>{strWeather("auto_section", lang)}</span>
              <span className="weather-editor-provider">{strWeather("provider_open_meteo", lang)}</span>
            </div>
            <p className="weather-editor-help">{strWeather("auto_hint", lang)}</p>

            {/* City field + Open-Meteo geocoding */}
            <div className="weather-editor-field">
              <label htmlFor="weather-editor-city" className="weather-editor-label">
                {strWeather("field_city", lang)}
              </label>
              <div className="weather-editor-search-row">
                <input
                  ref={cityInputRef}
                  id="weather-editor-city"
                  type="text"
                  className="weather-editor-input"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setSelectedLocation(null);
                    setCandidates([]);
                    setSearchStatus("idle");
                    if (e.target.value.trim()) setCityErr(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleSearch();
                    }
                  }}
                  aria-required="true"
                  aria-describedby={cityErr ? "weather-editor-city-err" : undefined}
                />
                <button
                  type="button"
                  className="weather-editor-search-btn"
                  onClick={() => void handleSearch()}
                  disabled={searchStatus === "loading"}
                >
                  {searchStatus === "loading" ? strWeather("searching", lang) : strWeather("search_btn", lang)}
                </button>
              </div>
              {cityErr && (
                <span id="weather-editor-city-err" className="weather-editor-error" role="alert">
                  {strWeather("err_city", lang)}
                </span>
              )}
            </div>

            {selectedLocation && (
              <div className="weather-editor-selected">
                <span>{strWeather("selected_location", lang)}</span>
                <strong>{selectedLocation.name}</strong>
                <small>{candidateSubtitle(selectedLocation)}</small>
              </div>
            )}

            {searchStatus === "error" && (
              <span className="weather-editor-error" role="alert">
                {strWeather("search_error", lang)}
              </span>
            )}
            {searchStatus === "empty" && (
              <span className="weather-editor-muted">{strWeather("search_empty", lang)}</span>
            )}
            {candidates.length > 0 && (
              <div className="weather-editor-results" role="listbox" aria-label={strWeather("search_results", lang)}>
                {candidates.map((candidate) => (
                  <button
                    key={`${candidate.id}-${candidate.latitude}-${candidate.longitude}`}
                    type="button"
                    role="option"
                    aria-selected={selectedLocation?.id === candidate.id}
                    className="weather-editor-result"
                    onClick={() => handleSelectCandidate(candidate)}
                  >
                    <span>
                      <strong>{candidate.name}</strong>
                      <small>{candidateSubtitle(candidate)}</small>
                    </span>
                    <Icon name="pin" size={15} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="weather-editor-section">
            <div className="weather-editor-section-head">
              <span>{strWeather("manual_section", lang)}</span>
            </div>
            <p className="weather-editor-help">{strWeather("manual_hint", lang)}</p>

            {/* Temperature field */}
            <div className="weather-editor-field">
              <label htmlFor="weather-editor-temp" className="weather-editor-label">
                {strWeather("field_temp", lang)}
              </label>
              <input
                id="weather-editor-temp"
                type="number"
                className="weather-editor-input"
                value={tempStr}
                onChange={(e) => {
                  setTempStr(e.target.value);
                  if (e.target.value.trim() !== "" && !isNaN(parseFloat(e.target.value))) setTempErr(false);
                }}
                aria-required={selectedLocation ? "false" : "true"}
                aria-describedby={tempErr ? "weather-editor-temp-err" : undefined}
              />
              {tempErr && (
                <span id="weather-editor-temp-err" className="weather-editor-error" role="alert">
                  {strWeather("err_temp", lang)}
                </span>
              )}
            </div>

            {/* Condition radiogroup */}
            <div className="weather-editor-field">
              <span className="weather-editor-label">{strWeather("field_condition", lang)}</span>
              <div
                role="radiogroup"
                aria-label={strWeather("field_condition", lang)}
                className="weather-editor-conditions"
              >
                {CONDITION_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={condition === c}
                    aria-label={strWeather(CONDITION_STR_KEY[c], lang)}
                    className={`weather-editor-cond-chip${condition === c ? " selected" : ""}`}
                    onClick={() => setCondition(c)}
                  >
                    <Icon name={CONDITION_ICON[c]} size={16} />
                    <span>{strWeather(CONDITION_STR_KEY[c], lang)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional hi/lo fields */}
            <div className="weather-editor-hilo-row">
              <div className="weather-editor-field weather-editor-field--half">
                <label htmlFor="weather-editor-hi" className="weather-editor-label">
                  {strWeather("field_hi", lang)}
                </label>
                <input
                  id="weather-editor-hi"
                  type="number"
                  className="weather-editor-input"
                  value={hiStr}
                  onChange={(e) => setHiStr(e.target.value)}
                />
              </div>
              <div className="weather-editor-field weather-editor-field--half">
                <label htmlFor="weather-editor-lo" className="weather-editor-label">
                  {strWeather("field_lo", lang)}
                </label>
                <input
                  id="weather-editor-lo"
                  type="number"
                  className="weather-editor-input"
                  value={loStr}
                  onChange={(e) => setLoStr(e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="weather-editor-actions">
          <button
            type="button"
            className="weather-editor-btn weather-editor-btn--cancel"
            onClick={onClose}
          >
            {strWeather("btn_cancel", lang)}
          </button>
          <button
            type="button"
            className="weather-editor-btn weather-editor-btn--save"
            onClick={handleSave}
          >
            {strWeather("btn_save", lang)}
          </button>
        </div>
      </div>
    </dialog>
  );
}
