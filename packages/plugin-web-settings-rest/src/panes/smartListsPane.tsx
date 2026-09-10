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
import type { Pane, PaneDepartureGuard, PaneRenderProps } from "@repo/plugin-web-settings-shell";
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

function sameMap(left: SmartListsMap, right: SmartListsMap): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return leftKeys.length === rightKeys.length
    && leftKeys.every(key => Object.hasOwn(right, key) && left[key] === right[key]);
}

function SmartListsPaneContent({ lang, registerDepartureGuard }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);
  const smartListsSave = usePrefAutosaveAsync("xai_pref_smart_lists", { validate: isSmartListsMap });
  const editSmartLists = smartListsSave.edit;
  const reloadSmartLists = smartListsSave.meta.reload;
  const scope = React.useSyncExternalStore(accountScope.subscribe, accountScope.capture, accountScope.capture);
  const latestModesRef = React.useRef<SmartListsMap>(smartListsSave.value);
  const sessionEpochRef = React.useRef(scope.epoch);
  const draftRef = React.useRef<{ readonly scope: typeof scope; readonly values: SmartListsMap } | null>(null);
  const [hasDraft, setHasDraft] = React.useState(false);
  const [exportFailed, setExportFailed] = React.useState(false);

  // A caller draft is session-bound: it never carries A's desired map into B.
  if (sessionEpochRef.current !== scope.epoch) {
    sessionEpochRef.current = scope.epoch;
    latestModesRef.current = smartListsSave.value;
    draftRef.current = null;
  }
  React.useLayoutEffect(() => {
    sessionEpochRef.current = scope.epoch;
    if (draftRef.current?.scope !== scope) {
      draftRef.current = null;
      setHasDraft(false);
      setExportFailed(false);
    }
    if (smartListsSave.meta.status === "idle" || smartListsSave.meta.status === "saved") {
      latestModesRef.current = smartListsSave.value;
    }
  }, [scope, smartListsSave.meta.status, smartListsSave.value]);

  React.useEffect(() => {
    const draft = draftRef.current;
    if (draft && smartListsSave.meta.status === "saved" && sameMap(draft.values, smartListsSave.value)) {
      draftRef.current = null;
      setHasDraft(false);
    }
  }, [smartListsSave.meta.status, smartListsSave.value]);

  const editable = smartListsSave.meta.source === "absent" || smartListsSave.meta.source === "valid";
  const changeVisibility = React.useCallback((id: SmartListId, value: string) => {
    if (!editable || !isSmartListVisibility(value)) return;
    const next = withSmartListVisibility(latestModesRef.current, id, value);
    if (!isSmartListsMap(next)) return;
    latestModesRef.current = next;
    draftRef.current = { scope, values: next };
    setHasDraft(true);
    setExportFailed(false);
    void editSmartLists(next);
  }, [editable, editSmartLists, scope]);
  const needsRecovery = smartListsSave.meta.status === "error" || smartListsSave.meta.status === "conflict";
  const hasCurrentDraft = React.useCallback(() => {
    const draft = draftRef.current;
    return draft !== null && accountScope.capture() === draft.scope && isSmartListsMap(draft.values);
  }, []);
  const exportDraft = React.useCallback(() => {
    const draft = draftRef.current;
    if (!draft || accountScope.capture() !== draft.scope || !isSmartListsMap(draft.values)) return;
    let url: string | null = null;
    let anchor: HTMLAnchorElement | null = null;
    try {
      const payload = JSON.stringify({ version: 1, kind: "smart-lists-draft", values: draft.values });
      const blob = new Blob([payload], { type: "application/json" });
      url = URL.createObjectURL(blob);
      if (accountScope.capture() !== draft.scope) throw new Error("stale-owner");
      anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "smart-lists-draft.json";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      if (accountScope.capture() !== draft.scope) throw new Error("stale-owner");
      anchor.click();
      setExportFailed(false);
    } catch {
      if (accountScope.capture() === draft.scope) setExportFailed(true);
    } finally {
      try { anchor?.remove(); } catch { /* no state change for cleanup failure */ }
      try { if (url) URL.revokeObjectURL(url); } catch { /* no state change for cleanup failure */ }
    }
  }, []);
  const discardDraft = React.useCallback(() => {
    draftRef.current = null;
    setHasDraft(false);
    reloadSmartLists();
  }, [reloadSmartLists]);
  const guard = React.useMemo<PaneDepartureGuard>(() => ({
    token: draftRef,
    isBlocking: hasCurrentDraft,
    isCurrent: hasCurrentDraft,
    exportDraft,
    discardDraft,
  }), [discardDraft, exportDraft, hasCurrentDraft]);
  React.useEffect(() => registerDepartureGuard?.(guard), [guard, hasDraft, registerDepartureGuard, smartListsSave.meta.status]);
  React.useEffect(() => {
    if (!hasDraft) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasCurrentDraft()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasCurrentDraft, hasDraft]);

  return (
    <div className="smart-lists-pane">
      <h3 className="pane-title">{s("settings.smart_lists")}</h3>
      {(smartListsSave.meta.status === "pending" || smartListsSave.meta.status === "saved") && (
        <p className="smart-lists-save-status" role="status" aria-live="polite">
          {smartListsSave.meta.status === "pending" ? t("smartLists.saving") : t("smartLists.saved")}
        </p>
      )}
      {needsRecovery && (
        <div className="smart-lists-recovery" role="alert">
          <p>{smartListsSave.meta.status === "conflict" ? t("smartLists.conflict") : t("smartLists.notSaved")}</p>
          {smartListsSave.meta.status === "error" && (smartListsSave.meta.source === "invalid" || smartListsSave.meta.source === "unavailable") && <p>{t("smartLists.sourceUnavailable")}</p>}
          <div className="smart-lists-recovery-actions">
            <button type="button" onClick={() => void smartListsSave.retry()}>{t("smartLists.retry")}</button>
            {hasDraft && <button type="button" onClick={exportDraft}>{t("smartLists.export")}</button>}
            {smartListsSave.meta.status === "conflict" ? <button type="button" onClick={discardDraft}>{t("smartLists.discardAndReload")}</button> : (smartListsSave.meta.source === "invalid" || smartListsSave.meta.source === "unavailable") ? <button type="button" onClick={smartListsSave.meta.reload}>{t("smartLists.reload")}</button> : null}
          </div>
          {exportFailed && <p>{t("smartLists.exportFailed")}</p>}
        </div>
      )}
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
