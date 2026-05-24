/**
 * dateTimePane — Settings → Date & Time pane.
 *
 * 5 controls: start-week select + 4 boolean toggles.
 * Port of web design/module-settings.jsx lines 447-489.
 * API contract: packages/xai-web-settings-rest/docs/api.md §4.5
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { Toggle, SettingRow, SectionBlock } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import type { WebPrefKey } from "@repo/plugin-web-storage";
import { localI18n } from "../internal/localI18n.js";

function DateTimePaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);

  const [startWeek, setStartWeek] = usePref(
    "xai_pref_dt_start_week" as WebPrefKey,
  ) as readonly [string, (v: string) => void, unknown];

  const [showLunar, setLunar] = usePref(
    "xai_pref_dt_lunar" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [showWk, setShowWk] = usePref(
    "xai_pref_dt_week_numbers" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [showHoliday, setShowHoliday] = usePref(
    "xai_pref_dt_holidays" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [tz, setTz] = usePref(
    "xai_pref_dt_timezone" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  return (
    <div className="dt-pane">
      <h3 className="pane-title">{s("settings.date_time")}</h3>

      <SectionBlock>
        <SettingRow label={t("dt.startWeek")}>
          <select
            className="sl-select"
            value={startWeek}
            onChange={(e) => setStartWeek(e.target.value)}
            aria-label={t("dt.startWeek")}
          >
            <option value="monday">{t("dt.monday")}</option>
            <option value="sunday">{t("dt.sunday")}</option>
            <option value="saturday">{t("dt.saturday")}</option>
          </select>
        </SettingRow>
      </SectionBlock>

      <SectionBlock style={{ marginTop: 14 }}>
        <SettingRow label={t("dt.lunar")}>
          <Toggle
            on={showLunar}
            onChange={() => setLunar(!showLunar)}
            ariaLabel={t("dt.lunar")}
          />
        </SettingRow>
        <SettingRow label={t("dt.weekNumbers")}>
          <Toggle
            on={showWk}
            onChange={() => setShowWk(!showWk)}
            ariaLabel={t("dt.weekNumbers")}
          />
        </SettingRow>
        <SettingRow label={t("dt.holidays")}>
          <Toggle
            on={showHoliday}
            onChange={() => setShowHoliday(!showHoliday)}
            ariaLabel={t("dt.holidays")}
          />
        </SettingRow>
      </SectionBlock>

      <SectionBlock style={{ marginTop: 14 }}>
        <SettingRow label={t("dt.timezone")} desc={t("dt.timezoneDesc")}>
          <Toggle
            on={tz}
            onChange={() => setTz(!tz)}
            ariaLabel={t("dt.timezone")}
          />
        </SettingRow>
      </SectionBlock>
    </div>
  );
}

export const dateTimePane: Pane = {
  id: "date_time",
  icon: "timer",
  i18nKey: "settings.date_time",
  render: (props: PaneRenderProps): React.ReactElement => (
    <DateTimePaneContent {...props} />
  ),
};
