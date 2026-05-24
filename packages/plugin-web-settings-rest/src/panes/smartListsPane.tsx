/**
 * smartListsPane — Settings → Smart Lists pane.
 *
 * 3 grouped sections × tri-state select per row.
 * Persists via single xai_pref_smart_lists JSON key.
 *
 * Port of web design/module-settings.jsx lines 306-371.
 * API contract: packages/xai-web-settings-rest/docs/api.md §4.3
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import type { WebPrefKey } from "@repo/plugin-web-storage";
import { localI18n } from "../internal/localI18n.js";
import type { SmartListId, SmartListVisibility } from "../types.js";

type SmartListsMap = Readonly<Record<SmartListId, SmartListVisibility>>;

const DEFAULT_MAP: SmartListsMap = {
  all: "show",
  today: "show",
  tomorrow: "show",
  next7: "show",
  assigned: "if-not-empty",
  inbox: "show",
  summary: "show",
  tags: "show",
  filters: "show",
  completed: "show",
  wont_do: "if-not-empty",
  trash: "show",
} as const;

interface SectionDef {
  readonly groupKey: "smartLists.defaultLists" | "smartLists.organize" | "smartLists.others";
  readonly items: ReadonlyArray<{ readonly id: SmartListId; readonly nameKey: `smartLists.${string}` }>;
}

const SECTIONS: readonly SectionDef[] = [
  {
    groupKey: "smartLists.defaultLists",
    items: [
      { id: "all",      nameKey: "smartLists.all" },
      { id: "today",    nameKey: "smartLists.today" },
      { id: "tomorrow", nameKey: "smartLists.tomorrow" },
      { id: "next7",    nameKey: "smartLists.next7" },
      { id: "assigned", nameKey: "smartLists.assigned" },
      { id: "inbox",    nameKey: "smartLists.inbox" },
      { id: "summary",  nameKey: "smartLists.summary" },
    ],
  },
  {
    groupKey: "smartLists.organize",
    items: [
      { id: "tags",    nameKey: "smartLists.tags" },
      { id: "filters", nameKey: "smartLists.filters" },
    ],
  },
  {
    groupKey: "smartLists.others",
    items: [
      { id: "completed", nameKey: "smartLists.completed" },
      { id: "wont_do",   nameKey: "smartLists.wont_do" },
      { id: "trash",     nameKey: "smartLists.trash" },
    ],
  },
] as const;

const VISIBILITY_KEYS: readonly SmartListVisibility[] = [
  "show",
  "if-not-empty",
  "hide",
] as const;

function SmartListsPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);

  const [modes, setModes] = usePref(
    "xai_pref_smart_lists" as WebPrefKey,
  ) as readonly [SmartListsMap, (v: SmartListsMap) => void, unknown];

  const currentModes: SmartListsMap =
    modes && typeof modes === "object" ? (modes as SmartListsMap) : DEFAULT_MAP;

  return (
    <div className="smart-lists-pane">
      <h3 className="pane-title">{s("settings.smart_lists")}</h3>
      {SECTIONS.map((section) => (
        <div key={section.groupKey} className="sl-section">
          <div className="sl-group">{t(section.groupKey)}</div>
          <div className="sl-rows">
            {section.items.map((item) => (
              <div key={item.id} className="sl-row">
                <span className="sl-name">{t(item.nameKey)}</span>
                <span className="grow" />
                <select
                  className="sl-select"
                  value={currentModes[item.id] ?? "show"}
                  onChange={(e) =>
                    setModes({
                      ...currentModes,
                      [item.id]: e.target.value as SmartListVisibility,
                    })
                  }
                  aria-label={t(item.nameKey)}
                >
                  {VISIBILITY_KEYS.map((v) => (
                    <option key={v} value={v}>
                      {t(`smartLists.${v}`)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export const smartListsPane: Pane = {
  id: "smart_lists",
  icon: "sparkle",
  i18nKey: "settings.smart_lists",
  render: (props: PaneRenderProps): React.ReactElement => (
    <SmartListsPaneContent {...props} />
  ),
};
