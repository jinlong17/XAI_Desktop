/**
 * Topbar — search input + EN/中文 + Light/Dark/System + Comfortable/Compact + Settings icon.
 *
 * Port of web design/shell.jsx lines 168-200.
 * i18n via useI18n(lang) from @repo/plugin-web-tokens.
 */

import { useI18n } from "@repo/plugin-web-tokens";
import { Icon } from "./icons.js";
import type { TopbarProps } from "./types.js";

export function Topbar({
  lang,
  setLang,
  theme,
  setTheme,
  density,
  setDensity,
  onOpenSettings,
}: TopbarProps) {
  const { s } = useI18n(lang);

  return (
    <header className="topbar">
      <div className="search-box">
        <Icon name="search" size={15} />
        <input placeholder={s("common.search_placeholder")} readOnly />
        <span className="kbd">⌘K</span>
      </div>

      <div className="topbar-controls">
        <div className="seg" role="tablist">
          <button
            type="button"
            aria-selected={lang === "en"}
            onClick={() => setLang("en")}
          >
            EN
          </button>
          <button
            type="button"
            aria-selected={lang === "zh"}
            onClick={() => setLang("zh")}
          >
            中文
          </button>
        </div>

        <div className="seg" role="tablist">
          <button
            type="button"
            aria-selected={theme === "light"}
            onClick={() => setTheme("light")}
            title="Light"
          >
            <Icon name="sun" size={14} />
          </button>
          <button
            type="button"
            aria-selected={theme === "dark"}
            onClick={() => setTheme("dark")}
            title="Dark"
          >
            <Icon name="moon" size={14} />
          </button>
          <button
            type="button"
            aria-selected={theme === "system"}
            onClick={() => setTheme("system")}
            title="System"
          >
            <Icon name="monitor" size={14} />
          </button>
        </div>

        <div className="seg" role="tablist">
          <button
            type="button"
            aria-selected={density === "comfortable"}
            onClick={() => setDensity("comfortable")}
          >
            {s("settings.comfortable")}
          </button>
          <button
            type="button"
            aria-selected={density === "compact"}
            onClick={() => setDensity("compact")}
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
