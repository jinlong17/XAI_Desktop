/**
 * hotkeysPane — Settings → Hotkeys pane.
 *
 * Desktop quick-open section consumes browser-safe bridge state/actions.
 * Existing web shortcut list stays read-only.
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import {
  setDesktopQuickOpenPreference,
  useDesktopQuickOpenSnapshot,
  type DesktopQuickOpenPresetId,
  type DesktopQuickOpenRuntimeState,
} from "@repo/desktop-global-hotkey-quick-open/web";
import { localI18n } from "../internal/localI18n.js";

interface HotkeyRow {
  readonly actionKey:
    | "hk.quickAdd"
    | "hk.globalSearch"
    | "hk.switchBoards"
    | "hk.today"
    | "hk.calendar"
    | "hk.pomodoro"
    | "hk.toggleDark"
    | "hk.togglePet"
    | "hk.newSticky"
    | "hk.clearCompleted";
  readonly combo: string;
}

const HOTKEYS_TABLE: readonly HotkeyRow[] = [
  { actionKey: "hk.quickAdd",      combo: "⌘ ⇧ A" },
  { actionKey: "hk.globalSearch",  combo: "⌘ K"   },
  { actionKey: "hk.switchBoards",  combo: "⌘ B"   },
  { actionKey: "hk.today",         combo: "⌘ T"   },
  { actionKey: "hk.calendar",      combo: "⌘ C"   },
  { actionKey: "hk.pomodoro",      combo: "⌘ P"   },
  { actionKey: "hk.toggleDark",    combo: "⌘ ⇧ D" },
  { actionKey: "hk.togglePet",     combo: "⌘ ⇧ P" },
  { actionKey: "hk.newSticky",     combo: "⌘ ⇧ N" },
  { actionKey: "hk.clearCompleted",combo: "⌘ ⇧ K" },
] as const;

const QUICK_OPEN_PRESET_OPTIONS: ReadonlyArray<{
  id: DesktopQuickOpenPresetId;
  labelKey: string;
}> = [
  { id: "default", labelKey: "hk.desktopPreset.default" },
  { id: "alt-1", labelKey: "hk.desktopPreset.alt1" },
  { id: "alt-2", labelKey: "hk.desktopPreset.alt2" },
  { id: "disabled", labelKey: "hk.desktopPreset.disabled" },
] as const;

function runtimeStateLabelKey(state: DesktopQuickOpenRuntimeState): string {
  if (state === "ready") {
    return "hk.desktopStatus.ready";
  }
  if (state === "disabled") {
    return "hk.desktopStatus.disabled";
  }
  if (state === "conflict") {
    return "hk.desktopStatus.conflict";
  }
  if (state === "invalid_config") {
    return "hk.desktopStatus.invalid_config";
  }
  return "hk.desktopStatus.native_error";
}

function statusClassName(state: DesktopQuickOpenRuntimeState): string {
  if (state === "ready") {
    return "desktop-quick-open-status ready";
  }
  if (state === "disabled") {
    return "desktop-quick-open-status disabled";
  }
  return "desktop-quick-open-status error";
}

function HotkeysPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);
  const snapshot = useDesktopQuickOpenSnapshot();
  const [saving, setSaving] = React.useState(false);

  const onPresetChange = React.useCallback(async (nextPreset: DesktopQuickOpenPresetId) => {
    setSaving(true);
    try {
      await setDesktopQuickOpenPreference({
        presetId: nextPreset,
        enabled: nextPreset !== "disabled",
      });
    } finally {
      setSaving(false);
    }
  }, []);

  const onDisable = React.useCallback(async () => {
    setSaving(true);
    try {
      await setDesktopQuickOpenPreference({ presetId: "disabled", enabled: false });
    } finally {
      setSaving(false);
    }
  }, []);

  const onResetDefault = React.useCallback(async () => {
    setSaving(true);
    try {
      await setDesktopQuickOpenPreference({ presetId: "default", enabled: true });
    } finally {
      setSaving(false);
    }
  }, []);

  return (
    <div className="hotkeys-pane">
      <h3 className="pane-title">{s("settings.hotkeys")}</h3>

      <section className="desktop-quick-open-section" aria-label={t("hk.desktopQuickOpenTitle")}>
        <h4>{t("hk.desktopQuickOpenTitle")}</h4>
        <p className="desktop-quick-open-desc">{t("hk.desktopQuickOpenDesc")}</p>

        <div className="desktop-quick-open-meta">
          <span className="desktop-quick-open-label">{t("hk.desktopStatus")}</span>
          <span className={statusClassName(snapshot.runtime.state)}>
            {t(runtimeStateLabelKey(snapshot.runtime.state))}
          </span>
        </div>

        <div className="desktop-quick-open-meta">
          <span className="desktop-quick-open-label">{t("hk.desktopCurrentShortcut")}</span>
          <code className="desktop-quick-open-shortcut">{snapshot.preference.accelerator ?? "—"}</code>
        </div>

        <label className="desktop-quick-open-select-wrap" htmlFor="desktop-quick-open-preset">
          <span className="desktop-quick-open-label">{t("hk.desktopPreset")}</span>
          <select
            id="desktop-quick-open-preset"
            value={snapshot.preference.presetId}
            onChange={(event) => {
              void onPresetChange(event.target.value as DesktopQuickOpenPresetId);
            }}
            disabled={saving}
          >
            {QUICK_OPEN_PRESET_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </label>

        <div className="desktop-quick-open-actions">
          <button type="button" onClick={() => void onDisable()} disabled={saving}>
            {t("hk.desktopDisable")}
          </button>
          <button type="button" onClick={() => void onResetDefault()} disabled={saving}>
            {t("hk.desktopReset")}
          </button>
        </div>

        <p className="desktop-quick-open-runtime-label">{snapshot.runtime.label}</p>
      </section>

      <ul className="hk-list">
        {HOTKEYS_TABLE.map((row) => (
          <li key={row.actionKey} className="hk-row">
            <span>{t(row.actionKey)}</span>
            <span className="grow" />
            <span className="hk-combo">
              {row.combo.split(" ").map((k, idx) => (
                <kbd key={idx}>{k}</kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const hotkeysPane: Pane = {
  id: "hotkeys",
  icon: "search",
  i18nKey: "settings.hotkeys",
  render: (props: PaneRenderProps): React.ReactElement => (
    <HotkeysPaneContent {...props} />
  ),
};
