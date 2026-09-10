/** Settings → Date & Time: five independently recoverable device preferences. */
import * as React from "react";
import type { Pane, PaneDepartureGuard, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { Toggle, SettingRow, SectionBlock } from "@repo/plugin-web-settings-shell";
import { accountScope, usePrefAutosaveAsync } from "@repo/plugin-web-storage";
import type { PrefAutosaveAsyncResult, WebPrefKey } from "@repo/plugin-web-storage";
import { useI18n } from "@repo/plugin-web-tokens";
import { localI18n } from "../internal/localI18n.js";

type StartWeek = "monday" | "sunday" | "saturday";
type FieldId = "start_week" | "lunar" | "week_numbers" | "holidays" | "timezone";
type FieldValue = StartWeek | boolean;
type Draft = Readonly<{ value: FieldValue; session: object; operation: object }>;
type Drafts = Record<FieldId, Draft | null>;
type Prefs = Record<FieldId, PrefAutosaveAsyncResult<FieldValue>>;

const fields: readonly FieldId[] = ["start_week", "lunar", "week_numbers", "holidays", "timezone"];
const emptyDrafts = (): Drafts => ({ start_week: null, lunar: null, week_numbers: null, holidays: null, timezone: null });
const isStartWeek = (value: unknown): value is StartWeek => value === "monday" || value === "sunday" || value === "saturday";
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const isValueFor = (field: FieldId, value: unknown): value is FieldValue => field === "start_week" ? isStartWeek(value) : isBoolean(value);

function DateTimePaneContent({ lang, registerDepartureGuard }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);
  const scope = React.useSyncExternalStore(accountScope.subscribe, accountScope.capture, accountScope.capture);
  const startWeek = usePrefAutosaveAsync("xai_pref_dt_start_week" as WebPrefKey, { validate: isStartWeek });
  const lunar = usePrefAutosaveAsync("xai_pref_dt_lunar" as WebPrefKey, { validate: isBoolean });
  const weekNumbers = usePrefAutosaveAsync("xai_pref_dt_week_numbers" as WebPrefKey, { validate: isBoolean });
  const holidays = usePrefAutosaveAsync("xai_pref_dt_holidays" as WebPrefKey, { validate: isBoolean });
  const timezone = usePrefAutosaveAsync("xai_pref_dt_timezone" as WebPrefKey, { validate: isBoolean });
  const prefs = { start_week: startWeek, lunar, week_numbers: weekNumbers, holidays, timezone } as unknown as Prefs;
  const prefsRef = React.useRef(prefs); prefsRef.current = prefs;
  const scopeRef = React.useRef(scope); scopeRef.current = scope;
  const epochRef = React.useRef(scope.epoch);
  const decisionTokenRef = React.useRef<object>({});
  const deviceSessionRef = React.useRef<object>({});
  const draftsRef = React.useRef<Drafts>(emptyDrafts());
  const [, setDraftVersion] = React.useState(0);
  const [exportFailed, setExportFailed] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Device work survives owner changes, but an old host decision must refuse.
  if (epochRef.current !== scope.epoch) { epochRef.current = scope.epoch; decisionTokenRef.current = {}; }
  React.useEffect(() => () => { decisionTokenRef.current = {}; draftsRef.current = emptyDrafts(); }, []);

  const changed = React.useCallback(() => setDraftVersion(version => version + 1), []);
  const currentScope = React.useCallback(() => accountScope.capture() === scopeRef.current && epochRef.current === scopeRef.current.epoch, []);
  const isCurrentDraft = React.useCallback((field: FieldId, draft: Draft | null) => Boolean(draft && currentScope() && draft.session === deviceSessionRef.current && isValueFor(field, draft.value)), [currentScope]);
  const hasCurrentDraft = React.useCallback(() => fields.some(field => isCurrentDraft(field, draftsRef.current[field])), [isCurrentDraft]);

  const putDraft = React.useCallback((field: FieldId, value: FieldValue) => {
    const draft = { value, session: deviceSessionRef.current, operation: {} };
    draftsRef.current[field] = draft;
    setExportFailed(false);
    setSaved(false);
    changed();
    return draft;
  }, [changed]);
  const clearIfMatching = React.useCallback((field: FieldId, draft: Draft, ok: boolean) => {
    if (ok && draftsRef.current[field] === draft) { draftsRef.current[field] = null; setSaved(true); changed(); }
  }, [changed]);
  const edit = React.useCallback((field: FieldId, value: FieldValue) => {
    if (!currentScope() || !isValueFor(field, value)) return;
    const draft = putDraft(field, value);
    void prefsRef.current[field].edit(value).then(result => clearIfMatching(field, draft, result.ok), () => clearIfMatching(field, draft, false));
  }, [clearIfMatching, currentScope, putDraft]);
  const retry = React.useCallback((field: FieldId) => {
    const draft = draftsRef.current[field];
    if (!isCurrentDraft(field, draft)) return;
    void prefsRef.current[field].retry().then(result => clearIfMatching(field, draft!, result.ok), () => clearIfMatching(field, draft!, false));
  }, [clearIfMatching, isCurrentDraft]);
  const discard = React.useCallback((field: FieldId) => {
    const draft = draftsRef.current[field];
    if (draft && !isCurrentDraft(field, draft)) return;
    if (draft) { draftsRef.current[field] = null; changed(); }
    prefsRef.current[field].meta.reload();
  }, [changed, isCurrentDraft]);
  const reloadSource = React.useCallback((field: FieldId) => prefsRef.current[field].meta.reload(), []);
  const discardAll = React.useCallback(() => {
    if (!hasCurrentDraft()) return;
    for (const field of fields) if (isCurrentDraft(field, draftsRef.current[field])) discard(field);
  }, [discard, hasCurrentDraft, isCurrentDraft]);

  const exportDraft = React.useCallback(() => {
    const token = decisionTokenRef.current;
    if (!currentScope() || !hasCurrentDraft()) return;
    const values: Partial<Record<FieldId, FieldValue>> = {};
    for (const field of fields) {
      const draft = draftsRef.current[field];
      if (isCurrentDraft(field, draft) && draft && isValueFor(field, draft.value)) values[field] = draft.value;
    }
    if (Object.keys(values).length === 0) return;
    let anchor: HTMLAnchorElement | null = null;
    let url: string | null = null;
    const stillCurrent = () => currentScope() && decisionTokenRef.current === token && hasCurrentDraft();
    try {
      if (!stillCurrent()) return;
      const blob = new Blob([JSON.stringify({ version: 1, kind: "date-time-draft", values: { device: values } })], { type: "application/json" });
      url = URL.createObjectURL(blob);
      if (!stillCurrent()) return;
      anchor = document.createElement("a"); anchor.href = url; anchor.download = "date-time-draft.json"; anchor.style.display = "none";
      document.body.appendChild(anchor);
      if (!stillCurrent()) return;
      anchor.click();
      if (stillCurrent()) setExportFailed(false);
    } catch {
      if (!stillCurrent()) return;
      setExportFailed(true);
    } finally {
      try { anchor?.remove(); } catch { /* cleanup never changes recovery */ }
      try { if (url) URL.revokeObjectURL(url); } catch { /* cleanup never changes recovery */ }
    }
  }, [currentScope, hasCurrentDraft, isCurrentDraft]);

  const guardToken = decisionTokenRef.current;
  React.useEffect(() => {
    if (!registerDepartureGuard) return undefined;
    const capturedScope = scope;
    const isCurrent = () => decisionTokenRef.current === guardToken && currentScope() && accountScope.capture() === capturedScope;
    const guard: PaneDepartureGuard = {
      token: guardToken, label: lang === "zh" ? "日期与时间" : "Date & Time", isCurrent,
      isBlocking: () => isCurrent() && hasCurrentDraft(),
      exportDraft: () => { if (isCurrent()) exportDraft(); },
      discardDraft: () => { if (isCurrent()) discardAll(); },
    };
    return registerDepartureGuard(guard);
  }, [currentScope, discardAll, exportDraft, guardToken, hasCurrentDraft, lang, registerDepartureGuard, scope]);
  const hasActualDraft = hasCurrentDraft();
  const hasSourceIssue = fields.some(field => prefs[field].meta.source === "invalid" || prefs[field].meta.source === "unavailable" || prefs[field].meta.status === "error");
  React.useEffect(() => {
    if (!hasActualDraft) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasActualDraft]);

  const labelFor = (field: FieldId) => ({ start_week: t("dt.startWeek"), lunar: t("dt.lunar"), week_numbers: t("dt.weekNumbers"), holidays: t("dt.holidays"), timezone: t("dt.timezone") })[field];
  const fieldRecovery = (field: FieldId) => {
    const pref = prefs[field]; const draft = draftsRef.current[field]; const label = labelFor(field);
    const sourceOnly = pref.meta.source === "invalid" || pref.meta.source === "unavailable";
    if (!isCurrentDraft(field, draft) && !sourceOnly) return null;
    const draftMessage = pref.meta.status === "pending"
      ? (lang === "zh" ? `${label}正在保存。` : `${label} is saving.`)
      : (lang === "zh" ? `${label}未保存。` : `${label} was not saved.`);
    const sourceMessage = lang === "zh" ? `已保存的${label}不可用。请重新读取；这不是新的未保存更改。` : `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`;
    const activeDraft = isCurrentDraft(field, draft);
    return <div className="dt-recovery-field" role="alert" key={field}>
      <span>{activeDraft ? draftMessage : sourceMessage}</span>
      {activeDraft && <><button type="button" onClick={() => retry(field)} aria-label={`${lang === "zh" ? "重试" : "Retry"} ${label}`}>{lang === "zh" ? "重试" : "Retry"}</button><button type="button" onClick={() => discard(field)} aria-label={`${lang === "zh" ? "放弃" : "Discard"} ${label}`}>{lang === "zh" ? "放弃" : "Discard"}</button></>}
      {sourceOnly && <button type="button" onClick={() => reloadSource(field)} aria-label={`${lang === "zh" ? "重新读取" : "Reload"} ${label}`}>{lang === "zh" ? "重新读取" : "Reload"}</button>}
    </div>;
  };

  const current = (field: FieldId): FieldValue => {
    const draft = draftsRef.current[field]; return isCurrentDraft(field, draft) && draft ? draft.value : prefs[field].value;
  };
  const toggle = (field: Exclude<FieldId, "start_week">) => edit(field, current(field) !== true);

  return <div className="dt-pane">
    <h3 className="pane-title">{s("settings.date_time")}</h3>
    <SectionBlock><SettingRow label={t("dt.startWeek")}><select className="sl-select" value={current("start_week") as StartWeek} onChange={event => edit("start_week", event.target.value as FieldValue)} aria-label={t("dt.startWeek")}><option value="monday">{t("dt.monday")}</option><option value="sunday">{t("dt.sunday")}</option><option value="saturday">{t("dt.saturday")}</option></select></SettingRow>{fieldRecovery("start_week")}</SectionBlock>
    <SectionBlock style={{ marginTop: 14 }}>
      <SettingRow label={t("dt.lunar")}><Toggle on={Boolean(current("lunar"))} onChange={() => toggle("lunar")} ariaLabel={t("dt.lunar")} /></SettingRow>{fieldRecovery("lunar")}
      <SettingRow label={t("dt.weekNumbers")}><Toggle on={Boolean(current("week_numbers"))} onChange={() => toggle("week_numbers")} ariaLabel={t("dt.weekNumbers")} /></SettingRow>{fieldRecovery("week_numbers")}
      <SettingRow label={t("dt.holidays")}><Toggle on={Boolean(current("holidays"))} onChange={() => toggle("holidays")} ariaLabel={t("dt.holidays")} /></SettingRow>{fieldRecovery("holidays")}
    </SectionBlock>
    <SectionBlock style={{ marginTop: 14 }}><SettingRow label={t("dt.timezone")} desc={t("dt.timezoneDesc")}><Toggle on={Boolean(current("timezone"))} onChange={() => toggle("timezone")} ariaLabel={t("dt.timezone")} /></SettingRow>{fieldRecovery("timezone")}</SectionBlock>
    {(hasActualDraft || exportFailed) && <section className="dt-recovery-actions" role="status">
      {hasActualDraft && <><button type="button" onClick={exportDraft}>{lang === "zh" ? "导出日期与时间草稿" : "Export Date & Time draft"}</button><button type="button" onClick={discardAll}>{lang === "zh" ? "放弃全部更改" : "Discard all changes"}</button></>}
      {exportFailed && <p role="alert">{lang === "zh" ? "导出失败，请重试。" : "Export failed. Please retry."}</p>}
    </section>}
    {!hasActualDraft && !hasSourceIssue && saved && <p className="dt-recovery-saved" role="status">{lang === "zh" ? "日期与时间设置已保存。" : "Date & Time settings saved."}</p>}
  </div>;
}

export const dateTimePane: Pane = { id: "date_time", icon: "timer", i18nKey: "settings.date_time", render: (props: PaneRenderProps) => <DateTimePaneContent {...props} /> };
