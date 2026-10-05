/**
 * AppearancePane — Settings → Appearance pane content.
 *
 * Owns 7 user-visible appearance dimensions:
 *   lang / theme / density / accentHue / bgTone / railPos / fontScale
 *
 * State model (CP-APPEARANCE-01): the pane is a view of the App-scoped
 * Appearance controller (`internal/appearanceController.tsx`), which App
 * creates once and provides; the Topbar quick switcher is another view of the
 * same controller. A standalone `<AppearancePane lang>` without a provider
 * owns its own controller.
 *
 * Every change displays and applies immediately and autosaves through the
 * accepted async engine. A pending or failed change stays visible with
 * field-local feedback, Retry and Discard; invalid or unreadable stored bytes
 * show the default with Reload only. The pane-local bottom action area holds
 * the status line, Retry all (always rendered; `aria-disabled` while nothing
 * can be retried), Export, Discard all and Reset to defaults. There is no
 * shared Save footer, no Settings route guard and no
 * `web:settings:preference-changed` emission.
 *
 * Port of web design/module-settings.jsx lines 494-653.
 * API contract: packages/xai-web-settings-appearance/docs/api.md §3
 * Recovery contract: docs/reviews/web-appearance-recovery-contract/contract.md
 */

import * as React from "react";
import {
  useI18n,
  applyBgTone,
  applyRailPos,
  type Theme,
} from "@repo/plugin-web-tokens";
import { SettingRow } from "@repo/plugin-web-settings-shell";
import { BG_TONES, HUE_PRESETS, RAIL_POSITIONS } from "./constants.js";
import { AppearanceControllerContext, useAppearanceController } from "./internal/appearanceController.js";
import { AppearanceActions } from "./internal/AppearanceActions.js";
import { appearanceRecoveryCopy } from "./internal/appearanceRecoveryCopy.js";
import type { AppearanceRecoveryCopy } from "./internal/appearanceRecoveryCopy.js";
import type { AppearanceController, AppearanceFieldId, AppearanceFieldState, AppearancePaneProps } from "./types.js";

// ---------------------------------------------------------------------------
// AppearancePane
// ---------------------------------------------------------------------------

export function AppearancePane({ lang }: AppearancePaneProps): React.ReactElement {
  const shared = React.useContext(AppearanceControllerContext);
  return shared !== null
    ? <AppearancePaneView lang={lang} controller={shared} />
    : <StandaloneAppearancePane lang={lang} />;
}

/** Without a provider the pane owns its controller (the package stays usable alone). */
function StandaloneAppearancePane({ lang }: AppearancePaneProps): React.ReactElement {
  const controller = useAppearanceController();
  return <AppearancePaneView lang={lang} controller={controller} />;
}

/** The i18n key of each field's existing label (contract §2). */
const LABEL_KEYS: Readonly<Record<AppearanceFieldId, string>> = {
  lang: "settings.language",
  theme: "settings.theme",
  density: "settings.density",
  accentHue: "settings.accent_color",
  bgTone: "settings.bg_palette",
  railPos: "settings.sidebar_position",
  fontScale: "settings.font_scale",
};

/** The field's selected control (or its slider) inside `[data-appearance-control]`. */
const FOCUS_TARGETS: Readonly<Record<AppearanceFieldId, string>> = {
  lang: '[aria-selected="true"]',
  theme: ".theme-card.active",
  density: '[aria-selected="true"]',
  accentHue: 'input[type="range"]',
  bgTone: ".bg-tone-card.active",
  railPos: ".rail-pos-card.active",
  fontScale: 'input[type="range"]',
};

interface AppearancePaneViewProps extends AppearancePaneProps {
  readonly controller: AppearanceController;
}

function AppearancePaneView({ lang, controller }: AppearancePaneViewProps): React.ReactElement {
  const { s } = useI18n(lang);
  const copy = appearanceRecoveryCopy(lang);
  const paneRef = React.useRef<HTMLDivElement>(null);
  const resetRef = React.useRef<HTMLButtonElement>(null);
  const focusRequestRef = React.useRef<AppearanceFieldId | null>(null);
  const { values, fieldStates, attachPane } = controller;

  // Success lines are only claimed for completions that happen while a pane is mounted.
  React.useLayoutEffect(() => attachPane(), [attachPane]);

  // Keyboard continuity: after Discard, Reload or an unmounting recovery block,
  // focus lands on the field's selected control once the commit is applied.
  const requestFieldFocus = React.useCallback((id: AppearanceFieldId) => {
    focusRequestRef.current = id;
  }, []);
  React.useLayoutEffect(() => {
    const id = focusRequestRef.current;
    if (id === null) return;
    focusRequestRef.current = null;
    const container = paneRef.current?.querySelector<HTMLElement>(`[data-appearance-control="${id}"]`);
    const target = container?.querySelector<HTMLElement>(FOCUS_TARGETS[id]) ?? container?.querySelector<HTMLElement>("button, input");
    target?.focus();
  });

  const discardField = (id: AppearanceFieldId): void => {
    controller.discard(id);
    requestFieldFocus(id);
  };
  const reloadField = (id: AppearanceFieldId): void => {
    controller.reload(id);
    requestFieldFocus(id);
  };
  const discardAll = (): void => {
    controller.discardAll();
    resetRef.current?.focus();
  };
  const resetToDefaults = (): void => {
    controller.resetToDefaults(() => window.confirm(copy.confirmReset));
  };

  // ---- Handlers: DOM-provided range inputs keep today's clamp and rounding ----

  const handleAccentHueChange = (rawValue: number): void => {
    const value = Math.max(0, Math.min(360, Math.round(rawValue)));
    if (!Number.isFinite(value)) return;
    controller.setAccentHue(value);
  };

  const handleBgToneChange = (toneId: (typeof BG_TONES)[number]["id"], toneHue: number): void => {
    const hueValue = Math.max(0, Math.min(360, Math.round(toneHue)));
    controller.chooseBgTone(toneId, hueValue);
  };

  const handleFontScaleChange = (rawValue: number): void => {
    const value = Math.max(0.85, Math.min(1.15, rawValue));
    if (!Number.isFinite(value)) return;
    controller.setFontScale(value);
  };

  const recovery = (id: AppearanceFieldId): React.ReactNode => {
    const state = fieldStates[id];
    if (state === "clean") return null;
    return (
      <FieldRecovery
        id={id}
        label={s(LABEL_KEYS[id])}
        state={state}
        copy={copy}
        onRetry={controller.retry}
        onDiscard={discardField}
        onReload={reloadField}
        onUnmountWithFocus={requestFieldFocus}
      />
    );
  };

  // ---- Render ----------------------------------------------------------------

  const THEME_OPTS: { id: Theme; label: string }[] = [
    { id: "light",  label: s("settings.light")  },
    { id: "dark",   label: s("settings.dark")   },
    { id: "system", label: s("settings.system") },
  ];

  return (
    <div className="appearance-pane" ref={paneRef}>
      <h3 className="pane-title">{s("settings.appearance")}</h3>

      {/* Language */}
      <SettingRow
        label={s("settings.language")}
        desc={s("settings.language_desc")}
      >
        <div className="seg" data-appearance-control="lang">
          <button
            type="button"
            aria-selected={values.lang === "en"}
            onClick={() => controller.setLang("en")}
          >
            English
          </button>
          <button
            type="button"
            aria-selected={values.lang === "zh"}
            onClick={() => controller.setLang("zh")}
          >
            简体中文
          </button>
        </div>
      </SettingRow>
      {recovery("lang")}

      {/* Theme */}
      <SettingRow
        label={s("settings.theme")}
        desc={s("settings.theme_desc")}
      >
        <div className="theme-cards" data-appearance-control="theme">
          {THEME_OPTS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={"theme-card" + (values.theme === opt.id ? " active" : "")}
              onClick={() => controller.setTheme(opt.id)}
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
      {recovery("theme")}

      {/* Density */}
      <SettingRow
        label={s("settings.density")}
        desc={s("settings.density_desc")}
      >
        <div className="seg" data-appearance-control="density">
          <button
            type="button"
            aria-selected={values.density === "comfortable"}
            onClick={() => controller.setDensity("comfortable")}
          >
            {s("settings.comfortable")}
          </button>
          <button
            type="button"
            aria-selected={values.density === "compact"}
            onClick={() => controller.setDensity("compact")}
          >
            {s("settings.compact")}
          </button>
        </div>
      </SettingRow>
      {recovery("density")}

      {/* Accent color */}
      <SettingRow
        label={s("settings.accent_color")}
        desc={s("settings.accent_color_desc")}
      >
        <div className="accent-pickers" data-appearance-control="accentHue">
          <div className="accent-swatches">
            {HUE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={"accent-sw" + (Math.abs(values.accentHue - p.hue) < 3 ? " active" : "")}
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
              style={{ background: `oklch(60% 0.10 ${values.accentHue})` }}
            />
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              className="hue-slider"
              value={values.accentHue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleAccentHueChange(parseFloat(e.target.value))
              }
              aria-label={lang === "zh" ? "主题色色相" : "Accent hue"}
            />
            <span className="slider-val mono">{Math.round(values.accentHue)}°</span>
          </div>
        </div>
      </SettingRow>
      {recovery("accentHue")}

      {/* Background palette */}
      <SettingRow
        label={s("settings.bg_palette")}
        desc={s("settings.bg_palette_desc")}
      >
        <div className="bg-tones" data-appearance-control="bgTone">
          {BG_TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={"bg-tone-card bgt-" + t.id + (values.bgTone === t.id ? " active" : "")}
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
      {recovery("bgTone")}

      {/* Sidebar position */}
      <SettingRow
        label={s("settings.sidebar_position")}
        desc={s("settings.sidebar_position_desc")}
      >
        <div className="rail-pos-grid" data-appearance-control="railPos">
          {RAIL_POSITIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={"rail-pos-card rp-" + opt.id + (values.railPos === opt.id ? " active" : "")}
              onClick={() => controller.setRailPos(opt.id)}
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
      {recovery("railPos")}

      {/* Font scale */}
      <SettingRow
        label={s("settings.font_scale")}
        desc={s("settings.font_scale_desc")}
      >
        <div className="slider-row" data-appearance-control="fontScale">
          <span className="mono" style={{ fontSize: 11 }}>A</span>
          <input
            type="range"
            min="0.85"
            max="1.15"
            step="0.05"
            value={values.fontScale}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleFontScaleChange(parseFloat(e.target.value))
            }
            aria-label={lang === "zh" ? "字体大小" : "Font scale"}
          />
          <span className="mono" style={{ fontSize: 18 }}>A</span>
          <span className="slider-val mono">{Math.round(values.fontScale * 100)}%</span>
        </div>
      </SettingRow>
      {recovery("fontScale")}

      <AppearanceActions
        controller={controller}
        copy={copy}
        resetRef={resetRef}
        onDiscardAll={discardAll}
        onReset={resetToDefaults}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// FieldRecovery
// ---------------------------------------------------------------------------

interface FieldRecoveryProps {
  readonly id: AppearanceFieldId;
  readonly label: string;
  readonly state: Exclude<AppearanceFieldState, "clean">;
  readonly copy: AppearanceRecoveryCopy;
  readonly onRetry: (id: AppearanceFieldId) => void;
  readonly onDiscard: (id: AppearanceFieldId) => void;
  readonly onReload: (id: AppearanceFieldId) => void;
  readonly onUnmountWithFocus: (id: AppearanceFieldId) => void;
}

function messageFor(state: FieldRecoveryProps["state"], label: string, copy: AppearanceRecoveryCopy): string {
  switch (state) {
    case "saving": return copy.saving(label);
    case "resetting": return copy.resetting(label);
    case "not-saved": return copy.notSaved(label);
    case "not-reset": return copy.notReset(label);
    case "unavailable": return copy.unavailable(label);
  }
}

/** Field-local feedback: Retry and Discard for actual work, Reload only for a source issue. */
function FieldRecovery({ id, label, state, copy, onRetry, onDiscard, onReload, onUnmountWithFocus }: FieldRecoveryProps): React.ReactElement {
  const rootRef = React.useRef<HTMLDivElement>(null);
  // When the block disappears (for example after a successful Retry) while it
  // holds focus, focus returns to the field's selected control instead of <body>.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    return () => {
      if (root !== null && root.contains(document.activeElement)) onUnmountWithFocus(id);
    };
  }, [id, onUnmountWithFocus]);

  const alert = state === "not-saved" || state === "not-reset" || state === "unavailable";
  return (
    <div className="appearance-recovery-field" data-appearance-recovery={id} ref={rootRef}>
      <p key={alert ? "alert" : "status"} className="appearance-recovery-text" role={alert ? "alert" : "status"}>
        {messageFor(state, label, copy)}
      </p>
      {state === "unavailable" ? (
        <button type="button" className="btn ghost" aria-label={copy.reloadName(label)} onClick={() => onReload(id)}>
          {copy.reload}
        </button>
      ) : (
        <>
          <button type="button" className="btn ghost" aria-label={copy.retryName(label)} onClick={() => onRetry(id)}>
            {copy.retry}
          </button>
          <button type="button" className="btn ghost" aria-label={copy.discardName(label)} onClick={() => onDiscard(id)}>
            {copy.discard}
          </button>
        </>
      )}
    </div>
  );
}

// Re-export apply helpers for testing convenience (not on public index.ts)
export { applyBgTone, applyRailPos };
