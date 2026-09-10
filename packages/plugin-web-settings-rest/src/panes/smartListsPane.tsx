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
import { accountScope, usePrefAutosaveAsync } from "@repo/plugin-web-storage";
import { localI18n } from "../internal/localI18n.js";
import {
  isSmartListVisibility,
  isSmartListsMap,
  SMART_LIST_VISIBILITIES,
  smartListVisibilityFor,
  type SmartListsMap,
  withSmartListVisibility,
} from "../internal/smartListsPreference.js";
import type { SmartListId } from "../types.js";

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

function SmartListsPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);
  const smartListsSave = usePrefAutosaveAsync("xai_pref_smart_lists", { validate: isSmartListsMap });
  const editSmartLists = smartListsSave.edit;
  const scope = React.useSyncExternalStore(accountScope.subscribe, accountScope.capture, accountScope.capture);
  const latestModesRef = React.useRef<SmartListsMap>(smartListsSave.value);
  const sessionEpochRef = React.useRef(scope.epoch);

  // A caller draft is session-bound: it never carries A's desired map into B.
  if (sessionEpochRef.current !== scope.epoch) {
    sessionEpochRef.current = scope.epoch;
    latestModesRef.current = smartListsSave.value;
  }
  React.useLayoutEffect(() => {
    sessionEpochRef.current = scope.epoch;
    if (smartListsSave.meta.status === "idle" || smartListsSave.meta.status === "saved") {
      latestModesRef.current = smartListsSave.value;
    }
  }, [scope.epoch, smartListsSave.meta.status, smartListsSave.value]);

  const editable = smartListsSave.meta.source === "absent" || smartListsSave.meta.source === "valid";
  const changeVisibility = React.useCallback((id: SmartListId, value: string) => {
    if (!editable || !isSmartListVisibility(value)) return;
    const next = withSmartListVisibility(latestModesRef.current, id, value);
    if (!isSmartListsMap(next)) return;
    latestModesRef.current = next;
    void editSmartLists(next);
  }, [editable, editSmartLists]);
  const needsRecovery = smartListsSave.meta.status === "error" || smartListsSave.meta.status === "conflict";

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
                  value={smartListVisibilityFor(smartListsSave.value, item.id)}
                  onChange={(e) => changeVisibility(item.id, e.target.value)}
                  aria-label={t(item.nameKey)}
                  disabled={!editable}
                >
                  {SMART_LIST_VISIBILITIES.map((v) => (
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
      {(smartListsSave.meta.status === "pending" || smartListsSave.meta.status === "saved") && (
        <p className="smart-lists-save-status" role="status" aria-live="polite">
          {smartListsSave.meta.status === "pending" ? t("smartLists.saving") : t("smartLists.saved")}
        </p>
      )}
      {needsRecovery && (
        <div className="smart-lists-recovery" role="alert">
          <p>{smartListsSave.meta.status === "conflict" ? t("smartLists.conflict") : t("smartLists.notSaved")}</p>
          {smartListsSave.meta.status === "error" && (smartListsSave.meta.source === "invalid" || smartListsSave.meta.source === "unavailable") && (
            <p>{t("smartLists.sourceUnavailable")}</p>
          )}
          <div className="smart-lists-recovery-actions">
            <button type="button" onClick={() => void smartListsSave.retry()}>{t("smartLists.retry")}</button>
            {smartListsSave.meta.status === "conflict" ? (
              <button type="button" onClick={smartListsSave.meta.reload}>{t("smartLists.discardAndReload")}</button>
            ) : (smartListsSave.meta.source === "invalid" || smartListsSave.meta.source === "unavailable") ? (
              <button type="button" onClick={smartListsSave.meta.reload}>{t("smartLists.reload")}</button>
            ) : null}
          </div>
        </div>
      )}
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
