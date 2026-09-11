/** Settings → More: fifteen independently recoverable preferences. */
import * as React from "react";
import type { Pane, PaneDepartureGuard, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { Toggle, SettingRow, SectionBlock } from "@repo/plugin-web-settings-shell";
import { accountScope, usePrefAutosaveAsync } from "@repo/plugin-web-storage";
import type { AccountScope, PrefAutosaveAsyncResult, WebPrefKey } from "@repo/plugin-web-storage";
import { useI18n } from "@repo/plugin-web-tokens";
import { localI18n } from "../internal/localI18n.js";
import type { WindowType, TaskDefaultDate, TaskDefaultReminderDue, TaskDefaultReminderAll, TaskDefaultPriority, TaskDefaultTagId, TaskDefaultListId, AddTo, OverdueAt } from "../types.js";

type FieldId = "win_type" | "launch_at_login" | "minimize_on_launch" | "date_recognition" | "remove_date_text" | "remove_tags" | "url_parse" | "default_date" | "default_rem_due" | "default_rem_all" | "default_pri" | "default_tag" | "default_list" | "add_to" | "overdue_at";
type FieldValue = WindowType | boolean | TaskDefaultDate | TaskDefaultReminderDue | TaskDefaultReminderAll | TaskDefaultPriority | TaskDefaultTagId | TaskDefaultListId | AddTo | OverdueAt;
type Operation = "set" | "reset";
type Draft = { operation: Operation; value?: FieldValue; scope: AccountScope; session: object; token: object; batch: object | null; settledFailure: boolean; retryActive: boolean };
type Drafts = Record<FieldId, Draft | null>;
type Prefs = Record<FieldId, PrefAutosaveAsyncResult<FieldValue>>;
const fields: readonly FieldId[] = ["win_type", "launch_at_login", "minimize_on_launch", "date_recognition", "remove_date_text", "remove_tags", "url_parse", "default_date", "default_rem_due", "default_rem_all", "default_pri", "default_tag", "default_list", "add_to", "overdue_at"];
const accountFields = new Set<FieldId>(["default_tag", "default_list"]);
const emptyDrafts = (): Drafts => ({ win_type: null, launch_at_login: null, minimize_on_launch: null, date_recognition: null, remove_date_text: null, remove_tags: null, url_parse: null, default_date: null, default_rem_due: null, default_rem_all: null, default_pri: null, default_tag: null, default_list: null, add_to: null, overdue_at: null });
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const oneOf = <T extends string>(value: unknown, values: readonly T[]): value is T => typeof value === "string" && (values as readonly string[]).includes(value);
const isValueFor = (field: FieldId, value: unknown): value is FieldValue => {
  if (["launch_at_login", "minimize_on_launch", "date_recognition", "remove_date_text", "remove_tags", "url_parse"].includes(field)) return isBoolean(value);
  if (field === "win_type") return oneOf(value, ["window", "tray", "full"] as const);
  if (field === "default_date") return oneOf(value, ["none", "today", "tomorrow"] as const);
  if (field === "default_rem_due") return oneOf(value, ["none", "on_time", "5min", "15min"] as const);
  if (field === "default_rem_all") return oneOf(value, ["none", "9am", "day_before"] as const);
  if (field === "default_pri") return oneOf(value, ["none", "low", "med", "high"] as const);
  if (field === "default_tag") return oneOf(value, ["none", "study", "work", "personal"] as const);
  if (field === "default_list") return oneOf(value, ["inbox", "today"] as const);
  return oneOf(value, ["top", "bottom"] as const);
};
const prefKey = (field: FieldId): WebPrefKey => `xai_pref_more_${field}` as WebPrefKey;
const templates = [
  { en: "Daily prep", zh: "每天工作前要做的几件事", enItems: ["Quick recap of yesterday", "Spend time on email", "Review smart list 'Tod…'", "Pick the most important…", "Pick the hardest task…"], zhItems: ["简单回顾昨天的情况", "花点时间处理邮件…", "查看智能清单「今…」", "确定今天最重要的 1…", "确定今天最难的事…"] },
  { en: "Daily journal", zh: "每日记录", enItems: ["What did I finish today?", "What was noteworthy?", "What surprises came up?"], zhItems: ["今天完成了什么？", "今天发生了哪些美好或值得关注的事？", "今天遇到了哪些突发问题？"] },
  { en: "Travel checklist", zh: "旅行必备物品", enItems: ["ID / Passport / Visa…", "Chargers / cables", "Umbrella", "Light backpack", "Clothes: tops / bottoms"], zhItems: ["身份证 / 护照 / 学…", "充电器 / 数据线", "晴雨伞", "易于携带的小背包", "衣物：上衣 / 下装"] },
] as const;

function MorePaneContent({ lang, registerDepartureGuard }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang); const t = localI18n(lang);
  const scope = React.useSyncExternalStore(accountScope.subscribe, accountScope.capture, accountScope.capture);
  const resetScope = React.useRef(scope).current;
  const winType = usePrefAutosaveAsync(prefKey("win_type"), { validate: value => isValueFor("win_type", value) });
  const launch = usePrefAutosaveAsync(prefKey("launch_at_login"), { validate: isBoolean });
  const minimize = usePrefAutosaveAsync(prefKey("minimize_on_launch"), { validate: isBoolean });
  const dateRecognition = usePrefAutosaveAsync(prefKey("date_recognition"), { validate: isBoolean });
  const removeDateText = usePrefAutosaveAsync(prefKey("remove_date_text"), { validate: isBoolean });
  const removeTags = usePrefAutosaveAsync(prefKey("remove_tags"), { validate: isBoolean });
  const urlParse = usePrefAutosaveAsync(prefKey("url_parse"), { validate: isBoolean });
  const defaultDate = usePrefAutosaveAsync(prefKey("default_date"), { validate: value => isValueFor("default_date", value) });
  const defaultRemDue = usePrefAutosaveAsync(prefKey("default_rem_due"), { validate: value => isValueFor("default_rem_due", value) });
  const defaultRemAll = usePrefAutosaveAsync(prefKey("default_rem_all"), { validate: value => isValueFor("default_rem_all", value) });
  const defaultPri = usePrefAutosaveAsync(prefKey("default_pri"), { validate: value => isValueFor("default_pri", value) });
  const defaultTag = usePrefAutosaveAsync(prefKey("default_tag"), { validate: value => isValueFor("default_tag", value) });
  const defaultList = usePrefAutosaveAsync(prefKey("default_list"), { validate: value => isValueFor("default_list", value) });
  const addTo = usePrefAutosaveAsync(prefKey("add_to"), { validate: value => isValueFor("add_to", value) });
  const overdueAt = usePrefAutosaveAsync(prefKey("overdue_at"), { validate: value => isValueFor("overdue_at", value) });
  const prefs = { win_type: winType, launch_at_login: launch, minimize_on_launch: minimize, date_recognition: dateRecognition, remove_date_text: removeDateText, remove_tags: removeTags, url_parse: urlParse, default_date: defaultDate, default_rem_due: defaultRemDue, default_rem_all: defaultRemAll, default_pri: defaultPri, default_tag: defaultTag, default_list: defaultList, add_to: addTo, overdue_at: overdueAt } as unknown as Prefs;
  const prefsRef = React.useRef(prefs); prefsRef.current = prefs;
  const scopeRef = React.useRef(scope); scopeRef.current = scope;
  const epochRef = React.useRef(scope.epoch), decisionTokenRef = React.useRef<object>({}), sessionRef = React.useRef<object>({}), resetBatchRef = React.useRef<object | null>(null), draftsRef = React.useRef<Drafts>(emptyDrafts());
  const [draftVersion, setDraftVersion] = React.useState(0), [inputErrors, setInputErrors] = React.useState<Partial<Record<FieldId, true>>>({}), [exportFailed, setExportFailed] = React.useState(false), [saved, setSaved] = React.useState(false), [defaultsRestoredScope, setDefaultsRestoredScope] = React.useState<AccountScope | null>(null), [resetFailed, setResetFailed] = React.useState(false);
  if (epochRef.current !== scope.epoch) { epochRef.current = scope.epoch; decisionTokenRef.current = {}; resetBatchRef.current = null; }
  React.useEffect(() => () => { decisionTokenRef.current = {}; draftsRef.current = emptyDrafts(); }, []);
  const changed = React.useCallback(() => setDraftVersion(version => version + 1), []);
  const currentScope = React.useCallback(() => accountScope.capture() === scopeRef.current && epochRef.current === scopeRef.current.epoch, []);
  const isCurrentDraft = React.useCallback((field: FieldId, draft: Draft | null) => Boolean(draft && currentScope() && draft.session === sessionRef.current && (draft.operation === "reset" || isValueFor(field, draft.value)) && (!accountFields.has(field) || draft.scope === accountScope.capture())), [currentScope]);
  const hasCurrentDraft = React.useCallback(() => fields.some(field => isCurrentDraft(field, draftsRef.current[field])), [isCurrentDraft]);
  const clearInputError = React.useCallback((field: FieldId) => setInputErrors(errors => { if (!errors[field]) return errors; const next = { ...errors }; delete next[field]; return next; }), []);
  const putDraft = React.useCallback((field: FieldId, operation: Operation, value?: FieldValue, batch: object | null = null) => {
    if (operation === "set") resetBatchRef.current = null;
    const draft: Draft = { operation, value, scope: accountScope.capture(), session: sessionRef.current, token: {}, batch, settledFailure: false, retryActive: false };
    draftsRef.current[field] = draft; clearInputError(field); setExportFailed(false); setSaved(false); setDefaultsRestoredScope(null); changed(); return draft;
  }, [changed, clearInputError]);
  const settle = React.useCallback((field: FieldId, draft: Draft, ok: boolean) => {
    if (draftsRef.current[field] !== draft) return;
    if (!ok) { draft.retryActive = false; draft.settledFailure = true; changed(); return; }
    draftsRef.current[field] = null;
    const noWorkLeft = fields.every(id => !isCurrentDraft(id, draftsRef.current[id]));
    if (noWorkLeft && draft.operation === "reset" && draft.batch !== null && resetBatchRef.current === draft.batch) { setDefaultsRestoredScope(draft.scope); resetBatchRef.current = null; } else setSaved(true);
    changed();
  }, [changed, isCurrentDraft]);
  const settlePredecessor = React.useCallback((field: FieldId, draft: Draft, ok: boolean) => { if (ok || draftsRef.current[field] !== draft) return; draft.retryActive = false; changed(); }, [changed]);
  const submit = React.useCallback((field: FieldId, draft: Draft) => {
    const request = draft.operation === "reset" ? prefsRef.current[field].reset() : prefsRef.current[field].edit(draft.value!);
    void request.then(result => settle(field, draft, result.ok), () => settle(field, draft, false));
  }, [settle]);
  const edit = React.useCallback((field: FieldId, value: unknown) => {
    if (!currentScope() || (accountFields.has(field) && scopeRef.current.kind === "locked")) return;
    if (!isValueFor(field, value)) { setInputErrors(errors => ({ ...errors, [field]: true })); return; }
    const draft = putDraft(field, "set", value); submit(field, draft);
  }, [currentScope, putDraft, submit]);
  const retry = React.useCallback((field: FieldId) => {
    const draft = draftsRef.current[field]; if (!isCurrentDraft(field, draft) || draft!.retryActive) return;
    const ownFailure = draft!.settledFailure;
    const failedPredecessor = !ownFailure && (prefsRef.current[field].meta.status === "error" || prefsRef.current[field].meta.status === "conflict");
    if (!ownFailure && !failedPredecessor) return;
    draft!.retryActive = true; if (ownFailure) draft!.settledFailure = false; changed();
    const attempt = prefsRef.current[field].retry();
    if (ownFailure) void attempt.then(result => settle(field, draft!, result.ok), () => settle(field, draft!, false));
    else void attempt.then(result => settlePredecessor(field, draft!, result.ok), () => settlePredecessor(field, draft!, false));
  }, [changed, isCurrentDraft, settle, settlePredecessor]);
  const discard = React.useCallback((field: FieldId) => { const draft = draftsRef.current[field]; if (draft && !isCurrentDraft(field, draft)) return; if (draft) { if (draft.batch !== null) resetBatchRef.current = null; draftsRef.current[field] = null; changed(); } clearInputError(field); prefsRef.current[field].meta.reload(); }, [changed, clearInputError, isCurrentDraft]);
  const discardAll = React.useCallback(() => { for (const field of fields) if (isCurrentDraft(field, draftsRef.current[field])) discard(field); }, [discard, isCurrentDraft]);
  const reloadSource = React.useCallback((field: FieldId) => { if (!isCurrentDraft(field, draftsRef.current[field])) { clearInputError(field); prefsRef.current[field].meta.reload(); } }, [clearInputError, isCurrentDraft]);
  const resetAll = React.useCallback(() => {
    if (accountScope.capture() !== resetScope || resetScope.kind === "locked" || !resetScope.accountId || !resetScope.generation) { setResetFailed(true); return; }
    if (resetBatchRef.current !== null && fields.some(field => { const draft = draftsRef.current[field]; return isCurrentDraft(field, draft) && draft?.batch === resetBatchRef.current; })) return;
    setResetFailed(false); setDefaultsRestoredScope(null); const batch = {}; resetBatchRef.current = batch;
    const admitted = fields.map(field => [field, putDraft(field, "reset", undefined, batch)] as const);
    for (const [field, draft] of admitted) submit(field, draft);
  }, [isCurrentDraft, putDraft, resetScope, submit]);
  const exportDraft = React.useCallback(() => {
    const token = decisionTokenRef.current; if (!currentScope() || !hasCurrentDraft()) return;
    const changes: { device: Record<string, unknown>; account: Record<string, unknown> } = { device: {}, account: {} };
    for (const field of fields) { const draft = draftsRef.current[field]; if (!isCurrentDraft(field, draft) || !draft) continue; const change = draft.operation === "reset" ? { operation: "reset" } : { operation: "set", value: draft.value }; changes[accountFields.has(field) ? "account" : "device"][field] = change; }
    if (!Object.keys(changes.device).length && !Object.keys(changes.account).length) return;
    const stillCurrent = () => currentScope() && decisionTokenRef.current === token && hasCurrentDraft(); let anchor: HTMLAnchorElement | null = null, url: string | null = null;
    try { if (!stillCurrent()) return; url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, kind: "more-draft", changes: { ...(Object.keys(changes.device).length ? { device: changes.device } : {}), ...(Object.keys(changes.account).length ? { account: changes.account } : {}) } })], { type: "application/json" })); if (!stillCurrent()) return; anchor = document.createElement("a"); anchor.href = url; anchor.download = "more-draft.json"; anchor.style.display = "none"; document.body.appendChild(anchor); if (!stillCurrent()) return; anchor.click(); if (stillCurrent()) setExportFailed(false); }
    catch { if (stillCurrent()) setExportFailed(true); }
    finally { try { anchor?.remove(); } catch { /* recovery remains */ } try { if (url) URL.revokeObjectURL(url); } catch { /* recovery remains */ } }
  }, [currentScope, hasCurrentDraft, isCurrentDraft]);
  const guardToken = decisionTokenRef.current;
  React.useEffect(() => { if (!registerDepartureGuard) return undefined; const capturedScope = scope; const isCurrent = () => decisionTokenRef.current === guardToken && currentScope() && accountScope.capture() === capturedScope; const guard: PaneDepartureGuard = { token: guardToken, label: lang === "zh" ? "更多" : "More", isCurrent, isBlocking: () => isCurrent() && hasCurrentDraft(), exportDraft: () => { if (isCurrent()) exportDraft(); }, discardDraft: () => { if (isCurrent()) discardAll(); } }; return registerDepartureGuard(guard); }, [currentScope, discardAll, draftVersion, exportDraft, guardToken, hasCurrentDraft, lang, registerDepartureGuard, scope]);
  const hasActualDraft = hasCurrentDraft();
  const hasSourceIssue = fields.some(field => prefs[field].meta.source === "invalid" || prefs[field].meta.source === "unavailable" || prefs[field].meta.status === "error");
  React.useEffect(() => { if (!hasActualDraft) return; const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [hasActualDraft]);
  const current = (field: FieldId): FieldValue => { const draft = draftsRef.current[field]; return isCurrentDraft(field, draft) && draft?.operation === "set" ? draft.value! : prefs[field].value; };
  const toggle = (field: FieldId) => edit(field, current(field) !== true);
  const labelFor = (field: FieldId): string => ({ win_type: t("more.windowType"), launch_at_login: t("more.launchAtLogin"), minimize_on_launch: t("more.minimizeOnLaunch"), date_recognition: t("more.dateRecog"), remove_date_text: t("more.removeText"), remove_tags: t("more.removeTags"), url_parse: t("more.urlParse"), default_date: t("more.defaultDate"), default_rem_due: t("more.defaultRemDue"), default_rem_all: t("more.defaultRemAll"), default_pri: t("more.defaultPri"), default_tag: t("more.defaultTag"), default_list: t("more.defaultList"), add_to: t("more.defaultAddTo"), overdue_at: t("more.overdueAt") })[field];
  const recovery = (field: FieldId) => { const pref = prefs[field], draft = draftsRef.current[field], active = isCurrentDraft(field, draft), sourceOnly = pref.meta.source === "invalid" || pref.meta.source === "unavailable", inputError = inputErrors[field]; if (!active && !sourceOnly && !inputError) return null; const label = labelFor(field); const message = inputError ? (lang === "zh" ? `${label}格式无效。` : `${label} has an invalid value.`) : active ? pref.meta.status === "pending" ? (lang === "zh" ? `${label}正在保存。` : `${label} is saving.`) : draft?.operation === "reset" ? (lang === "zh" ? `${label}恢复默认值未完成。` : `${label} reset to default was not completed.`) : (lang === "zh" ? `${label}未保存。` : `${label} was not saved.`) : (lang === "zh" ? `已保存的${label}不可用。请重新读取；这不是新的未保存更改。` : `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`); return <div className="more-recovery-field" role="alert" key={field}><span>{message}</span>{active && <><button type="button" onClick={() => retry(field)} aria-label={`${lang === "zh" ? "重试" : "Retry"} ${label}`}>{lang === "zh" ? "重试" : "Retry"}</button><button type="button" onClick={() => discard(field)} aria-label={`${lang === "zh" ? "放弃" : "Discard"} ${label}`}>{lang === "zh" ? "放弃" : "Discard"}</button></>}{!active && sourceOnly && <button type="button" onClick={() => reloadSource(field)} aria-label={`${lang === "zh" ? "重新读取" : "Reload"} ${label}`}>{lang === "zh" ? "重新读取" : "Reload"}</button>}</div>; };
  const checkbox = (field: "remove_date_text" | "remove_tags") => <button type="button" className="check-inline" aria-label={labelFor(field)} aria-pressed={Boolean(current(field))} onClick={() => toggle(field)}><span className={`cbx${current(field) ? " checked" : ""}`} aria-hidden="true" />{field === "remove_tags" && <span>{t("more.removeTags")}</span>}</button>;
  return <div className="more-pane">
    {resetFailed && <p role="alert">{lang === "zh" ? "账户已更改，请重新打开设置后重试。" : "Account changed. Reopen settings and retry."}</p>}
    <SectionBlock><SettingRow label={t("more.language")}><select className="sl-select" value="follow" onChange={() => {}} aria-label={t("more.language")}><option value="follow">{t("more.followSystem")}</option></select></SettingRow></SectionBlock>
    <SectionBlock style={{ marginTop: 14 }}><SettingRow label={t("more.windowType")}><select className="sl-select" value={current("win_type") as WindowType} onChange={event => edit("win_type", event.target.value)} aria-label={t("more.windowType")}><option value="window">{t("more.winWindow")}</option><option value="tray">{t("more.winTray")}</option><option value="full">{t("more.winFull")}</option></select></SettingRow>{recovery("win_type")}<SettingRow label={t("more.launchAtLogin")}><Toggle on={Boolean(current("launch_at_login"))} onChange={() => toggle("launch_at_login")} ariaLabel={t("more.launchAtLogin")} /></SettingRow>{recovery("launch_at_login")}<SettingRow label={t("more.minimizeOnLaunch")}><Toggle on={Boolean(current("minimize_on_launch"))} onChange={() => toggle("minimize_on_launch")} ariaLabel={t("more.minimizeOnLaunch")} /></SettingRow>{recovery("minimize_on_launch")}</SectionBlock>
    <h4 className="pane-h-block">{t("more.smartRecog")}</h4><SectionBlock><SettingRow label={t("more.dateRecog")} desc={t("more.dateRecogDesc")}><Toggle on={Boolean(current("date_recognition"))} onChange={() => toggle("date_recognition")} ariaLabel={t("more.dateRecog")} /></SettingRow>{recovery("date_recognition")}<SettingRow label={t("more.removeText")}>{checkbox("remove_date_text")}</SettingRow>{recovery("remove_date_text")}<SettingRow label={t("more.tagRecog")} desc={t("more.tagRecogDesc")}>{checkbox("remove_tags")}</SettingRow>{recovery("remove_tags")}<SettingRow label={t("more.urlParse")} desc={t("more.urlParseDesc")}><Toggle on={Boolean(current("url_parse"))} onChange={() => toggle("url_parse")} ariaLabel={t("more.urlParse")} /></SettingRow>{recovery("url_parse")}</SectionBlock>
    <h4 className="pane-h-block">{t("more.taskDefault")}</h4><SectionBlock><SettingRow label={t("more.defaultDate")}><select className="sl-select" value={current("default_date") as TaskDefaultDate} onChange={event => edit("default_date", event.target.value)} aria-label={t("more.defaultDate")}><option value="none">{t("more.dateNone")}</option><option value="today">{t("more.dateToday")}</option><option value="tomorrow">{t("more.dateTomorrow")}</option></select></SettingRow>{recovery("default_date")}<SettingRow label={t("more.defaultRemDue")}><select className="sl-select" value={current("default_rem_due") as TaskDefaultReminderDue} onChange={event => edit("default_rem_due", event.target.value)} aria-label={t("more.defaultRemDue")}><option value="none">{t("more.remNone")}</option><option value="on_time">{t("more.remOnTime")}</option><option value="5min">{t("more.rem5min")}</option><option value="15min">{t("more.rem15min")}</option></select></SettingRow>{recovery("default_rem_due")}<SettingRow label={t("more.defaultRemAll")}><select className="sl-select" value={current("default_rem_all") as TaskDefaultReminderAll} onChange={event => edit("default_rem_all", event.target.value)} aria-label={t("more.defaultRemAll")}><option value="none">{t("more.remNone")}</option><option value="9am">{t("more.rem9am")}</option><option value="day_before">{t("more.remDayBefore")}</option></select></SettingRow>{recovery("default_rem_all")}</SectionBlock>
    <SectionBlock style={{ marginTop: 14 }}><SettingRow label={t("more.defaultPri")}><select className="sl-select" value={current("default_pri") as TaskDefaultPriority} onChange={event => edit("default_pri", event.target.value)} aria-label={t("more.defaultPri")}><option value="none">{t("more.priNone")}</option><option value="low">{t("more.priLow")}</option><option value="med">{t("more.priMed")}</option><option value="high">{t("more.priHigh")}</option></select></SettingRow>{recovery("default_pri")}<SettingRow label={t("more.defaultTag")}><select className="sl-select" value={current("default_tag") as TaskDefaultTagId} onChange={event => edit("default_tag", event.target.value)} aria-label={t("more.defaultTag")}><option value="none">{t("more.tagNone")}</option><option value="study">{t("more.tagStudy")}</option><option value="work">{t("more.tagWork")}</option><option value="personal">{t("more.tagPersonal")}</option></select></SettingRow>{recovery("default_tag")}<SettingRow label={t("more.defaultList")}><select className="sl-select" value={current("default_list") as TaskDefaultListId} onChange={event => edit("default_list", event.target.value)} aria-label={t("more.defaultList")}><option value="inbox">{t("more.listInbox")}</option><option value="today">{t("more.listToday")}</option></select></SettingRow>{recovery("default_list")}</SectionBlock>
    <SectionBlock style={{ marginTop: 14 }}><SettingRow label={t("more.defaultAddTo")}><select className="sl-select" value={current("add_to") as AddTo} onChange={event => edit("add_to", event.target.value)} aria-label={t("more.defaultAddTo")}><option value="top">{t("more.addTop")}</option><option value="bottom">{t("more.addBottom")}</option></select></SettingRow>{recovery("add_to")}<SettingRow label={t("more.overdueAt")}><select className="sl-select" value={current("overdue_at") as OverdueAt} onChange={event => edit("overdue_at", event.target.value)} aria-label={t("more.overdueAt")}><option value="top">{t("more.overdueTop")}</option><option value="bottom">{t("more.overdueBottom")}</option></select></SettingRow>{recovery("overdue_at")}</SectionBlock>
    <button type="button" className="reset-link" onClick={resetAll} data-testid="more-reset-default">{t("more.resetDefault")}</button>
    {(hasActualDraft || exportFailed) && <section className="more-recovery-actions" role="status">{hasActualDraft && <><button type="button" onClick={exportDraft}>{lang === "zh" ? "导出更多草稿" : "Export More draft"}</button><button type="button" onClick={discardAll}>{lang === "zh" ? "放弃全部更改" : "Discard all changes"}</button></>}{exportFailed && <p role="alert">{lang === "zh" ? "导出失败，请重试。" : "Export failed. Please retry."}</p>}</section>}
    {!hasActualDraft && !hasSourceIssue && Object.keys(inputErrors).length === 0 && defaultsRestoredScope === scope && <p className="more-recovery-saved" role="status">{lang === "zh" ? "更多设置已恢复默认值。" : "More settings restored to defaults."}</p>}
    {!hasActualDraft && !hasSourceIssue && Object.keys(inputErrors).length === 0 && defaultsRestoredScope !== scope && saved && <p className="more-recovery-saved" role="status">{lang === "zh" ? "更多设置已保存。" : "More settings saved."}</p>}
    <h4 className="pane-h-block">{t("more.taskTemplate")}</h4><div className="template-grid">{templates.map(template => <div className="template-card" key={template.en}><h5>{lang === "zh" ? template.zh : template.en}</h5><ul>{(lang === "zh" ? template.zhItems : template.enItems).map(item => <li key={item}><span className="cbx" aria-hidden="true" /><span>{item}</span></li>)}</ul></div>)}</div>
    {s("settings.more") && null}
  </div>;
}

export const morePane: Pane = { id: "more", icon: "help", i18nKey: "settings.more", render: (props: PaneRenderProps) => <MorePaneContent {...props} /> };
