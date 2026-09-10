/** Settings → Collaborate: three independently persisted, recoverable controls. */
import * as React from "react";
import type { Pane, PaneDepartureGuard, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { Toggle, SettingRow, SectionBlock } from "@repo/plugin-web-settings-shell";
import { accountScope, usePrefAutosaveAsync } from "@repo/plugin-web-storage";
import type { PrefAutosaveAsyncResult, WebPrefKey } from "@repo/plugin-web-storage";
import { useI18n } from "@repo/plugin-web-tokens";
import { localI18n } from "../internal/localI18n.js";
import type { DefaultShare } from "../types.js";

type FieldId = "default_share" | "show_avatars" | "mention_notify";
type FieldValue = DefaultShare | boolean;
type FieldDraft = Readonly<{ value: FieldValue; session: object; operation: object }>;
type Drafts = Record<FieldId, FieldDraft | null>;
const fields: readonly FieldId[] = ["default_share", "show_avatars", "mention_notify"];
const emptyDrafts = (): Drafts => ({ default_share: null, show_avatars: null, mention_notify: null });
const isDefaultShare = (value: unknown): value is DefaultShare => value === "comment" || value === "edit" || value === "view";
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

function CollaboratePaneContent({ lang, registerDepartureGuard }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);
  const scope = React.useSyncExternalStore(accountScope.subscribe, accountScope.capture, accountScope.capture);
  const defaultShare = usePrefAutosaveAsync("xai_pref_collab_default_share" as WebPrefKey, { validate: isDefaultShare });
  const showAvatars = usePrefAutosaveAsync("xai_pref_collab_show_avatars" as WebPrefKey, { validate: isBoolean });
  const mentionNotify = usePrefAutosaveAsync("xai_pref_collab_mention_notify" as WebPrefKey, { validate: isBoolean });
  const scopeRef = React.useRef(scope);
  scopeRef.current = scope;
  const prefsRef = React.useRef({ defaultShare, showAvatars, mentionNotify });
  prefsRef.current = { defaultShare, showAvatars, mentionNotify };
  const accountEpochRef = React.useRef(scope.epoch);
  const compositeTokenRef = React.useRef<object>({});
  const accountSessionRef = React.useRef<object>({});
  const deviceSessionRef = React.useRef<object>({});
  const draftsRef = React.useRef<Drafts>(emptyDrafts());
  const [draftVersion, setDraftVersion] = React.useState(0);
  const [exportFailed, setExportFailed] = React.useState(false);

  // Device drafts survive an account epoch; account drafts and all old decision
  // capabilities do not. This runs during the epoch render before any UI reads.
  if (accountEpochRef.current !== scope.epoch) {
    accountEpochRef.current = scope.epoch;
    compositeTokenRef.current = {};
    accountSessionRef.current = {};
    draftsRef.current.default_share = null;
  }
  React.useEffect(() => () => {
    compositeTokenRef.current = {};
    draftsRef.current = emptyDrafts();
  }, []);

  const currentComposite = React.useCallback(() => accountEpochRef.current === scopeRef.current.epoch && accountScope.capture() === scopeRef.current, []);
  const isCurrentDraft = React.useCallback((field: FieldId, draft: FieldDraft | null) => {
    if (!draft || !currentComposite()) return false;
    return draft.session === (field === "default_share" ? accountSessionRef.current : deviceSessionRef.current);
  }, [currentComposite]);
  const hasCurrentDraft = React.useCallback(() => fields.some(field => isCurrentDraft(field, draftsRef.current[field])), [isCurrentDraft]);
  const changed = React.useCallback(() => setDraftVersion(version => version + 1), []);
  const clearIfMatching = React.useCallback((field: FieldId, draft: FieldDraft, ok: boolean) => {
    if (ok && draftsRef.current[field] === draft) {
      draftsRef.current[field] = null;
      changed();
    }
  }, [changed]);
  const putDraft = React.useCallback((field: FieldId, value: FieldValue) => {
    const session = field === "default_share" ? accountSessionRef.current : deviceSessionRef.current;
    const draft = { value, session, operation: {} };
    draftsRef.current[field] = draft;
    setExportFailed(false);
    changed();
    return draft;
  }, [changed]);
  const edit = React.useCallback((field: FieldId, value: FieldValue, pref: PrefAutosaveAsyncResult<FieldValue>) => {
    if (!currentComposite() || (field === "default_share" ? !isDefaultShare(value) : !isBoolean(value))) return;
    const draft = putDraft(field, value);
    void pref.edit(value).then(result => clearIfMatching(field, draft, result.ok));
  }, [clearIfMatching, currentComposite, putDraft]);
  const retry = React.useCallback((field: FieldId, pref: PrefAutosaveAsyncResult<FieldValue>) => {
    const draft = draftsRef.current[field];
    if (!isCurrentDraft(field, draft)) return;
    const currentDraft = draft!;
    void pref.retry().then(result => clearIfMatching(field, currentDraft, result.ok));
  }, [clearIfMatching, isCurrentDraft]);
  const discard = React.useCallback((field: FieldId, pref: PrefAutosaveAsyncResult<FieldValue>) => {
    const draft = draftsRef.current[field];
    if (draft && !isCurrentDraft(field, draft)) return;
    if (draft) { draftsRef.current[field] = null; changed(); }
    pref.meta.reload();
  }, [changed, isCurrentDraft]);
  const exportDraft = React.useCallback(() => {
    const token = compositeTokenRef.current;
    if (!currentComposite() || !hasCurrentDraft()) return;
    const account: { default_share?: DefaultShare } = {};
    const device: { show_avatars?: boolean; mention_notify?: boolean } = {};
    const share = draftsRef.current.default_share;
    const avatars = draftsRef.current.show_avatars;
    const mentions = draftsRef.current.mention_notify;
    if (share && isCurrentDraft("default_share", share) && isDefaultShare(share.value)) account.default_share = share.value;
    if (avatars && isCurrentDraft("show_avatars", avatars) && isBoolean(avatars.value)) device.show_avatars = avatars.value;
    if (mentions && isCurrentDraft("mention_notify", mentions) && isBoolean(mentions.value)) device.mention_notify = mentions.value;
    if (Object.keys(account).length + Object.keys(device).length === 0) return;
    let url: string | null = null;
    let anchor: HTMLAnchorElement | null = null;
    const stillCurrent = () => currentComposite() && compositeTokenRef.current === token;
    try {
      const blob = new Blob([JSON.stringify({ version: 1, kind: "collaborate-draft", values: { account, device } })], { type: "application/json" });
      url = URL.createObjectURL(blob);
      if (!stillCurrent()) throw new Error("stale-session");
      anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "collaborate-draft.json";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      if (!stillCurrent()) throw new Error("stale-session");
      anchor.click();
      if (stillCurrent()) setExportFailed(false);
    } catch {
      if (stillCurrent()) setExportFailed(true);
    } finally {
      try { anchor?.remove(); } catch { /* cleanup does not alter drafts */ }
      try { if (url) URL.revokeObjectURL(url); } catch { /* cleanup does not alter drafts */ }
    }
  }, [currentComposite, hasCurrentDraft, isCurrentDraft]);
  const discardAll = React.useCallback(() => {
    if (!currentComposite()) return;
    const candidates = [
      ["default_share", prefsRef.current.defaultShare],
      ["show_avatars", prefsRef.current.showAvatars],
      ["mention_notify", prefsRef.current.mentionNotify],
    ] as const;
    for (const [field, pref] of candidates) {
      if (isCurrentDraft(field, draftsRef.current[field])) discard(field, pref as PrefAutosaveAsyncResult<FieldValue>);
    }
  }, [currentComposite, discard, isCurrentDraft]);
  const guardToken = compositeTokenRef.current;
  const departureLabel = s("settings.collaborate");
  const guard = React.useMemo<PaneDepartureGuard>(() => {
    const isCurrent = () => currentComposite() && compositeTokenRef.current === guardToken;
    return {
      token: guardToken,
      label: departureLabel,
      isCurrent,
      isBlocking: () => isCurrent() && hasCurrentDraft(),
      exportDraft: () => { if (isCurrent()) exportDraft(); },
      discardDraft: () => { if (isCurrent()) discardAll(); },
    };
  }, [currentComposite, departureLabel, discardAll, exportDraft, guardToken, hasCurrentDraft]);
  React.useEffect(() => registerDepartureGuard?.(guard), [draftVersion, guard, registerDepartureGuard]);
  React.useEffect(() => {
    if (!hasCurrentDraft()) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { if (hasCurrentDraft()) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [draftVersion, hasCurrentDraft]);

  const uiFields = [
    { id: "show_avatars" as const, label: t("collab.showAvatars"), pref: showAvatars as PrefAutosaveAsyncResult<FieldValue> },
    { id: "default_share" as const, label: t("collab.defaultShare"), pref: defaultShare as PrefAutosaveAsyncResult<FieldValue> },
    { id: "mention_notify" as const, label: t("collab.mentionNotify"), pref: mentionNotify as PrefAutosaveAsyncResult<FieldValue> },
  ];
  const needsRecovery = uiFields.filter(({ pref }) => pref.meta.status === "error" || pref.meta.status === "conflict");
  const anyPending = uiFields.some(({ pref }) => pref.meta.status === "pending");
  const anySaved = uiFields.some(({ pref }) => pref.meta.status === "saved");
  return <div className="collab-pane">
    <h3 className="pane-title">{s("settings.collaborate")}</h3>
    {anyPending && <p className="collab-save-status" role="status" aria-live="polite">{t("collab.saving")}</p>}
    {!hasCurrentDraft() && needsRecovery.length === 0 && anySaved && <p className="collab-save-status" role="status" aria-live="polite">{t("collab.saved")}</p>}
    {hasCurrentDraft() && needsRecovery.length === 0 && <div className="collab-recovery">
      <div className="collab-recovery-actions"><button type="button" onClick={exportDraft}>{t("collab.export")}</button></div>
      {exportFailed && <p role="alert">{t("collab.exportFailed")}</p>}
    </div>}
    {needsRecovery.length > 0 && <div className="collab-recovery" role="alert">
      <div className="collab-recovery-fields">{needsRecovery.map(({ id, label, pref }) => {
        const sourceOnly = !isCurrentDraft(id, draftsRef.current[id]) && (pref.meta.source === "invalid" || pref.meta.source === "unavailable");
        const message = pref.meta.status === "conflict" ? t("collab.conflict") : pref.meta.source === "invalid" || pref.meta.source === "unavailable" ? t("collab.sourceUnavailable") : t("collab.notSaved");
        return <div className="collab-recovery-field" key={id}>
          <p><strong>{label}</strong><span>{message}</span></p>
          {!sourceOnly && <button type="button" aria-label={`${t("collab.retry")} ${label}`} onClick={() => retry(id, pref)}>{t("collab.retry")}</button>}
          <button type="button" aria-label={sourceOnly ? `${t("collab.reload")} ${label}` : `${t("collab.discardAndReload")} ${label}`} onClick={() => discard(id, pref)}>{sourceOnly ? t("collab.reload") : t("collab.discard")}</button>
        </div>;
      })}</div>
      {hasCurrentDraft() && <div className="collab-recovery-actions"><button type="button" onClick={exportDraft}>{t("collab.export")}</button></div>}
      {exportFailed && <p>{t("collab.exportFailed")}</p>}
    </div>}
    <SectionBlock>
      <SettingRow label={t("collab.showAvatars")}><Toggle on={showAvatars.value as boolean} onChange={() => edit("show_avatars", !(draftsRef.current.show_avatars?.value ?? showAvatars.value as boolean), showAvatars as PrefAutosaveAsyncResult<FieldValue>)} ariaLabel={t("collab.showAvatars")} /></SettingRow>
      <SettingRow label={t("collab.defaultShare")}><select className="sl-select" value={defaultShare.value as DefaultShare} disabled={defaultShare.meta.source !== "absent" && defaultShare.meta.source !== "valid"} onChange={event => { if (isDefaultShare(event.target.value)) edit("default_share", event.target.value, defaultShare as PrefAutosaveAsyncResult<FieldValue>); }} aria-label={t("collab.defaultShare")}><option value="comment">{t("collab.canComment")}</option><option value="edit">{t("collab.canEdit")}</option><option value="view">{t("collab.viewOnly")}</option></select></SettingRow>
      <SettingRow label={t("collab.mentionNotify")}><Toggle on={mentionNotify.value as boolean} onChange={() => edit("mention_notify", !(draftsRef.current.mention_notify?.value ?? mentionNotify.value as boolean), mentionNotify as PrefAutosaveAsyncResult<FieldValue>)} ariaLabel={t("collab.mentionNotify")} /></SettingRow>
    </SectionBlock>
  </div>;
}

export const collaboratePane: Pane = { id: "collaborate", icon: "sliders", i18nKey: "settings.collaborate", render: props => <CollaboratePaneContent {...props} /> };
