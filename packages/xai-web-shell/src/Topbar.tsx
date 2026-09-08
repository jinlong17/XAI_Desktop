/**
 * Topbar — search input + compact appearance popover.
 *
 * Port of web design/shell.jsx lines 168-200.
 * i18n via useI18n(lang) from @repo/plugin-web-tokens.
 */

import { useEffect, useRef, useState } from "react";

import { useI18n } from "@repo/plugin-web-tokens";
import type { Density, Lang, Theme } from "@repo/plugin-web-tokens";
import { Icon } from "./icons.js";
import type { TopbarProps } from "./types.js";

/**
 * persistAndSet — calls setter first (immediate UI update), then writes the
 * value to localStorage so App.tsx lazy initializers can restore it on reload.
 *
 * Keys used: "xai_pref_lang" | "xai_pref_theme" | "xai_pref_density"
 * These are NOT registered in plugin-web-storage's registry (by design —
 * kept minimal to avoid adding a formal pref codec for three plain string enums).
 * Raw localStorage.setItem/JSON.stringify is intentional (see dev_log fix-strategy).
 *
 * localStorage quota / disabled: silently skipped; in-memory state still works.
 */
function persistAndSet<T extends string>(
  setter: (v: T) => void,
  key: string,
  value: T,
): void {
  setter(value);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // localStorage quota exceeded or access disabled — in-memory update still applied above.
  }
}

const LANG_OPTIONS: ReadonlyArray<{ value: Lang; label: string; short: string }> = [
  { value: "en", label: "English", short: "EN" },
  { value: "zh", label: "中文", short: "中文" },
];

const THEME_OPTIONS: ReadonlyArray<{ value: Theme; icon: "sun" | "moon" | "monitor" }> = [
  { value: "light", icon: "sun" },
  { value: "dark", icon: "moon" },
  { value: "system", icon: "monitor" },
];

const DENSITY_OPTIONS: readonly Density[] = ["comfortable", "compact"];

export function Topbar({
  lang,
  setLang,
  theme,
  setTheme,
  density,
  setDensity,
  onOpenSettings,
  onOpenSearch,
  premiumBadge,
}: TopbarProps) {
  const { s } = useI18n(lang);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const prefsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!prefsOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      const root = prefsRef.current;
      if (root && event.target instanceof Node && !root.contains(event.target)) {
        setPrefsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPrefsOpen(false);
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [prefsOpen]);

  const activeLang = LANG_OPTIONS.find((option) => option.value === lang) ?? LANG_OPTIONS[0]!;
  const themeLabel: Record<Theme, string> = {
    light: s("settings.light"),
    dark: s("settings.dark"),
    system: s("settings.system"),
  };
  const densityLabel: Record<Density, string> = {
    comfortable: s("settings.comfortable"),
    compact: s("settings.compact"),
  };
  const prefSummary = `${activeLang.short} · ${themeLabel[theme]} · ${densityLabel[density]}`;

  const chooseLang = (next: Lang) => persistAndSet(setLang, "xai_pref_lang", next);
  const chooseTheme = (next: Theme) => persistAndSet(setTheme, "xai_pref_theme", next);
  const chooseDensity = (next: Density) => persistAndSet(setDensity, "xai_pref_density", next);

  return (
    <header className="topbar">
      {/*
       * xai-web-cmdk P4: if onOpenSearch is provided, render a clickable button
       * (keyboard-accessible, aria-label set). Otherwise render the original
       * readOnly input as a decorative visual (backwards-compatible — TP5a).
       */}
      {onOpenSearch ? (
        <button
          type="button"
          className="search-box"
          onClick={onOpenSearch}
          aria-label={s("common.search_placeholder")}
        >
          <Icon name="search" size={15} />
          <span>{s("common.search_placeholder")}</span>
          <span className="kbd">⌘K</span>
        </button>
      ) : (
        <div className="search-box">
          <Icon name="search" size={15} />
          <input placeholder={s("common.search_placeholder")} readOnly />
          <span className="kbd">⌘K</span>
        </div>
      )}

      <div className="topbar-controls">
        {/* Extension 2026-05-26 — Premium tier badge at left end of controls (F1 render-prop slot) */}
        {premiumBadge ? premiumBadge : null}
        <div className="topbar-pref" ref={prefsRef}>
          <button
            type="button"
            className="topbar-pref-trigger"
            aria-haspopup="dialog"
            aria-expanded={prefsOpen}
            aria-controls="topbar-pref-panel"
            onClick={() => setPrefsOpen((open) => !open)}
            title={s("settings.appearance")}
          >
            <Icon name="sliders" size={16} />
            <span className="topbar-pref-summary">{prefSummary}</span>
          </button>
          {prefsOpen && (
            <div
              id="topbar-pref-panel"
              className="topbar-pref-panel"
              role="dialog"
              aria-label={s("settings.appearance")}
            >
              <div className="topbar-pref-head">
                <span>{s("settings.appearance")}</span>
                <span>{prefSummary}</span>
              </div>

              <section className="topbar-pref-section" aria-label={s("settings.language")}>
                <div className="topbar-pref-label">{s("settings.language")}</div>
                <div className="topbar-pref-options">
                  {LANG_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className="topbar-pref-option"
                      role="menuitemradio"
                      aria-label={option.label}
                      aria-checked={lang === option.value}
                      onClick={() => chooseLang(option.value)}
                    >
                      <span className="topbar-pref-mark topbar-pref-mark--text">{option.short}</span>
                      <span>{option.label}</span>
                      {lang === option.value && <Icon name="check" size={15} />}
                    </button>
                  ))}
                </div>
              </section>

              <section className="topbar-pref-section" aria-label={s("settings.theme")}>
                <div className="topbar-pref-label">{s("settings.theme")}</div>
                <div className="topbar-pref-options">
                  {THEME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className="topbar-pref-option"
                      role="menuitemradio"
                      aria-label={themeLabel[option.value]}
                      aria-checked={theme === option.value}
                      onClick={() => chooseTheme(option.value)}
                      title={themeLabel[option.value]}
                    >
                      <span className="topbar-pref-mark">
                        <Icon name={option.icon} size={15} />
                      </span>
                      <span>{themeLabel[option.value]}</span>
                      {theme === option.value && <Icon name="check" size={15} />}
                    </button>
                  ))}
                </div>
              </section>

              <section className="topbar-pref-section" aria-label={s("settings.density")}>
                <div className="topbar-pref-label">{s("settings.density")}</div>
                <div className="topbar-pref-options">
                  {DENSITY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="topbar-pref-option"
                      role="menuitemradio"
                      aria-label={densityLabel[option]}
                      aria-checked={density === option}
                      onClick={() => chooseDensity(option)}
                    >
                      <span className="topbar-pref-mark topbar-pref-mark--density">
                        {option === "comfortable" ? "Aa" : "A"}
                      </span>
                      <span>{densityLabel[option]}</span>
                      {density === option && <Icon name="check" size={15} />}
                    </button>
                  ))}
                </div>
              </section>

              <button
                type="button"
                className="topbar-pref-settings"
                onClick={() => {
                  setPrefsOpen(false);
                  onOpenSettings();
                }}
              >
                <Icon name="sliders" size={15} />
                <span>{s("nav.settings")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
