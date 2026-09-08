/**
 * @internal — SettingsSidebar.tsx
 *
 * Renders the 13-pane sidebar grouped into 4 visual groups per source line 27-50.
 * Not exported from index.ts.
 */

import * as React from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";
import type { Pane, SettingsPaneId } from "../types.js";

interface SettingsSidebarProps {
  lang: Lang;
  panes: readonly Pane[];
  active: SettingsPaneId;
  onSelect: (id: SettingsPaneId) => void;
}

/**
 * Group boundaries match source line 27-50:
 *   group 1: account, premium
 *   group 2: features, smart_lists, notifications, date_time, appearance, more
 *   group 3: integrations, collaborate, sticky, hotkeys
 *   group 4: about
 */
const GROUP_BOUNDARIES: readonly SettingsPaneId[][] = [
  ["account", "premium"],
  ["features", "smart_lists", "notifications", "date_time", "appearance", "more"],
  ["integrations", "collaborate", "sticky", "hotkeys"],
  ["about"],
];

export function SettingsSidebar({
  lang,
  panes,
  active,
  onSelect,
}: SettingsSidebarProps): React.ReactElement {
  const { s } = useI18n(lang);
  const byId = new Map(panes.map((p) => [p.id, p]));

  return (
    <aside className="settings-sidebar">
      <h2 className="settings-h">{s("settings.title")}</h2>
      {GROUP_BOUNDARIES.map((groupIds, gi) => (
        <div key={gi} className="settings-group">
          {groupIds.map((id) => {
            const pane = byId.get(id);
            if (pane === undefined) return null;
            return (
              <div
                key={id}
                className="list-row"
                data-active={active === id ? "true" : "false"}
                onClick={() => onSelect(id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(id);
                  }
                }}
              >
                <span className="grow">{s(pane.i18nKey)}</span>
              </div>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
