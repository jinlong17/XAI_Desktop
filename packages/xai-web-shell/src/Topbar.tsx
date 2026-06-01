/**
 * Topbar — search input + EN/中文 + Light/Dark/System + Comfortable/Compact + Settings icon.
 *
 * Port of web design/shell.jsx lines 168-200.
 * i18n via useI18n(lang) from @repo/plugin-web-tokens.
 */

import { useI18n } from "@repo/plugin-web-tokens";
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
        <div className="seg" role="tablist">
          <button
            type="button"
            aria-selected={lang === "en"}
            onClick={() => persistAndSet(setLang, "xai_pref_lang", "en")}
          >
            EN
          </button>
          <button
            type="button"
            aria-selected={lang === "zh"}
            onClick={() => persistAndSet(setLang, "xai_pref_lang", "zh")}
          >
            中文
          </button>
        </div>

        <div className="seg" role="tablist">
          <button
            type="button"
            aria-selected={theme === "light"}
            onClick={() => persistAndSet(setTheme, "xai_pref_theme", "light")}
            title="Light"
          >
            <Icon name="sun" size={14} />
          </button>
          <button
            type="button"
            aria-selected={theme === "dark"}
            onClick={() => persistAndSet(setTheme, "xai_pref_theme", "dark")}
            title="Dark"
          >
            <Icon name="moon" size={14} />
          </button>
          <button
            type="button"
            aria-selected={theme === "system"}
            onClick={() => persistAndSet(setTheme, "xai_pref_theme", "system")}
            title="System"
          >
            <Icon name="monitor" size={14} />
          </button>
        </div>

        <div className="seg" role="tablist">
          <button
            type="button"
            aria-selected={density === "comfortable"}
            onClick={() => persistAndSet(setDensity, "xai_pref_density", "comfortable")}
          >
            {s("settings.comfortable")}
          </button>
          <button
            type="button"
            aria-selected={density === "compact"}
            onClick={() => persistAndSet(setDensity, "xai_pref_density", "compact")}
          >
            {s("settings.compact")}
          </button>
        </div>

        <button
          type="button"
          className="icon-btn"
          onClick={onOpenSettings}
          title={s("nav.settings")}
        >
          <Icon name="sliders" size={18} />
        </button>
      </div>
    </header>
  );
}
