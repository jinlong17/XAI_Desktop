/**
 * AppearancePane — Settings → Appearance pane content.
 *
 * Owns 7 user-visible appearance dimensions:
 *   lang / theme / density / accentHue / bgTone / railPos / fontScale
 *
 * State model:
 *   - accentHue / railPos / bgTone: usePref (persisted localStorage, shared registry)
 *   - theme / density / fontScale: useState local mirror seeded from DOM on mount
 *   - lang: read from chassis prop; emits event to set, no DOM apply
 *
 * Live binding: every onChange calls applyX synchronously (for theme/density/fontScale)
 * or setPref (for persisted dims), then emits web:settings:preference-changed.
 *
 * Reset: per-pane Reset reverts 6 dims (lang excluded) via removePref + applyX + emit.
 * Chassis SettingsFooter.handleReset owns the confirm dialog (no double-prompt).
 *
 * Port of web design/module-settings.jsx lines 494-653.
 * API contract: packages/xai-web-settings-appearance/docs/api.md §3
 */

import * as React from "react";
import { useState } from "react";
import {
  useI18n,
  applyTheme,
  applyDensity,
  applyFontScale,
  applyBgTone,
  applyRailPos,
  type Theme,
  type Density,
  type BgTone,
  type RailPos,
} from "@repo/plugin-web-tokens";
import { usePref, setPref, removePref } from "@repo/plugin-web-storage";
import { SettingRow, SettingsFooter } from "@repo/plugin-web-settings-shell";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import type { WebPreferenceChange } from "@repo/core/types";
import { BG_TONES, HUE_PRESETS, RAIL_POSITIONS } from "./constants.js";
import { appearanceDefaults } from "./appearanceDefaults.js";
import type { AppearancePaneProps } from "./types.js";

// ---------------------------------------------------------------------------
// AppearancePane
// ---------------------------------------------------------------------------

export function AppearancePane({ lang }: AppearancePaneProps): React.ReactElement {
  const { s } = useI18n(lang);

  // ---- Persisted dims (usePref — auto-applies via App.tsx useEffect) --------
  const [accentHue] = usePref("xai_accent_hue") as readonly [number, (v: number) => void, unknown];
  const [railPosRaw] = usePref("xai_rail_pos") as readonly [RailPos, (v: RailPos) => void, unknown];
  const railPos = railPosRaw as RailPos;
  const [bgToneRaw] = usePref("xai_bg_tone") as readonly [BgTone, (v: BgTone) => void, unknown];
  const bgTone = bgToneRaw as BgTone;

  // ---- useState local mirrors (seeded from DOM on first render) -------------
  const [themeLocal, setThemeLocal] = useState<Theme>(() => {
    if (typeof document === "undefined") return appearanceDefaults.theme;
    return (document.documentElement.getAttribute("data-theme") as Theme | null) ?? appearanceDefaults.theme;
  });

  const [densityLocal, setDensityLocal] = useState<Density>(() => {
    if (typeof document === "undefined") return appearanceDefaults.density;
    return (document.documentElement.getAttribute("data-density") as Density | null) ?? appearanceDefaults.density;
  });

  const [fontScaleLocal, setFontScaleLocal] = useState<number>(() => {
    if (typeof document === "undefined") return appearanceDefaults.fontScale;
    const parsed = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
    return Number.isFinite(parsed) ? parsed : appearanceDefaults.fontScale;
  });

  // ---- Handlers: theme -------------------------------------------------------

  const handleThemeChange = (value: Theme): void => {
    applyTheme(value);
    setThemeLocal(value);
    const changedAt = new Date().toISOString();
    emitWebEvent("web:settings:preference-changed", { key: "theme", value, changedAt });
  };

  // ---- Handlers: density -----------------------------------------------------

  const handleDensityChange = (value: Density): void => {
    applyDensity(value);
    setDensityLocal(value);
    const changedAt = new Date().toISOString();
    emitWebEvent("web:settings:preference-changed", { key: "density", value, changedAt });
  };

  // ---- Handlers: accentHue ---------------------------------------------------

  const handleAccentHueChange = (rawValue: number): void => {
    const value = Math.max(0, Math.min(360, Math.round(rawValue)));
    if (!Number.isFinite(value)) {
      if (typeof import.meta !== "undefined" && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
        console.warn("[AppearancePane] non-finite accentHue, ignoring", rawValue);
      }
      return;
    }
    setPref("xai_accent_hue", value);
    const changedAt = new Date().toISOString();
    emitWebEvent("web:settings:preference-changed", { key: "accentHue", value, changedAt });
  };

  // ---- Handlers: bgTone ------------------------------------------------------

  const handleBgToneChange = (toneId: BgTone, toneHue: number): void => {
    setPref("xai_bg_tone", toneId);
    const hueValue = Math.max(0, Math.min(360, Math.round(toneHue)));
    setPref("xai_accent_hue", hueValue);
    const changedAt = new Date().toISOString();
    emitWebEvent("web:settings:preference-changed", { key: "bgTone", value: toneId, changedAt });
    emitWebEvent("web:settings:preference-changed", { key: "accentHue", value: hueValue, changedAt });
  };

  // ---- Handlers: railPos -----------------------------------------------------

  const handleRailPosChange = (value: RailPos): void => {
    setPref("xai_rail_pos", value);
    const changedAt = new Date().toISOString();
    emitWebEvent("web:settings:preference-changed", { key: "railPos", value, changedAt });
  };

  // ---- Handlers: fontScale ---------------------------------------------------

  const handleFontScaleChange = (rawValue: number): void => {
    const value = Math.max(0.85, Math.min(1.15, rawValue));
    if (!Number.isFinite(value)) {
      if (typeof import.meta !== "undefined" && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
        console.warn("[AppearancePane] non-finite fontScale, ignoring", rawValue);
      }
      return;
    }
    try {
      applyFontScale(value);
    } catch {
      // RangeError guard — already clamped above; defensive catch
    }
    setFontScaleLocal(value);
    const changedAt = new Date().toISOString();
    emitWebEvent("web:settings:preference-changed", { key: "fontScale", value, changedAt });
  };

  // ---- Handlers: lang --------------------------------------------------------

  const handleLangChange = (value: "en" | "zh"): void => {
    const changedAt = new Date().toISOString();
    emitWebEvent("web:settings:preference-changed", { key: "lang", value, changedAt });
  };

  // ---- Save handler ----------------------------------------------------------

  const handleSave = (): WebPreferenceChange[] => {
    return [
      { key: "lang",       value: lang },
      { key: "theme",      value: themeLocal },
      { key: "density",    value: densityLocal },
      { key: "fontScale",  value: fontScaleLocal },
      { key: "accentHue",  value: accentHue },
      { key: "railPos",    value: railPos },
      { key: "bgTone",     value: bgTone },
    ];
  };

  // ---- Reset handler (per-pane; chassis owns confirm prompt) -----------------

  const handleResetAppearance = (): void => {
    // Persisted dims: remove → registry default takes over → App.tsx useEffect re-applies
    const keys: Array<"xai_accent_hue" | "xai_rail_pos" | "xai_bg_tone"> = [
      "xai_accent_hue", "xai_rail_pos", "xai_bg_tone",
    ];
    for (const key of keys) {
      try {
        removePref(key);
      } catch {
        if (typeof import.meta !== "undefined" && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
          console.warn("[AppearancePane] removePref failed", key);
        }
      }
    }

    const changedAt = new Date().toISOString();

    // Persisted dim emits (defaults)
    emitWebEvent("web:settings:preference-changed", { key: "accentHue", value: appearanceDefaults.accentHue, changedAt });
    emitWebEvent("web:settings:preference-changed", { key: "railPos",   value: appearanceDefaults.railPos,   changedAt });
    emitWebEvent("web:settings:preference-changed", { key: "bgTone",    value: appearanceDefaults.bgTone,    changedAt });

    // useState dims: apply + update local mirror + emit
    try { applyTheme(appearanceDefaults.theme); } catch { /* SSR safe */ }
    setThemeLocal(appearanceDefaults.theme);
    emitWebEvent("web:settings:preference-changed", { key: "theme",     value: appearanceDefaults.theme,    changedAt });

    try { applyDensity(appearanceDefaults.density); } catch { /* SSR safe */ }
    setDensityLocal(appearanceDefaults.density);
    emitWebEvent("web:settings:preference-changed", { key: "density",   value: appearanceDefaults.density,  changedAt });

    try { applyFontScale(appearanceDefaults.fontScale); } catch { /* RangeError guard */ }
    setFontScaleLocal(appearanceDefaults.fontScale);
    emitWebEvent("web:settings:preference-changed", { key: "fontScale", value: appearanceDefaults.fontScale, changedAt });

    // lang is intentionally NOT reset (verbatim source behavior)
  };

  // ---- Render ----------------------------------------------------------------

  const THEME_OPTS: { id: Theme; label: string }[] = [
    { id: "light",  label: s("settings.light")  },
    { id: "dark",   label: s("settings.dark")   },
    { id: "system", label: s("settings.system") },
  ];

  return (
    <div className="appearance-pane">
      <h3 className="pane-title">{s("settings.appearance")}</h3>

      {/* Language */}
      <SettingRow
        label={s("settings.language")}
        desc={s("settings.language_desc")}
      >
        <div className="seg">
          <button
            type="button"
            aria-selected={lang === "en"}
            onClick={() => handleLangChange("en")}
          >
            English
          </button>
          <button
            type="button"
            aria-selected={lang === "zh"}
            onClick={() => handleLangChange("zh")}
          >
            简体中文
          </button>
        </div>
      </SettingRow>

      {/* Theme */}
      <SettingRow
        label={s("settings.theme")}
        desc={s("settings.theme_desc")}
      >
        <div className="theme-cards">
          {THEME_OPTS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={"theme-card" + (themeLocal === opt.id ? " active" : "")}
              onClick={() => handleThemeChange(opt.id)}
            >
              <div className={`theme-preview tp-${opt.id}`}>
                <div className="tp-bar" />
                <div className="tp-body">
                  <div className="tp-line" />
                  <div className="tp-line short" />
                  <div className="tp-line" />
                </div>
              </div>
              <span className="theme-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </SettingRow>

      {/* Density */}
      <SettingRow
        label={s("settings.density")}
        desc={s("settings.density_desc")}
      >
        <div className="seg">
          <button
            type="button"
            aria-selected={densityLocal === "comfortable"}
            onClick={() => handleDensityChange("comfortable")}
          >
            {s("settings.comfortable")}
          </button>
          <button
            type="button"
            aria-selected={densityLocal === "compact"}
            onClick={() => handleDensityChange("compact")}
          >
            {s("settings.compact")}
          </button>
        </div>
      </SettingRow>

      {/* Accent color */}
      <SettingRow
        label={s("settings.accent_color")}
        desc={s("settings.accent_color_desc")}
      >
        <div className="accent-pickers">
          <div className="accent-swatches">
            {HUE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={"accent-sw" + (Math.abs(accentHue - p.hue) < 3 ? " active" : "")}
                style={{ background: `oklch(60% 0.10 ${p.hue})` }}
                onClick={() => handleAccentHueChange(p.hue)}
                title={lang === "zh" ? p.name.zh : p.name.en}
                aria-label={lang === "zh" ? p.name.zh : p.name.en}
              />
            ))}
          </div>
          <div className="accent-slider-row">
            <span
              className="accent-hue-preview"
              style={{ background: `oklch(60% 0.10 ${accentHue})` }}
            />
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              className="hue-slider"
              value={accentHue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleAccentHueChange(parseFloat(e.target.value))
              }
              aria-label={lang === "zh" ? "主题色色相" : "Accent hue"}
            />
            <span className="slider-val mono">{Math.round(accentHue)}°</span>
          </div>
        </div>
      </SettingRow>

      {/* Background palette */}
      <SettingRow
        label={s("settings.bg_palette")}
        desc={s("settings.bg_palette_desc")}
      >
        <div className="bg-tones">
          {BG_TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={"bg-tone-card bgt-" + t.id + (bgTone === t.id ? " active" : "")}
              onClick={() => handleBgToneChange(t.id, t.hue)}
              title={lang === "zh" ? t.name.zh : t.name.en}
              aria-label={lang === "zh" ? t.name.zh : t.name.en}
            >
              <div className="bgt-preview">
                <div className="bgt-bg" />
                <div className="bgt-panel" />
                <div
                  className="bgt-dot"
                  style={{ background: `oklch(60% 0.10 ${t.hue})` }}
                />
              </div>
              <span className="bgt-name">{lang === "zh" ? t.name.zh : t.name.en}</span>
            </button>
          ))}
        </div>
      </SettingRow>

      {/* Sidebar position */}
      <SettingRow
        label={s("settings.sidebar_position")}
        desc={s("settings.sidebar_position_desc")}
      >
        <div className="rail-pos-grid">
          {RAIL_POSITIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={"rail-pos-card rp-" + opt.id + (railPos === opt.id ? " active" : "")}
              onClick={() => handleRailPosChange(opt.id)}
            >
              <div className="rp-preview">
                <div className="rp-shell">
                  <div className="rp-rail">
                    <span /><span /><span /><span />
                  </div>
                  <div className="rp-body">
                    <div className="rp-line" />
                    <div className="rp-line short" />
                    <div className="rp-line" />
                  </div>
                </div>
              </div>
              <span className="rp-label">
                {lang === "zh" ? opt.label.zh : opt.label.en}
              </span>
            </button>
          ))}
        </div>
      </SettingRow>

      {/* Font scale */}
      <SettingRow
        label={s("settings.font_scale")}
        desc={s("settings.font_scale_desc")}
      >
        <div className="slider-row">
          <span className="mono" style={{ fontSize: 11 }}>A</span>
          <input
            type="range"
            min="0.85"
            max="1.15"
            step="0.05"
            value={fontScaleLocal}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleFontScaleChange(parseFloat(e.target.value))
            }
            aria-label={lang === "zh" ? "字体大小" : "Font scale"}
          />
          <span className="mono" style={{ fontSize: 18 }}>A</span>
          <span className="slider-val mono">{Math.round(fontScaleLocal * 100)}%</span>
        </div>
      </SettingRow>

      <SettingsFooter
        lang={lang}
        onSave={handleSave}
        onReset={handleResetAppearance}
      />
    </div>
  );
}

// Re-export apply helpers for testing convenience (not on public index.ts)
export { applyBgTone, applyRailPos };
