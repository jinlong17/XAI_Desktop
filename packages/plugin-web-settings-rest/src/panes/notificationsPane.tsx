/**
 * notificationsPane — Settings → Notifications pane.
 *
 * 8 controls + DND time-range visibility gating.
 * Port of web design/module-settings.jsx lines 376-442.
 * API contract: packages/xai-web-settings-rest/docs/api.md §4.4
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { Toggle, SettingRow, SectionBlock } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import type { WebPrefKey } from "@repo/plugin-web-storage";
import {
  requestDesktopNotificationPermission,
  useDesktopNotificationRuntimeSnapshot,
} from "@repo/desktop-native-notifications-reminders/web";
import { localI18n } from "../internal/localI18n.js";

function NotificationsPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);

  const [enabled, setEnabled] = usePref(
    "xai_pref_notif_enabled" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [doneSound, setDoneSound] = usePref(
    "xai_pref_notif_done_sound" as WebPrefKey,
  ) as readonly [string, (v: string) => void, unknown];

  const [pushTask, setPushTask] = usePref(
    "xai_pref_notif_push_task" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [pushPomo, setPushPomo] = usePref(
    "xai_pref_notif_push_pomo" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [pushHabit, setPushHabit] = usePref(
    "xai_pref_notif_push_habit" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];
  const [pushCalendar, setPushCalendar] = usePref(
    "xai_pref_notif_push_calendar" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [quiet, setQuiet] = usePref(
    "xai_pref_notif_quiet" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [quietStart, setQuietStart] = usePref(
    "xai_pref_notif_quiet_start" as WebPrefKey,
  ) as readonly [string, (v: string) => void, unknown];

  const [quietEnd, setQuietEnd] = usePref(
    "xai_pref_notif_quiet_end" as WebPrefKey,
  ) as readonly [string, (v: string) => void, unknown];
  const runtimeSnapshot = useDesktopNotificationRuntimeSnapshot();

  const statusText = (() => {
    if (!enabled) {
      return t("notif.desktopStatusDisabled");
    }
    if (runtimeSnapshot.status === "ready") {
      return t("notif.desktopStatusReady");
    }
    if (runtimeSnapshot.status === "denied") {
      return t("notif.desktopStatusDenied");
    }
    if (runtimeSnapshot.status === "permission-required") {
      return t("notif.desktopStatusPrompt");
    }
    return t("notif.desktopStatusUnsupported");
  })();

  return (
    <div className="notif-pane">
      <h3 className="pane-title">{s("settings.notifications")}</h3>

      <SectionBlock>
        <SettingRow label={t("notif.enable")}>
          <Toggle
            on={enabled}
            onChange={() => setEnabled(!enabled)}
            ariaLabel={t("notif.enable")}
          />
        </SettingRow>
      </SectionBlock>

      <div className="sl-group" style={{ marginTop: 18 }}>
        {t("notif.types")}
      </div>
      <SectionBlock>
        <SettingRow label={t("notif.taskDue")}>
          <Toggle
            on={pushTask}
            onChange={() => setPushTask(!pushTask)}
            ariaLabel={t("notif.taskDue")}
          />
        </SettingRow>
        <SettingRow label={t("notif.pomoDone")}>
          <Toggle
            on={pushPomo}
            onChange={() => setPushPomo(!pushPomo)}
            ariaLabel={t("notif.pomoDone")}
          />
        </SettingRow>
        <SettingRow label={t("notif.habitRemind")}>
          <Toggle
            on={pushHabit}
            onChange={() => setPushHabit(!pushHabit)}
            ariaLabel={t("notif.habitRemind")}
          />
        </SettingRow>
        <SettingRow label={t("notif.calendarRemind")}>
          <Toggle
            on={pushCalendar}
            onChange={() => setPushCalendar(!pushCalendar)}
            ariaLabel={t("notif.calendarRemind")}
          />
        </SettingRow>
      </SectionBlock>

      <div className="sl-group" style={{ marginTop: 18 }}>
        {t("notif.soundSection")}
      </div>
      <SectionBlock>
        <SettingRow label={t("notif.sound")} desc={t("notif.soundDesc")}>
          <select
            className="sl-select"
            value={doneSound}
            onChange={(e) => setDoneSound(e.target.value)}
            aria-label={t("notif.sound")}
          >
            <option value="none">{t("notif.soundNone")}</option>
            <option value="subtle">{t("notif.soundSubtle")}</option>
            <option value="chime">{t("notif.soundChime")}</option>
            <option value="bell">{t("notif.soundBell")}</option>
            <option value="pop">{t("notif.soundPop")}</option>
          </select>
        </SettingRow>
      </SectionBlock>

      <div className="sl-group" style={{ marginTop: 18 }}>
        {t("notif.dndSection")}
      </div>
      <SectionBlock>
        <SettingRow label={t("notif.desktopStatusTitle")} desc={statusText}>
          <button
            type="button"
            className="btn"
            onClick={() => {
              void requestDesktopNotificationPermission();
            }}
            disabled={runtimeSnapshot.status === "ready"}
            aria-label={t("notif.desktopRequestPermission")}
          >
            {t("notif.desktopRequestPermission")}
          </button>
        </SettingRow>
        <SettingRow label={t("notif.quietEnable")}>
          <Toggle
            on={quiet}
            onChange={() => setQuiet(!quiet)}
            ariaLabel={t("notif.quietEnable")}
          />
        </SettingRow>
        {quiet && (
          <SettingRow label={t("notif.quietHours")}>
            <div className="time-range">
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                aria-label={lang === "zh" ? "勿扰开始时间" : "Quiet hours start"}
              />
              <span className="muted">{"→"}</span>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                aria-label={lang === "zh" ? "勿扰结束时间" : "Quiet hours end"}
              />
            </div>
          </SettingRow>
        )}
      </SectionBlock>
    </div>
  );
}

export const notificationsPane: Pane = {
  id: "notifications",
  icon: "bell",
  i18nKey: "settings.notifications",
  render: (props: PaneRenderProps): React.ReactElement => (
    <NotificationsPaneContent {...props} />
  ),
};
