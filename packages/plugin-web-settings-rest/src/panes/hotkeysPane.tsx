/**
 * hotkeysPane — Settings → Hotkeys pane.
 *
 * Read-only table of 10 keyboard shortcuts. No edit affordance.
 * Port of web design/module-settings.jsx lines 982-1010.
 * API contract: packages/xai-web-settings-rest/docs/api.md §4.10
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
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

function HotkeysPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);

  return (
    <div className="hotkeys-pane">
      <h3 className="pane-title">{s("settings.hotkeys")}</h3>
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
