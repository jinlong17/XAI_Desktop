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
import type { UserWeather, NewWeatherDraft, WeatherCondition } from "./internal/weatherStore/types.js";
import { CONDITION_ICON } from "./internal/weatherStore/types.js";
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
}

const CONDITION_OPTIONS: readonly WeatherCondition[] = ["sunny", "cloudy", "rainy"] as const;

const CONDITION_STR_KEY: Readonly<Record<WeatherCondition, "cond_sunny" | "cond_cloudy" | "cond_rainy">> = {
  sunny: "cond_sunny",
  cloudy: "cond_cloudy",
  rainy:  "cond_rainy",
} as const;

export function WeatherEditor(props: WeatherEditorProps): ReactElement | null {
  const { open, lang, initial, onSave, onClose } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // Form state — reset whenever open changes (like StickyComposer pattern)
  const [city, setCity]           = useState(initial?.city ?? "");
  const [tempStr, setTempStr]     = useState(initial?.temp !== undefined ? String(initial.temp) : "");
  const [condition, setCondition] = useState<WeatherCondition>(initial?.condition ?? "sunny");
  const [hiStr, setHiStr]         = useState(initial?.hi !== undefined ? String(initial.hi) : "");
  const [loStr, setLoStr]         = useState(initial?.lo !== undefined ? String(initial.lo) : "");
  const [cityErr, setCityErr]     = useState(false);
  const [tempErr, setTempErr]     = useState(false);

  useEffect(() => {
    setCity(initial?.city ?? "");
    setTempStr(initial?.temp !== undefined ? String(initial.temp) : "");
    setCondition(initial?.condition ?? "sunny");
    setHiStr(initial?.hi !== undefined ? String(initial.hi) : "");
    setLoStr(initial?.lo !== undefined ? String(initial.lo) : "");
    setCityErr(false);
    setTempErr(false);
  }, [open, initial]);

  // Open/close imperatively (HTML semantics)
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
      // autofocus city input (jsdom-friendly via setTimeout 0)
      setTimeout(() => {
        cityInputRef.current?.focus();
      }, 0);
    } else {
      if (el.open) el.close();
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

  const handleSave = useCallback(() => {
    const trimmedCity = city.trim();
    const parsedTemp = parseFloat(tempStr);
    let valid = true;

    if (!trimmedCity) {
      setCityErr(true);
      valid = false;
    }
    if (tempStr.trim() === "" || isNaN(parsedTemp)) {
      setTempErr(true);
      valid = false;
    }
    if (!valid) return;

    const draft: NewWeatherDraft = {
      city: trimmedCity,
      temp: parsedTemp,
      condition,
    };
    const parsedHi = parseFloat(hiStr);
    const parsedLo = parseFloat(loStr);
    if (hiStr.trim() !== "" && !isNaN(parsedHi)) draft.hi = parsedHi;
    if (loStr.trim() !== "" && !isNaN(parsedLo)) draft.lo = parsedLo;

    onSave(draft);
  }, [city, tempStr, condition, hiStr, loStr, onSave]);

  return (
    <dialog
      ref={dialogRef}
      className="weather-editor"
      aria-modal="true"
      aria-labelledby="weather-editor-title"
      onClick={handleBackdropClick}
    >
      <div className="weather-editor-panel">
        <h2 id="weather-editor-title" className="weather-editor-title">
          {strWeather("editor_title", lang)}
        </h2>

        {/* City field */}
        <div className="weather-editor-field">
          <label htmlFor="weather-editor-city" className="weather-editor-label">
            {strWeather("field_city", lang)}
          </label>
          <input
            ref={cityInputRef}
            id="weather-editor-city"
            type="text"
            className="weather-editor-input"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              if (e.target.value.trim()) setCityErr(false);
            }}
            aria-required="true"
            aria-describedby={cityErr ? "weather-editor-city-err" : undefined}
          />
          {cityErr && (
            <span id="weather-editor-city-err" className="weather-editor-error" role="alert">
              {strWeather("err_city", lang)}
            </span>
          )}
        </div>

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
            aria-required="true"
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
