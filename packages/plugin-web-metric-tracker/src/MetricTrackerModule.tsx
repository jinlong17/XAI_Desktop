import { useLocalDayClock } from "@repo/plugin-web-tokens";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Icon } from "./internal/icons.js";
import { MetricLineChart, MiniShareLine } from "./internal/charts.js";
import { formatDateTimeParts, formatWeekRange, rangeWindow, toDateInputValue, toTimeInputValue } from "./internal/date.js";
import {
  bmiFor,
  bmiStatus,
  chartPoints,
  computeWeightStats,
  filterRecordsByRange,
  formatWeight,
  kgToUnit,
  sortRecords,
  stageComparison,
  weightToKg,
} from "./internal/metrics.js";
import { createWeightRecordId, deleteWeightRecord, updateWeightProfile, upsertWeightRecord, useMetricTrackerState } from "./internal/storage.js";
import type { Lang, RangeId, WeightProfile, WeightRecord, WeightUnit } from "./types.js";

export interface MetricTrackerModuleProps {
  readonly lang: Lang;
}

type DateMode = "today" | "yesterday" | "custom";
type SortDirection = "desc" | "asc";

interface RecordDraft {
  readonly id: string | null;
  readonly createdAt?: string;
  readonly originalMeasuredAt?: string;
  readonly originalDate?: string;
  readonly originalTime?: string;
  readonly weight: string;
  readonly unit: WeightUnit;
  readonly dateMode: DateMode;
  readonly date: string;
  readonly time: string;
  readonly note: string;
}

const RANGE_OPTIONS: readonly { id: RangeId; zh: string; en: string }[] = [
  { id: "7d", zh: "最近 7 天", en: "7 days" },
  { id: "30d", zh: "最近 30 天", en: "30 days" },
  { id: "lastMonth", zh: "上个月", en: "Last month" },
  { id: "3m", zh: "近三个月", en: "3 months" },
  { id: "year", zh: "今年", en: "This year" },
  { id: "all", zh: "全部时间", en: "All time" },
  { id: "custom", zh: "自定义", en: "Custom" },
];

const PREVIEW_RANGE_OPTIONS: readonly { id: RangeId; zh: string; en: string }[] = [
  { id: "30d", zh: "最近 30 天", en: "30 days" },
  { id: "lastMonth", zh: "上个月", en: "Last month" },
  { id: "3m", zh: "近三个月", en: "3 months" },
  { id: "year", zh: "今年", en: "This year" },
  { id: "all", zh: "全部", en: "All" },
  { id: "custom", zh: "自定义", en: "Custom" },
];

const METRIC_TABS = [
  { id: "weight", icon: "target", zh: "体重", en: "Weight", active: true },
  { id: "sleep", icon: "moon", zh: "睡眠", en: "Sleep", active: false },
  { id: "water", icon: "droplet", zh: "饮水", en: "Water", active: false },
  { id: "exercise", icon: "activity", zh: "运动", en: "Exercise", active: false },
  { id: "custom", icon: "plus", zh: "自定义", en: "Custom", active: false },
] as const;

function t(lang: Lang, zh: string, en: string): string {
  return lang === "zh" ? zh : en;
}

function makeInitialDraft(unit: WeightUnit): RecordDraft {
  const now = new Date();
  return {
    id: null,
    weight: unit === "kg" ? "72.3" : "144.6",
    unit,
    dateMode: "today",
    date: toDateInputValue(now),
    time: toTimeInputValue(now),
    note: "",
  };
}

function draftFromRecord(record: WeightRecord): RecordDraft {
  const measured = new Date(record.measuredAt);
  return {
    id: record.id,
    createdAt: record.createdAt,
    originalMeasuredAt: record.measuredAt,
    originalDate: toDateInputValue(measured),
    originalTime: toTimeInputValue(measured),
    weight: String(record.value),
    unit: record.unit,
    dateMode: "custom",
    date: toDateInputValue(measured),
    time: toTimeInputValue(measured),
    note: record.note,
  };
}

function measuredAtFromDraft(draft: RecordDraft): string | null {
  const date = draft.dateMode === "custom" ? draft.date : dateForMode(draft.dateMode);
  // A minute-resolution civil input cannot round-trip seconds or a DST fold.
  // Preserve the original instant until the user actually changes date/time.
  if (draft.originalMeasuredAt && date === draft.originalDate && draft.time === draft.originalTime) {
    return draft.originalMeasuredAt;
  }
  const instant = new Date(`${date}T${draft.time || "08:00"}:00.000`);
  return Number.isFinite(instant.getTime()) ? instant.toISOString() : null;
}

function dateForMode(mode: DateMode): string {
  const next = new Date();
  if (mode === "yesterday") next.setDate(next.getDate() - 1);
  return toDateInputValue(next);
}

function isValidPositiveNumber(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

export function MetricTrackerModule({ lang }: MetricTrackerModuleProps) {
  const [state, setState, recovery] = useMetricTrackerState();
  const [recoveryExportFailed, setRecoveryExportFailed] = useState(false);
  const [range, setRange] = useState<RangeId>("30d");
  const [previewRange, setPreviewRange] = useState<RangeId>("30d");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [previewCustomStart, setPreviewCustomStart] = useState("");
  const [previewCustomEnd, setPreviewCustomEnd] = useState("");
  const [entryOpen, setEntryOpen] = useState(false);
  const [draft, setDraft] = useState<RecordDraft>(() => makeInitialDraft(state.profile.preferredUnit));
  const [profileDraft, setProfileDraft] = useState(() => ({
    heightCm: String(state.profile.heightCm),
    targetWeightKg: String(state.profile.targetWeightKg),
    preferredUnit: state.profile.preferredUnit,
  }));

  const { now } = useLocalDayClock();
  const activeRange = useMemo(() => rangeWindow(range, now, customStart, customEnd), [range, now, customStart, customEnd]);
  const previewWindow = useMemo(() => rangeWindow(previewRange, now, previewCustomStart, previewCustomEnd), [previewRange, now, previewCustomStart, previewCustomEnd]);
  const rangeRecords = useMemo(() => filterRecordsByRange(state.records, activeRange), [state.records, activeRange]);
  const previewRecords = useMemo(() => filterRecordsByRange(state.records, previewWindow), [state.records, previewWindow]);
  const sortedRecords = useMemo(() => sortRecords(rangeRecords, sortDirection), [rangeRecords, sortDirection]);
  const stats = useMemo(() => computeWeightStats(rangeRecords, state.profile), [rangeRecords, state.profile]);
  const previewStats = useMemo(() => computeWeightStats(previewRecords, state.profile), [previewRecords, state.profile]);
  const previewPoints = useMemo(() => chartPoints(previewRecords, state.profile, lang), [previewRecords, state.profile, lang]);
  const previewComparison = useMemo(() => stageComparison(previewRecords), [previewRecords]);
  const groupedRecords = useMemo(() => groupRecords(sortedRecords, lang), [sortedRecords, lang]);
  const currentWeightKg = stats.current ? weightToKg(stats.current.value, stats.current.unit) : null;
  const previewCurrentWeightKg = previewStats.current ? weightToKg(previewStats.current.value, previewStats.current.unit) : null;
  const bmiStatusResult = bmiStatus(stats.bmiCurrent, lang);
  const previewBmiStatusResult = bmiStatus(previewStats.bmiCurrent, lang);
  const progress = currentWeightKg === null ? 0 : goalProgress(currentWeightKg, state.profile.targetWeightKg);
  const trendLabel = stats.trendKg === null ? "—" : `${stats.trendKg <= 0 ? "↓" : "↑"} ${Math.abs(stats.trendKg).toFixed(1)} kg`;
  const previewTrendLabel = previewStats.trendKg === null ? "—" : `${previewStats.trendKg <= 0 ? "↓" : "↑"} ${Math.abs(previewStats.trendKg).toFixed(1)} kg`;
  const previewRangeLabel = rangeLabel(previewRange, lang, PREVIEW_RANGE_OPTIONS);

  function handleDateMode(nextMode: DateMode): void {
    setDraft((prev) => ({
      ...prev,
      dateMode: nextMode,
      date: nextMode === "custom" ? prev.date : dateForMode(nextMode),
    }));
  }

  function resetDraft(): void {
    setDraft(makeInitialDraft(state.profile.preferredUnit));
  }

  function openNewDraft(): void {
    resetDraft();
    setEntryOpen(true);
  }

  function openRecordDraft(record: WeightRecord): void {
    setDraft(draftFromRecord(record));
    setEntryOpen(true);
  }

  function closeEntry(): void {
    setEntryOpen(false);
    resetDraft();
  }

  function saveRecord(event?: FormEvent<HTMLFormElement>): void {
    event?.preventDefault();
    if (!isValidPositiveNumber(draft.weight)) return;
    const measuredAt = measuredAtFromDraft(draft);
    if (!measuredAt) return;
    const nowIso = new Date().toISOString();
    const saved = setState((prev) => upsertWeightRecord(prev, {
      id: draft.id ?? createWeightRecordId(),
      metricId: "weight",
      value: Number(draft.weight),
      unit: draft.unit,
      measuredAt,
      note: draft.note.trim(),
      createdAt: draft.createdAt,
    }, nowIso));
    if (saved) { resetDraft(); setEntryOpen(false); }
  }

  function saveProfile(): void {
    const next: WeightProfile = {
      heightCm: Number(profileDraft.heightCm) || state.profile.heightCm,
      targetWeightKg: Number(profileDraft.targetWeightKg) || state.profile.targetWeightKg,
      preferredUnit: profileDraft.preferredUnit,
    };
    setState((prev) => updateWeightProfile(prev, next));
  }

  function exportPending(): void {
    let url: string | undefined;
    try {
      const snapshot = recovery.snapshot(); // Refuses exports from a stale account.
      url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, kind: "metric-unsaved-draft", snapshot, recordDraft: entryOpen ? draft : null, profileDraft }, null, 2)], { type: "application/json" }));
      const link = document.createElement("a"); link.href = url; link.download = "xai-metric-unsaved-draft.json";
      document.body.append(link); try { link.click(); } finally { link.remove(); }
      setRecoveryExportFailed(false);
    } catch { setRecoveryExportFailed(true); }
    finally { if (url) { const completed = url; setTimeout(() => URL.revokeObjectURL(completed), 1000); } }
  }
  const saveFailure = recovery.failure ? <section className="mt-save-failure" role="alert">
    <p>{recovery.failure === "account" ? t(lang, "账户已更改，请重新打开此页面。", "Account changed. Reopen this page.") : recovery.failure === "conflict" ? t(lang, "已有更新的数据，未覆盖。请导出草稿后重新打开页面。", "Newer data exists and was not overwritten. Export your draft, then reopen this page.") : t(lang, "保存未完成，草稿仍保留在此页面。请检查浏览器存储权限或空间后重试。", "Saving failed. Your draft remains on this page. Check browser storage access or space, then retry.")}</p>
    <p>{t(lang, "草稿文件包含现有指标记录及未保存修改，仅用于保留内容，暂不支持直接导入。", "The draft file includes existing metric records and unsaved edits. It preserves your content; direct import is not supported.")}</p>
    <button type="button" onClick={() => { if (entryOpen) saveRecord(); else recovery.retry(); }}>{t(lang, "重试保存", "Retry save")}</button>
    <button type="button" onClick={exportPending}>{t(lang, "导出未保存草稿", "Export unsaved draft")}</button>
    <button type="button" onClick={() => { recovery.discard(); setRecoveryExportFailed(false); }}>{t(lang, "放弃待保存快照", "Discard pending snapshot")}</button>
    {recoveryExportFailed && <p>{t(lang, "无法导出，请确认仍在原账户。", "Could not export. Check that the original account is still active.")}</p>}
  </section> : null;

  function downloadShareCard(): void {
    const url = createShareCardDataUrl({
      currentWeight: previewCurrentWeightKg,
      bmi: previewStats.bmiCurrent,
      trendKg: previewStats.trendKg,
      targetWeight: state.profile.targetWeightKg,
      rangeLabel: previewRangeLabel,
    });
    const link = document.createElement("a");
    link.href = url;
    link.download = "xai-weight-summary.png";
    link.click();
  }

  async function shareCard(): Promise<void> {
    const title = t(lang, "我的体重记录", "My weight record");
    const text = previewCurrentWeightKg === null
      ? t(lang, "我在 XAI 指标追踪记录体重。", "I track weight in XAI Metric Tracker.")
      : `${title}: ${previewCurrentWeightKg.toFixed(1)}kg · BMI ${previewStats.bmiCurrent?.toFixed(1) ?? "—"}`;
    if (navigator.share) {
      await navigator.share({ title, text }).catch(() => undefined);
      return;
    }
    downloadShareCard();
  }

  return (
    <div className="module module-metrics">
      {!entryOpen && saveFailure}
      <header className="mt-top">
        <div>
          <h1 className="mt-title"><Icon name="target" size={20} />{t(lang, "指标追踪", "Metric Tracker")}</h1>
          <p className="mt-subtitle">{t(lang, "记录长期关注的数字指标。第一版聚焦体重、BMI、目标进度和分享图片。", "Track long-term numeric metrics. V1 focuses on weight, BMI, goals, and share cards.")}</p>
        </div>
        <button className="mt-primary" type="button" onClick={openNewDraft}>
          <Icon name="plus" />{t(lang, "记一下", "Log")}
        </button>
      </header>

      <div className="mt-tabs" role="tablist" aria-label={t(lang, "指标类型", "Metric type")}>
        {METRIC_TABS.map((tab) => (
          <button key={tab.id} type="button" aria-selected={tab.active} disabled={!tab.active}>
            <Icon name={tab.icon} />{t(lang, tab.zh, tab.en)}
            {!tab.active ? <span>{t(lang, "计划中", "Planned")}</span> : null}
          </button>
        ))}
      </div>

      <section className="mt-grid">
        <aside className="mt-panel mt-goal">
          <div className="mt-panel-head">
            <h2>{t(lang, "目标进度", "Goal progress")}</h2>
          </div>
          <div className="mt-current">
            <div>
              <span>{t(lang, "当前体重", "Current")}</span>
              <strong>{currentWeightKg === null ? "—" : formatWeight(currentWeightKg, state.profile.preferredUnit)}<small>{state.profile.preferredUnit === "kg" ? "kg" : "斤"}</small></strong>
              <em className={stats.trendKg !== null && stats.trendKg <= 0 ? "good" : "warn"}>{trendLabel} {t(lang, "较起始", "from start")}</em>
            </div>
            <div>
              <span>{t(lang, "目标体重", "Target")}</span>
              <strong>{formatWeight(state.profile.targetWeightKg, state.profile.preferredUnit)}<small>{state.profile.preferredUnit === "kg" ? "kg" : "斤"}</small></strong>
              <button type="button" onClick={saveProfile} aria-label={t(lang, "保存目标设置", "Save goal settings")}><Icon name="edit" /></button>
            </div>
          </div>
          <div className="mt-progress">
            <div className="mt-progress-label">
              <span>{t(lang, "还需减重", "Remaining")}</span>
              <strong>{stats.distanceToGoalKg === null ? "—" : `${Math.abs(stats.distanceToGoalKg).toFixed(1)} kg`}</strong>
            </div>
            <div className="mt-progress-track"><span style={{ width: `${progress}%` }} /></div>
            <div className="mt-progress-scale">
              <span>{stats.highest ? weightToKg(stats.highest.value, stats.highest.unit).toFixed(1) : "—"}</span>
              <span>{currentWeightKg?.toFixed(1) ?? "—"}</span>
              <span>{state.profile.targetWeightKg.toFixed(1)}</span>
            </div>
          </div>
          <div className={`mt-health ${bmiStatusResult.tone}`}>
            <Icon name="heart" />
            <div>
              <strong>{t(lang, "健康参考", "Health reference")}</strong>
              <span>BMI {stats.bmiCurrent?.toFixed(1) ?? "—"} · {bmiStatusResult.label}</span>
              <small>{t(lang, "建议范围：18.5 - 23.9", "Reference range: 18.5 - 23.9")}</small>
            </div>
          </div>
          <div className="mt-profile">
            <label>
              <span>{t(lang, "身高", "Height")}</span>
              <input value={profileDraft.heightCm} onChange={(event) => setProfileDraft((prev) => ({ ...prev, heightCm: event.target.value }))} inputMode="decimal" />
              <em>cm</em>
            </label>
            <label>
              <span>{t(lang, "目标", "Target")}</span>
              <input value={profileDraft.targetWeightKg} onChange={(event) => setProfileDraft((prev) => ({ ...prev, targetWeightKg: event.target.value }))} inputMode="decimal" />
              <em>kg</em>
            </label>
            <div className="mt-unit-toggle" role="group" aria-label={t(lang, "常用单位", "Preferred unit")}>
              {(["kg", "jin"] as const).map((unit) => (
                <button key={unit} type="button" aria-pressed={profileDraft.preferredUnit === unit} onClick={() => setProfileDraft((prev) => ({ ...prev, preferredUnit: unit }))}>
                  {unit === "kg" ? "kg" : "斤"}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="mt-panel mt-log">
          <div className="mt-panel-head">
            <h2>{t(lang, "体重记录", "Weight log")}</h2>
            <div className="mt-head-actions">
              <button type="button" onClick={() => setSortDirection((prev) => prev === "desc" ? "asc" : "desc")}>
                {sortDirection === "desc" ? t(lang, "新到旧", "Newest") : t(lang, "旧到新", "Oldest")}
              </button>
            </div>
          </div>
          <RangeSelector lang={lang} value={range} options={RANGE_OPTIONS} ariaLabel={t(lang, "记录时间范围", "Record range")} onChange={setRange} />
          {range === "custom" ? (
            <div className="mt-custom-range">
              <input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
              <input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
            </div>
          ) : null}
          <div className="mt-record-groups">
            {groupedRecords.length === 0 ? (
              <div className="mt-empty">{t(lang, "这个范围内还没有记录。", "No records in this range yet.")}</div>
            ) : groupedRecords.map((group) => (
              <section key={group.label} className="mt-record-group">
                <div className="mt-week-head">
                  <strong>{group.label}</strong>
                  <span>{t(lang, "平均", "Avg")} {group.averageKg.toFixed(1)} kg</span>
                </div>
                {group.records.map((record) => {
                  const parts = formatDateTimeParts(record.measuredAt, lang);
                  const recordBmi = bmiFor(weightToKg(record.value, record.unit), state.profile.heightCm);
                  return (
                    <div className="mt-record-row" key={record.id}>
                      <div className="mt-record-date"><strong>{parts.date}</strong><span>{parts.weekday}</span></div>
                      <span className="mt-record-time">{parts.time}</span>
                      <strong className="mt-record-weight">{record.value.toFixed(1)} <small>{record.unit === "kg" ? "kg" : "斤"}</small></strong>
                      <span className="mt-record-bmi">BMI {recordBmi?.toFixed(1) ?? "—"}</span>
                      <span className="mt-record-note">{record.note || t(lang, "未填写备注", "No note")}</span>
                      <div className="mt-row-actions">
                        <button type="button" aria-label={t(lang, "编辑记录", "Edit record")} onClick={() => openRecordDraft(record)}><Icon name="edit" /></button>
                        <button type="button" aria-label={t(lang, "删除记录", "Delete record")} onClick={() => setState((prev) => deleteWeightRecord(prev, record.id))}><Icon name="trash" /></button>
                      </div>
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
        </main>

        <aside className="mt-side">
          <section className="mt-panel mt-share">
            <div className="mt-panel-head">
              <div>
                <h2>{t(lang, "导出与分享", "Export and share")}</h2>
                <p>{t(lang, "生成你的体重成果卡片", "Generate a progress card")}</p>
              </div>
            </div>
            <div className="mt-preview-range">
              <span>{t(lang, "数据预览范围", "Preview range")}</span>
              <RangeSelector lang={lang} value={previewRange} options={PREVIEW_RANGE_OPTIONS} ariaLabel={t(lang, "数据预览时间范围", "Preview range")} onChange={setPreviewRange} />
            </div>
            {previewRange === "custom" ? (
              <div className="mt-custom-range">
                <input type="date" value={previewCustomStart} onChange={(event) => setPreviewCustomStart(event.target.value)} aria-label={t(lang, "预览开始日期", "Preview start date")} />
                <input type="date" value={previewCustomEnd} onChange={(event) => setPreviewCustomEnd(event.target.value)} aria-label={t(lang, "预览结束日期", "Preview end date")} />
              </div>
            ) : null}
            <div className="mt-share-card" id="metric-share-card">
              <span>{t(lang, "我的体重记录", "My weight record")}</span>
              <div className="mt-share-main">
                <strong>{previewCurrentWeightKg === null ? "—" : previewCurrentWeightKg.toFixed(1)}<small>kg</small></strong>
                <em>BMI {previewStats.bmiCurrent?.toFixed(1) ?? "—"} · {previewBmiStatusResult.label}</em>
              </div>
              <MiniShareLine points={previewPoints} />
              <div className="mt-share-foot">
                <span>{previewRangeLabel}</span>
                <strong>{previewTrendLabel}</strong>
                <span>{t(lang, "目标", "Goal")} {state.profile.targetWeightKg.toFixed(1)}kg</span>
              </div>
            </div>
            <div className="mt-share-actions">
              <button type="button" onClick={downloadShareCard}><Icon name="download" />{t(lang, "下载图片", "Download")}</button>
              <button type="button" onClick={() => void shareCard()}><Icon name="share" />{t(lang, "分享给好友", "Share")}</button>
            </div>
          </section>
        </aside>
      </section>

      {entryOpen ? (
        <div className="mt-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeEntry();
        }}>
          <section className="mt-panel mt-modal-card" role="dialog" aria-modal="true" aria-labelledby="mt-entry-title">
            {saveFailure}
            <div className="mt-panel-head">
              <div>
                <h2 id="mt-entry-title">{draft.id ? t(lang, "更新记录", "Update log") : t(lang, "记一下", "Quick log")}</h2>
                <p>{t(lang, "快速记录体重", "Quick weight logging")}</p>
              </div>
              <button className="mt-close" type="button" aria-label={t(lang, "关闭", "Close")} onClick={closeEntry}><Icon name="x" /></button>
            </div>
            <form className="mt-entry" onSubmit={saveRecord}>
              <label className="mt-field">
                <span>{t(lang, "体重", "Weight")}</span>
                <div className="mt-weight-input">
                  <input autoFocus value={draft.weight} onChange={(event) => setDraft((prev) => ({ ...prev, weight: event.target.value }))} inputMode="decimal" aria-label={t(lang, "体重数值", "Weight value")} />
                  <button type="button" aria-pressed={draft.unit === "kg"} onClick={() => setDraft((prev) => convertDraftUnit(prev, "kg"))}>kg</button>
                  <button type="button" aria-pressed={draft.unit === "jin"} onClick={() => setDraft((prev) => convertDraftUnit(prev, "jin"))}>斤</button>
                </div>
              </label>
              <div className="mt-field">
                <span>{t(lang, "日期", "Date")}</span>
                <div className="mt-date-modes">
                  {(["today", "yesterday", "custom"] as const).map((mode) => (
                    <button key={mode} type="button" aria-pressed={draft.dateMode === mode} onClick={() => handleDateMode(mode)}>
                      {mode === "today" ? t(lang, "今天", "Today") : mode === "yesterday" ? t(lang, "昨天", "Yesterday") : t(lang, "自定义", "Custom")}
                    </button>
                  ))}
                </div>
                {draft.dateMode === "custom" ? <input type="date" value={draft.date} onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))} /> : null}
              </div>
              <label className="mt-field">
                <span>{t(lang, "时间", "Time")}</span>
                <input type="time" value={draft.time} onChange={(event) => setDraft((prev) => ({ ...prev, time: event.target.value }))} />
              </label>
              <label className="mt-field">
                <span>{t(lang, "备注（可选）", "Note (optional)")}</span>
                <textarea maxLength={200} value={draft.note} placeholder={t(lang, "例如：早餐前、运动后、睡前等…", "Before breakfast, after workout, before sleep…")} onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))} />
                <small>{draft.note.length}/200</small>
              </label>
              <div className="mt-dialog-actions">
                <button className="mt-reset" type="button" onClick={closeEntry}>{t(lang, "取消", "Cancel")}</button>
                <button className="mt-save" type="submit" disabled={!isValidPositiveNumber(draft.weight)}>{draft.id ? t(lang, "保存修改", "Save changes") : t(lang, "保存记录", "Save record")}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <section className="mt-panel mt-analytics">
        <div className="mt-panel-head">
          <h2>{t(lang, "数据概览", "Analytics")} <small>{previewRangeLabel}</small></h2>
        </div>
        <div className="mt-kpis">
          <Kpi label={t(lang, "当前体重", "Current")} value={previewCurrentWeightKg === null ? "—" : `${previewCurrentWeightKg.toFixed(1)} kg`} tone="good" />
          <Kpi label={t(lang, "最高体重", "Highest")} value={previewStats.highest ? `${weightToKg(previewStats.highest.value, previewStats.highest.unit).toFixed(1)} kg` : "—"} tone="risk" />
          <Kpi label={t(lang, "最低体重", "Lowest")} value={previewStats.lowest ? `${weightToKg(previewStats.lowest.value, previewStats.lowest.unit).toFixed(1)} kg` : "—"} tone="info" />
          <Kpi label={t(lang, "平均体重", "Average")} value={previewStats.averageKg === null ? "—" : `${previewStats.averageKg.toFixed(1)} kg`} />
          <Kpi label={t(lang, "趋势", "Trend")} value={previewTrendLabel} tone={previewStats.trendKg !== null && previewStats.trendKg <= 0 ? "good" : "risk"} />
        </div>
        <div className="mt-charts">
          <div className="mt-chart-panel">
            <div className="mt-chart-head"><h3>{t(lang, "体重曲线（kg）", "Weight curve")}</h3><span>{previewRangeLabel}</span></div>
            <MetricLineChart points={previewPoints} mode="weight" colorVar="var(--accent)" />
          </div>
          <div className="mt-chart-panel">
            <div className="mt-chart-head"><h3>{t(lang, "BMI 曲线", "BMI curve")}</h3><span>{previewStats.bmiTrend === null ? "—" : `${previewStats.bmiTrend <= 0 ? "↓" : "↑"} ${Math.abs(previewStats.bmiTrend).toFixed(1)}`}</span></div>
            <MetricLineChart points={previewPoints} mode="bmi" colorVar="var(--blue)" />
          </div>
          <div className="mt-chart-panel mt-stage">
            <div className="mt-chart-head"><h3>{t(lang, "阶段对比", "Stage comparison")}</h3><span>{t(lang, "按时间三段", "Three phases")}</span></div>
            {previewComparison.map((item) => (
              <div className="mt-stage-row" key={item.label}>
                <span>{item.label}</span>
                <div><span style={{ width: `${Math.max(8, Math.min(100, (item.valueKg / Math.max(1, previewStats.highest ? weightToKg(previewStats.highest.value, previewStats.highest.unit) : item.valueKg)) * 100))}%` }} /></div>
                <strong>{item.valueKg.toFixed(1)} kg</strong>
                <em>{item.deltaKg <= 0 ? "↓" : "↑"} {Math.abs(item.deltaKg).toFixed(1)}</em>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, tone }: { readonly label: string; readonly value: string; readonly tone?: "good" | "risk" | "info" }) {
  return (
    <div className={`mt-kpi ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RangeSelector({
  lang,
  value,
  options,
  ariaLabel,
  onChange,
}: {
  readonly lang: Lang;
  readonly value: RangeId;
  readonly options: readonly { id: RangeId; zh: string; en: string }[];
  readonly ariaLabel: string;
  readonly onChange: (range: RangeId) => void;
}) {
  return (
    <div className="mt-range" role="tablist" aria-label={ariaLabel}>
      {options.map((option) => (
        <button key={option.id} type="button" aria-selected={value === option.id} onClick={() => onChange(option.id)}>
          {t(lang, option.zh, option.en)}
        </button>
      ))}
    </div>
  );
}

function groupRecords(records: readonly WeightRecord[], lang: Lang) {
  const groups = new Map<string, WeightRecord[]>();
  for (const record of records) {
    const label = formatWeekRange(new Date(record.measuredAt), lang);
    groups.set(label, [...(groups.get(label) ?? []), record]);
  }
  return Array.from(groups.entries()).map(([label, groupRecords]) => ({
    label,
    records: groupRecords,
    averageKg: groupRecords.reduce((total, record) => total + weightToKg(record.value, record.unit), 0) / groupRecords.length,
  }));
}

function goalProgress(currentWeightKg: number, targetWeightKg: number): number {
  const start = Math.max(currentWeightKg, targetWeightKg + 5);
  const span = Math.max(1, start - targetWeightKg);
  return Math.max(0, Math.min(100, ((start - currentWeightKg) / span) * 100));
}

function rangeLabel(id: RangeId, lang: Lang, options = RANGE_OPTIONS): string {
  return options.find((option) => option.id === id)?.[lang] ?? options[0]![lang];
}

function convertDraftUnit(draft: RecordDraft, unit: WeightUnit): RecordDraft {
  if (draft.unit === unit) return draft;
  const parsed = Number(draft.weight);
  if (!Number.isFinite(parsed) || parsed <= 0) return { ...draft, unit };
  const kg = weightToKg(parsed, draft.unit);
  return { ...draft, unit, weight: kgToUnit(kg, unit).toFixed(1) };
}

function createShareCardDataUrl({ currentWeight, bmi, trendKg, targetWeight, rangeLabel }: { readonly currentWeight: number | null; readonly bmi: number | null; readonly trendKg: number | null; readonly targetWeight: number; readonly rangeLabel: string }) {
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const tokens = getComputedStyle(document.documentElement);
  const panel = tokens.getPropertyValue("--bg-panel").trim() || "white";
  const text = tokens.getPropertyValue("--text-1").trim() || "black";
  const muted = tokens.getPropertyValue("--text-2").trim() || "gray";
  const accent = tokens.getPropertyValue("--accent").trim() || "green";
  ctx.fillStyle = panel;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = text;
  ctx.font = "600 34px sans-serif";
  ctx.fillText("我的体重记录", 64, 82);
  ctx.font = "700 76px sans-serif";
  ctx.fillText(currentWeight === null ? "--" : currentWeight.toFixed(1), 64, 190);
  ctx.font = "500 30px sans-serif";
  ctx.fillText("kg", 260, 184);
  ctx.font = "500 28px sans-serif";
  ctx.fillText(`BMI ${bmi?.toFixed(1) ?? "--"}`, 700, 170);
  ctx.fillStyle = accent;
  ctx.font = "600 30px sans-serif";
  ctx.fillText(trendKg === null ? "趋势 --" : `${trendKg <= 0 ? "下降" : "上升"} ${Math.abs(trendKg).toFixed(1)} kg`, 64, 270);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 7;
  ctx.beginPath();
  for (let index = 0; index < 9; index++) {
    const x = 80 + index * 92;
    const y = 390 + Math.sin(index * 0.8) * 26 + index * 4;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = muted;
  ctx.font = "500 24px sans-serif";
  ctx.fillText(rangeLabel, 64, 550);
  ctx.fillText(`目标 ${targetWeight.toFixed(1)} kg`, 700, 550);
  return canvas.toDataURL("image/png");
}
