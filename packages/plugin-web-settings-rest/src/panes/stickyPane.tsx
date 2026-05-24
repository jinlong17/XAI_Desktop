/**
 * stickyPane — Settings → Sticky Note pane.
 *
 * 13-color palette + font-size + pin-default + restore-size + 4 grid-spacing cards.
 * Persists 5 keys via xai_pref_sticky_*.
 *
 * OKLCH color vars declared in src/styles.css (no hex in TSX).
 *
 * Port of web design/module-settings.jsx lines 900-977.
 * API contract: packages/xai-web-settings-rest/docs/api.md §4.9
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { Toggle, SettingRow, SectionBlock } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import type { WebPrefKey } from "@repo/plugin-web-storage";
import { localI18n } from "../internal/localI18n.js";
import { StickyColorPalette } from "../internal/StickyColorPalette.js";
import type { StickyColorId, StickyFontSize, StickyGridSpacing } from "../types.js";

interface SpacingOption {
  readonly id: StickyGridSpacing;
  readonly gap: string;
}

const SPACING_OPTIONS: readonly SpacingOption[] = [
  { id: "none",   gap: "0" },
  { id: "normal", gap: "6px" },
  { id: "large",  gap: "14px" },
  { id: "xl",     gap: "24px" },
] as const;

function StickyPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);

  const [color, setColor] = usePref(
    "xai_pref_sticky_color" as WebPrefKey,
  ) as readonly [StickyColorId, (v: StickyColorId) => void, unknown];

  const [font, setFont] = usePref(
    "xai_pref_sticky_font" as WebPrefKey,
  ) as readonly [StickyFontSize, (v: StickyFontSize) => void, unknown];

  const [pin, setPin] = usePref(
    "xai_pref_sticky_pin_default" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [restore, setRestore] = usePref(
    "xai_pref_sticky_restore_size" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [spacing, setSpacing] = usePref(
    "xai_pref_sticky_grid_spacing" as WebPrefKey,
  ) as readonly [StickyGridSpacing, (v: StickyGridSpacing) => void, unknown];

  return (
    <div className="sticky-pane">
      <h3 className="pane-title">{s("settings.sticky")}</h3>
      <p className="pane-sub">{t("sticky.desc_en")}</p>

      <h4 className="sl-group">{t("sticky.defaultColor")}</h4>
      <StickyColorPalette
        selected={color}
        onSelect={(id: StickyColorId) => setColor(id)}
      />

      <SettingRow label={t("sticky.fontSize")}>
        <select
          className="sl-select"
          value={font}
          onChange={(e) => setFont(e.target.value as StickyFontSize)}
          aria-label={t("sticky.fontSize")}
        >
          <option value="small">{t("sticky.fontSmall")}</option>
          <option value="normal">{t("sticky.fontNormal")}</option>
          <option value="large">{t("sticky.fontLarge")}</option>
          <option value="xl">{t("sticky.fontXl")}</option>
        </select>
      </SettingRow>

      <SectionBlock style={{ marginTop: 14 }}>
        <SettingRow label={t("sticky.pinDefault")}>
          <Toggle
            on={pin}
            onChange={() => setPin(!pin)}
            ariaLabel={t("sticky.pinDefault")}
          />
        </SettingRow>
        <SettingRow label={t("sticky.restoreSize")} desc={t("sticky.restoreSizeDesc")}>
          <Toggle
            on={restore}
            onChange={() => setRestore(!restore)}
            ariaLabel={t("sticky.restoreSize")}
          />
        </SettingRow>
      </SectionBlock>

      <h4 className="sl-group">{t("sticky.gridSpacing")}</h4>
      <div className="sn-spacing" role="group" aria-label={t("sticky.gridSpacing")}>
        {SPACING_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={"sn-sp" + (spacing === opt.id ? " active" : "")}
            onClick={() => setSpacing(opt.id)}
            aria-pressed={spacing === opt.id}
            data-spacing-id={opt.id}
          >
            <div className="sn-sp-row" style={{ gap: opt.gap }}>
              <span className="sn-sp-tile" />
              <span className="sn-sp-tile" />
            </div>
            <div className="sn-sp-label">
              {t(`sticky.space${opt.id.charAt(0).toUpperCase()}${opt.id.slice(1)}` as Parameters<typeof t>[0])}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export const stickyPane: Pane = {
  id: "sticky",
  icon: "pin",
  i18nKey: "settings.sticky",
  render: (props: PaneRenderProps): React.ReactElement => (
    <StickyPaneContent {...props} />
  ),
};
