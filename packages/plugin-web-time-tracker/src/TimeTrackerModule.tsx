import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import type { CopyKey } from "./internal/copy.js";
import { ttCopy } from "./internal/copy.js";
import { TIME_TRACKER_CATEGORY_COLORS } from "./internal/defaults.js";
import { IconChart, IconGlyph, IconTimer } from "./internal/icons.js";
import {
  createTimeTrackerEntry,
  deleteTimeTrackerEntry,
  finishTimeTrackerEntry,
  pauseTimeTrackerEntry,
  resumeTimeTrackerEntry,
  useCategoryMap,
  useTimeTrackerCategories,
  useTimeTrackerEntries,
  useTimeTrackerMode,
} from "./internal/storage.js";
import {
  DAY_MS,
  addDays,
  dayKey,
  entryDuration,
  entryLastEnd,
  entryStart,
  formatClock,
  formatDayKeyLabel,
  formatDayLabel,
  formatDuration,
  formatHours,
  formatTimer,
  fromInputValue,
  isActiveEntry,
  isPausedEntry,
  isRunningEntry,
  keyToDate,
  shortWeekdayLabel,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toInputValue,
} from "./internal/time.js";
import type { Lang, LocalizedText, TimeTrackerCategory, TimeTrackerEntry, TimeTrackerSubcategory } from "./types.js";

export interface TimeTrackerModuleProps {
  readonly lang: Lang;
}

type TrackerView = "tracker" | "insights";
type CategoryEditorState = { readonly mode: "new" } | { readonly mode: "edit"; readonly category: TimeTrackerCategory };
type EntryEditorState = { readonly mode: "new" } | { readonly mode: "edit"; readonly entry: TimeTrackerEntry };
type ConfirmState = {
  readonly title: string;
  readonly body?: string;
  readonly confirmLabel: string;
  readonly danger?: boolean;
  readonly run: () => void;
};

type EntryDraft = {
  readonly id?: string;
  readonly categoryId: string;
  readonly subId: string | null;
  readonly segments: TimeTrackerEntry["segments"];
  readonly note: LocalizedText;
  readonly done: boolean;
};

type CategoryDraft = {
  readonly id?: string;
  readonly name: LocalizedText;
  readonly color: string;
  readonly icon: string;
  readonly goalMin: number;
  readonly subs: readonly TimeTrackerSubcategory[];
};

type CategorySubDraft = {
  readonly id: string;
  readonly name: string;
  readonly original?: LocalizedText;
};

type InsightType =
  | "today-total"
  | "current"
  | "week-total"
  | "month-total"
  | "avg-day"
  | "days-tracked"
  | "donut-today"
  | "donut-range"
  | "cat-ranking"
  | "goal-progress"
  | "sub-split"
  | "by-weekday"
  | "trend-7d"
  | "by-hour"
  | "trend-30d"
  | "heatmap"
  | "range-summary"
  | "category-mosaic"
  | "focus-rhythm"
  | "recent-sessions";

interface InsightCard {
  readonly iid: string;
  readonly type: InsightType;
  readonly catId: string | null;
}

type InsightRange = "week" | "month" | "year" | "custom" | "all";

const INSIGHTS_KEY = "xai_tt_insights_v1";
const SIDEBAR_INSIGHTS_KEY = "xai_tt_sidebar_insights_hidden_v1";

const INSIGHT_DEFS: ReadonlyArray<{ readonly type: InsightType; readonly span: 3 | 4 | 6 | 8; readonly icon: string }> = [
  { type: "today-total", span: 3, icon: "clock" },
  { type: "current", span: 3, icon: "timer" },
  { type: "week-total", span: 3, icon: "calendar" },
  { type: "month-total", span: 3, icon: "calendar" },
  { type: "avg-day", span: 3, icon: "chart" },
  { type: "days-tracked", span: 3, icon: "target" },
  { type: "donut-today", span: 4, icon: "pie" },
  { type: "donut-range", span: 4, icon: "pie" },
  { type: "cat-ranking", span: 4, icon: "list" },
  { type: "goal-progress", span: 4, icon: "target" },
  { type: "sub-split", span: 4, icon: "pie" },
  { type: "by-weekday", span: 4, icon: "chart" },
  { type: "trend-7d", span: 6, icon: "chartUp" },
  { type: "by-hour", span: 8, icon: "chart" },
  { type: "trend-30d", span: 8, icon: "chartUp" },
  { type: "heatmap", span: 8, icon: "grid" },
  { type: "range-summary", span: 4, icon: "target" },
  { type: "category-mosaic", span: 6, icon: "grid" },
  { type: "focus-rhythm", span: 8, icon: "timer" },
  { type: "recent-sessions", span: 6, icon: "list" },
];

const INSIGHT_TITLES: Record<InsightType, CopyKey> = {
  "today-total": "todayTotal",
  current: "currentRunning",
  "week-total": "week",
  "month-total": "month",
  "avg-day": "avgPerDay",
  "days-tracked": "daysTracked",
  "donut-today": "distribution",
  "donut-range": "donutRange",
  "cat-ranking": "categoryRanking",
  "goal-progress": "goalProgress",
  "sub-split": "subSplit",
  "by-weekday": "byWeekday",
  "trend-7d": "sevenDays",
  "by-hour": "byHour",
  "trend-30d": "thirtyDays",
  heatmap: "heatmap",
  "range-summary": "rangeSummary",
  "category-mosaic": "categoryMosaic",
  "focus-rhythm": "focusRhythm",
  "recent-sessions": "recentSessions",
};

const DEFAULT_INSIGHTS: readonly InsightType[] = [
  "today-total",
  "current",
  "week-total",
  "donut-today",
  "cat-ranking",
  "trend-7d",
  "by-hour",
  "goal-progress",
  "by-weekday",
  "range-summary",
  "category-mosaic",
  "focus-rhythm",
  "recent-sessions",
];

const DESIGN_ALIGNMENT_INSIGHTS: readonly InsightType[] = ["range-summary", "category-mosaic", "focus-rhythm", "recent-sessions"];

const ICON_OPTIONS = [
  "study",
  "work",
  "life",
  "rest",
  "book",
  "briefcase",
  "home",
  "leaf",
  "code",
  "calendar",
  "timer",
  "target",
  "chart",
  "coffee",
  "dumbbell",
  "sun",
] as const;

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function textName(value: LocalizedText | undefined, lang: Lang): string {
  return value?.[lang] ?? value?.en ?? "";
}

function localizedInput(value: string, original: LocalizedText | undefined, lang: Lang): LocalizedText {
  const next = value.trim();
  if (original !== undefined && textName(original, lang) === next) return original;
  return { en: next, zh: next };
}

function startOfYear(ts: number): number {
  const d = new Date(startOfDay(ts));
  d.setMonth(0, 1);
  return d.getTime();
}

function dateInputValue(ts: number): string {
  return dayKey(ts);
}

function endOfDayExclusive(key: string): number {
  return keyToDate(key) + DAY_MS;
}

function rangeLabel(startMs: number, endMs: number, lang: Lang): string {
  if (startMs <= 0 && !Number.isFinite(endMs)) return ttCopy(lang, "rangeAll");
  const start = formatDayLabel(startMs, lang);
  const end = Number.isFinite(endMs) ? formatDayLabel(Math.max(startMs, endMs - 1), lang) : ttCopy(lang, "today");
  return `${start} - ${end}`;
}

function readInsightBoard(): InsightCard[] {
  if (typeof window === "undefined") return defaultInsightBoard();
  try {
    const raw = JSON.parse(window.localStorage.getItem(INSIGHTS_KEY) ?? "null") as unknown;
    if (Array.isArray(raw) && raw.length > 0) {
      const allowed = new Set(INSIGHT_DEFS.map((def) => def.type));
      const cards = raw.filter((item): item is InsightCard => {
        return (
          typeof item === "object" &&
          item !== null &&
          "iid" in item &&
          "type" in item &&
          typeof item.iid === "string" &&
          typeof item.type === "string" &&
          allowed.has(item.type as InsightType)
        );
      });
      if (cards.length > 0) {
        const normalized = cards.map((card) => ({ iid: card.iid, type: card.type, catId: card.catId ?? null }));
        const hasNewInsightForm = normalized.some((card) => DESIGN_ALIGNMENT_INSIGHTS.includes(card.type));
        if (hasNewInsightForm) return normalized;
        return [
          ...normalized,
          ...DESIGN_ALIGNMENT_INSIGHTS.map((type) => ({ iid: uid("w"), type, catId: null })),
        ];
      }
    }
  } catch {
    // fall through to defaults
  }
  return defaultInsightBoard();
}

function defaultInsightBoard(): InsightCard[] {
  return DEFAULT_INSIGHTS.map((type) => ({ iid: uid("w"), type, catId: null }));
}

function readSidebarInsightsHidden(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIDEBAR_INSIGHTS_KEY) === "1";
}

export function TimeTrackerModule({ lang }: TimeTrackerModuleProps) {
  const [categories, setCategories] = useTimeTrackerCategories();
  const [entries, setEntries] = useTimeTrackerEntries();
  const [mode, setMode] = useTimeTrackerMode();
  const [view, setView] = useState<TrackerView>("tracker");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [selectedKey, setSelectedKey] = useState(() => dayKey(Date.now()));
  const [categoryEditor, setCategoryEditor] = useState<CategoryEditorState | null>(null);
  const [entryEditor, setEntryEditor] = useState<EntryEditorState | null>(null);
  const [detailCategoryId, setDetailCategoryId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [startPicker, setStartPicker] = useState<string | null>(null);
  const [sidebarInsightsHidden, setSidebarInsightsHidden] = useState(readSidebarInsightsHidden);

  const liveCategories = useMemo(() => categories.filter((category) => category.deleted !== true), [categories]);
  const categoryMap = useCategoryMap(liveCategories);
  const liveEntries = useMemo(() => entries.filter((entry) => entry.deleted !== true), [entries]);
  const activeEntries = useMemo(() => liveEntries.filter(isActiveEntry), [liveEntries]);
  const hasActive = activeEntries.length > 0;

  useEffect(() => {
    if (!hasActive) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hasActive]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_INSIGHTS_KEY, sidebarInsightsHidden ? "1" : "0");
  }, [sidebarInsightsHidden]);

  const todayKey = dayKey(nowMs);
  const isToday = selectedKey === todayKey;
  const weekStart = startOfWeek(nowMs);
  const selectedEntries = useMemo(
    () => liveEntries.filter((entry) => dayKey(entryStart(entry)) === selectedKey),
    [liveEntries, selectedKey],
  );
  const doneForDay = useMemo(
    () => selectedEntries.filter((entry) => entry.done).sort((a, b) => entryStart(b) - entryStart(a)),
    [selectedEntries],
  );
  const selectedByCategory = useMemo(() => totalByCategory(selectedEntries, nowMs), [nowMs, selectedEntries]);
  const selectedTotal = useMemo(() => selectedEntries.reduce((total, entry) => total + entryDuration(entry, nowMs), 0), [nowMs, selectedEntries]);
  const todayEntries = useMemo(() => liveEntries.filter((entry) => dayKey(entryStart(entry)) === todayKey), [liveEntries, todayKey]);
  const todayByCategory = useMemo(() => totalByCategory(todayEntries, nowMs), [nowMs, todayEntries]);
  const weekTotal = useMemo(
    () => liveEntries.filter((entry) => entryStart(entry) >= weekStart).reduce((total, entry) => total + entryDuration(entry, nowMs), 0),
    [liveEntries, nowMs, weekStart],
  );
  const trend = useMemo(() => buildDayTrend(liveEntries, nowMs, lang, selectedKey), [lang, liveEntries, nowMs, selectedKey]);
  const detailCategory = detailCategoryId === null ? null : liveCategories.find((category) => category.id === detailCategoryId) ?? null;

  function appendEntry(entry: TimeTrackerEntry): void {
    setEntries((prev) => [...prev, entry]);
    setNowMs(Date.now());
  }

  function startCategory(categoryId: string, subId: string | null = null): void {
    if (!isToday) return;
    setStartPicker(null);
    const stamp = Date.now();
    const nextEntry = createTimeTrackerEntry(categoryId, subId, stamp, null, { en: "", zh: "" });
    if (mode === "single" && activeEntries.length > 0) {
      const currentName = textName(categoryMap.get(activeEntries[0]?.categoryId ?? "")?.name, lang);
      const nextName = textName(categoryMap.get(categoryId)?.name, lang);
      setConfirm({
        title: ttCopy(lang, "single"),
        body: ttCopy(lang, "singleSwitchBody").replace("%a", currentName).replace("%b", nextName),
        confirmLabel: ttCopy(lang, "switchAction"),
        run: () => {
          setEntries((prev) => [...prev.map((entry) => (isActiveEntry(entry) ? finishTimeTrackerEntry(entry, stamp) : entry)), nextEntry]);
          setNowMs(stamp);
        },
      });
      return;
    }
    appendEntry(nextEntry);
  }

  function pauseEntry(entryId: string): void {
    const stamp = Date.now();
    setEntries((prev) => prev.map((entry) => (entry.id === entryId ? pauseTimeTrackerEntry(entry, stamp) : entry)));
    setNowMs(stamp);
  }

  function resumeEntry(entryId: string): void {
    const stamp = Date.now();
    setEntries((prev) => prev.map((entry) => (entry.id === entryId ? resumeTimeTrackerEntry(entry, stamp) : entry)));
    setNowMs(stamp);
  }

  function stopEntry(entryId: string): void {
    const stamp = Date.now();
    setEntries((prev) => prev.map((entry) => (entry.id === entryId ? finishTimeTrackerEntry(entry, stamp) : entry)));
    setNowMs(stamp);
  }

  function deleteEntry(entryId: string): void {
    const stamp = Date.now();
    setEntries((prev) => prev.map((entry) => (entry.id === entryId ? deleteTimeTrackerEntry(entry, stamp) : entry)));
  }

  function saveEntry(draft: EntryDraft): void {
    const stamp = Date.now();
    if (draft.id !== undefined) {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === draft.id
            ? { ...entry, categoryId: draft.categoryId, subId: draft.subId, segments: draft.segments, note: draft.note, done: draft.done, updatedAt: stamp }
            : entry,
        ),
      );
    } else {
      setEntries((prev) => [
        ...prev,
        {
          id: uid("rec"),
          categoryId: draft.categoryId,
          subId: draft.subId,
          segments: draft.segments,
          note: draft.note,
          done: draft.done,
          createdAt: stamp,
          updatedAt: stamp,
        },
      ]);
    }
    setEntryEditor(null);
    setNowMs(stamp);
  }

  function saveCategory(draft: CategoryDraft): void {
    const stamp = Date.now();
    if (draft.id !== undefined) {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === draft.id
            ? { ...category, name: draft.name, color: draft.color, icon: draft.icon, goalMin: draft.goalMin, subs: draft.subs, updatedAt: stamp }
            : category,
        ),
      );
    } else {
      setCategories((prev) => [
        ...prev,
        {
          id: uid("cat"),
          name: draft.name,
          color: draft.color,
          icon: draft.icon,
          goalMin: draft.goalMin,
          subs: draft.subs,
          createdAt: stamp,
          updatedAt: stamp,
        },
      ]);
    }
    setCategoryEditor(null);
  }

  function deleteCategory(categoryId: string): void {
    const stamp = Date.now();
    setEntries((prev) => prev.map((entry) => (entry.categoryId === categoryId ? { ...entry, deleted: true, updatedAt: stamp } : entry)));
    setCategories((prev) => prev.map((category) => (category.id === categoryId ? { ...category, deleted: true, updatedAt: stamp } : category)));
    setCategoryEditor(null);
    setDetailCategoryId(null);
  }

  function reorderCategories(dragId: string, overId: string): void {
    setCategories((prev) => {
      const next = [...prev];
      const from = next.findIndex((category) => category.id === dragId);
      const to = next.findIndex((category) => category.id === overId);
      if (from < 0 || to < 0 || from === to) return prev;
      const [moved] = next.splice(from, 1);
      if (moved === undefined) return prev;
      next.splice(to, 0, moved);
      return next;
    });
  }

  return (
    <div className="module module-timetrack">
      <header className="tt-head">
        <div className="tt-title-wrap">
          <h1 className="tt-title">
            <IconTimer size={20} />
            {ttCopy(lang, "title")}
          </h1>
          <p className="tt-tagline">{ttCopy(lang, "tagline")}</p>
        </div>
        <div className="tt-toolbar" data-no-drag>
          <div className="tt-segment" aria-label="Time tracker view">
            <button type="button" aria-selected={view === "tracker"} onClick={() => setView("tracker")}>{ttCopy(lang, "tracker")}</button>
            <button type="button" aria-selected={view === "insights"} onClick={() => setView("insights")}>{ttCopy(lang, "insights")}</button>
          </div>
          {view === "tracker" && (
            <div className="tt-segment" aria-label="Time tracker mode">
              <button type="button" aria-selected={mode === "single"} onClick={() => setMode("single")}>{ttCopy(lang, "single")}</button>
              <button type="button" aria-selected={mode === "multi"} onClick={() => setMode("multi")}>{ttCopy(lang, "multi")}</button>
            </div>
          )}
          <button type="button" className="tt-btn tt-btn-primary" onClick={() => setEntryEditor({ mode: "new" })}>
            <IconGlyph name="plus" size={15} />
            {ttCopy(lang, "addRecord")}
          </button>
        </div>
      </header>

      {view === "tracker" ? (
        <div className="tt-layout">
          <main className="tt-main">
            {activeEntries.length > 0 && (
              <section className="tt-panel tt-tray">
                <div className="tt-section-head">
                  <h2>{ttCopy(lang, "active")}</h2>
                  <span><span className="tt-live-dot" />{activeEntries.length}</span>
                </div>
                <div className="tt-active-list">
                  {activeEntries.map((entry) => (
                    <ActiveSession
                      key={entry.id}
                      entry={entry}
                      category={categoryMap.get(entry.categoryId)}
                      lang={lang}
                      nowMs={nowMs}
                      onPause={pauseEntry}
                      onResume={resumeEntry}
                      onStop={stopEntry}
                      onEdit={() => setEntryEditor({ mode: "edit", entry })}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="tt-panel">
              <div className="tt-section-head">
                <h2>{ttCopy(lang, "categories")}</h2>
                <span>{liveCategories.length}</span>
              </div>
              <CategoryGrid
                categories={liveCategories}
                lang={lang}
                todayByCategory={todayByCategory}
                activeEntries={activeEntries}
                canStart={isToday}
                startPicker={startPicker}
                onSetStartPicker={setStartPicker}
                onStart={startCategory}
                onEdit={(category) => setCategoryEditor({ mode: "edit", category })}
                onDetail={(category) => setDetailCategoryId(category.id)}
                onReorder={reorderCategories}
                onNew={() => setCategoryEditor({ mode: "new" })}
                nowMs={nowMs}
              />
            </section>

            <section className="tt-panel">
              <div className="tt-section-head tt-day-head">
                <button type="button" className="tt-icon-btn" aria-label="Previous day" onClick={() => setSelectedKey((key) => addDays(key, -1))}>
                  <IconGlyph name="chevL" size={16} />
                </button>
                <div>
                  <h2>{isToday ? ttCopy(lang, "today") : formatDayKeyLabel(selectedKey, lang)}</h2>
                  {isToday && <span>{formatDayLabel(keyToDate(selectedKey), lang)}</span>}
                </div>
                <button type="button" className="tt-icon-btn" aria-label="Next day" disabled={isToday} onClick={() => setSelectedKey((key) => addDays(key, 1))}>
                  <IconGlyph name="chevR" size={16} />
                </button>
                {!isToday && (
                  <button type="button" className="tt-btn tt-btn-subtle" onClick={() => setSelectedKey(todayKey)}>
                    <IconGlyph name="sun" size={14} />
                    {ttCopy(lang, "jumpToday")}
                  </button>
                )}
                <span className="tt-head-spacer" />
                <span>{formatDuration(selectedTotal)} · {doneForDay.length}</span>
              </div>
              {doneForDay.length === 0 ? (
                <div className="tt-empty">
                  <IconGlyph name="clock" size={26} />
                  <strong>{ttCopy(lang, "noRecords")}</strong>
                  <span>{ttCopy(lang, "noRecordsHint")}</span>
                </div>
              ) : (
                <ul className="tt-record-list">
                  {doneForDay.map((entry) => (
                    <RecordRow
                      key={entry.id}
                      entry={entry}
                      category={categoryMap.get(entry.categoryId)}
                      lang={lang}
                      nowMs={nowMs}
                      onEdit={() => setEntryEditor({ mode: "edit", entry })}
                      onDelete={() =>
                        setConfirm({
                          title: ttCopy(lang, "deleteEntryConfirm"),
                          confirmLabel: ttCopy(lang, "delete"),
                          danger: true,
                          run: () => deleteEntry(entry.id),
                        })
                      }
                    />
                  ))}
                </ul>
              )}
            </section>
          </main>

          <SidePanel
            lang={lang}
            isToday={isToday}
            dayTotal={selectedTotal}
            dayByCategory={selectedByCategory}
            categoryMap={categoryMap}
            doneCount={doneForDay.length}
            activeCount={activeEntries.length}
            weekTotal={weekTotal}
            trend={trend}
            insightsHidden={sidebarInsightsHidden}
            onSetInsightsHidden={setSidebarInsightsHidden}
            onPickDay={setSelectedKey}
            onOpenInsights={() => setView("insights")}
          />
        </div>
      ) : (
        <InsightsBoard
          categories={liveCategories}
          entries={liveEntries}
          lang={lang}
          nowMs={nowMs}
          categoryMap={categoryMap}
          onDeleteRange={(rangeEntries, label) => {
            setConfirm({
              title: ttCopy(lang, "deleteRange"),
              body: ttCopy(lang, "deleteRangeBody").replace("%n", String(rangeEntries.length)).replace("%r", label),
              confirmLabel: ttCopy(lang, "delete"),
              danger: true,
              run: () => {
                const ids = new Set(rangeEntries.map((entry) => entry.id));
                const stamp = Date.now();
                setEntries((prev) => prev.map((entry) => ids.has(entry.id) ? deleteTimeTrackerEntry(entry, stamp) : entry));
              },
            });
          }}
        />
      )}

      {categoryEditor !== null && (
        <CategoryEditor
          state={categoryEditor}
          lang={lang}
          onClose={() => setCategoryEditor(null)}
          onSave={saveCategory}
          onDelete={(category) => {
            const count = liveEntries.filter((entry) => entry.categoryId === category.id).length;
            setConfirm({
              title: ttCopy(lang, "delete"),
              body: ttCopy(lang, "deleteCategoryBody").replace("%c", textName(category.name, lang)).replace("%n", String(count)),
              confirmLabel: ttCopy(lang, "delete"),
              danger: true,
              run: () => deleteCategory(category.id),
            });
          }}
        />
      )}
      {entryEditor !== null && (
        <EntryEditor
          state={entryEditor}
          categories={liveCategories}
          lang={lang}
          defaultDayKey={selectedKey}
          onSave={saveEntry}
          onClose={() => setEntryEditor(null)}
        />
      )}
      {detailCategory !== null && (
        <CategoryDetail
          category={detailCategory}
          lang={lang}
          entries={liveEntries}
          selectedKey={selectedKey}
          nowMs={nowMs}
          isToday={isToday}
          onClose={() => setDetailCategoryId(null)}
          onEdit={() => {
            setCategoryEditor({ mode: "edit", category: detailCategory });
            setDetailCategoryId(null);
          }}
          onStartSub={(subId) => {
            startCategory(detailCategory.id, subId);
            setDetailCategoryId(null);
          }}
        />
      )}
      {confirm !== null && (
        <ConfirmDialog
          title={confirm.title}
          body={confirm.body}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger === true}
          lang={lang}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            confirm.run();
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}

function totalByCategory(entries: readonly TimeTrackerEntry[], nowMs: number): Map<string, number> {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    totals.set(entry.categoryId, (totals.get(entry.categoryId) ?? 0) + entryDuration(entry, nowMs));
  }
  return totals;
}

type InsightBarRow = {
  readonly key: string;
  readonly value: number;
  readonly label: string;
  readonly selected?: boolean;
  readonly title?: string;
  readonly detail?: string;
};

type CategorySummary = {
  readonly categoryId: string;
  readonly name: string;
  readonly icon: string;
  readonly color: string;
  readonly value: number;
  readonly count: number;
  readonly percent: number;
};

function entryCountText(count: number, lang: Lang): string {
  return `${count} ${count === 1 ? ttCopy(lang, "entryOne") : ttCopy(lang, "entries")}`;
}

function percentText(value: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round(value / total * 100)}%`;
}

function detailText(lines: readonly string[]): string {
  return lines.filter(Boolean).join("\n");
}

function categorySummaries(
  list: readonly TimeTrackerEntry[],
  nowMs: number,
  categoryMap: ReadonlyMap<string, TimeTrackerCategory>,
  lang: Lang,
): CategorySummary[] {
  const buckets = new Map<string, { value: number; count: number }>();
  for (const entry of list) {
    const current = buckets.get(entry.categoryId) ?? { value: 0, count: 0 };
    buckets.set(entry.categoryId, { value: current.value + entryDuration(entry, nowMs), count: current.count + 1 });
  }
  const total = Array.from(buckets.values()).reduce((sum, bucket) => sum + bucket.value, 0);
  return Array.from(buckets.entries())
    .map(([categoryId, bucket]) => {
      const category = categoryMap.get(categoryId);
      return {
        categoryId,
        name: textName(category?.name, lang),
        icon: category?.icon ?? "timer",
        color: category?.color ?? "var(--accent)",
        value: bucket.value,
        count: bucket.count,
        percent: total > 0 ? bucket.value / total : 0,
      };
    })
    .sort((a, b) => b.value - a.value);
}

function subcategoryLabel(entry: TimeTrackerEntry, category: TimeTrackerCategory | undefined, lang: Lang): string {
  const sub = category?.subs.find((item) => item.id === entry.subId);
  return sub !== undefined ? textName(sub.name, lang) : ttCopy(lang, "whole");
}

function entryDetail(entry: TimeTrackerEntry, category: TimeTrackerCategory | undefined, nowMs: number, lang: Lang): string {
  const note = entry.note[lang] || entry.note.en;
  return detailText([
    `${textName(category?.name, lang)} · ${subcategoryLabel(entry, category, lang)}`,
    `${formatClock(entryStart(entry))} - ${formatClock(entryLastEnd(entry, nowMs))}`,
    `${ttCopy(lang, "duration")}: ${formatDuration(entryDuration(entry, nowMs))}`,
    note !== "" ? `${ttCopy(lang, "note")}: ${note}` : "",
  ]);
}

function csvCell(value: string | number): string {
  const text = String(value).replace(/\r?\n/g, " ");
  if (!/[",]/.test(text)) return text;
  return `"${text.replace(/"/g, "\"\"")}"`;
}

function downloadTextFile(filename: string, text: string, type: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([text], { type });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

function exportEntriesCsv(
  list: readonly TimeTrackerEntry[],
  nowMs: number,
  lang: Lang,
  categoryMap: ReadonlyMap<string, TimeTrackerCategory>,
  label: string,
): void {
  const headers = ["Date", "Category", "Subcategory", "Start", "End", "Duration", "Duration minutes", "Note", "Status"];
  const rows = list.map((entry) => {
    const category = categoryMap.get(entry.categoryId);
    const start = entryStart(entry);
    const end = isRunningEntry(entry) ? "" : formatClock(entryLastEnd(entry, nowMs));
    const duration = entryDuration(entry, nowMs);
    return [
      formatDayLabel(start, lang),
      textName(category?.name, lang),
      subcategoryLabel(entry, category, lang),
      formatClock(start),
      end,
      formatDuration(duration),
      Math.round(duration / 60_000),
      entry.note[lang] || entry.note.en,
      isRunningEntry(entry) ? ttCopy(lang, "running") : ttCopy(lang, "records"),
    ];
  });
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "range";
  downloadTextFile(`xai-time-tracker-${slug}.csv`, csv, "text/csv;charset=utf-8");
}

function buildDayTrend(entries: readonly TimeTrackerEntry[], nowMs: number, lang: Lang, selectedKey: string) {
  return Array.from({ length: 7 }, (_, index) => {
    const start = startOfDay(nowMs - (6 - index) * DAY_MS);
    const key = dayKey(start);
    const dayEntries = entries.filter((entry) => dayKey(entryStart(entry)) === key);
    const value = entries
      .filter((entry) => dayKey(entryStart(entry)) === key)
      .reduce((sum, entry) => sum + entryDuration(entry, nowMs), 0);
    return {
      key,
      value,
      label: shortWeekdayLabel(start, lang),
      selected: key === selectedKey,
      title: formatDuration(value),
      detail: detailText([formatDayKeyLabel(key, lang), formatDuration(value), entryCountText(dayEntries.length, lang)]),
    };
  });
}

function CategoryGrid({
  categories,
  lang,
  todayByCategory,
  activeEntries,
  canStart,
  startPicker,
  onSetStartPicker,
  onStart,
  onEdit,
  onDetail,
  onReorder,
  onNew,
  nowMs,
}: {
  readonly categories: readonly TimeTrackerCategory[];
  readonly lang: Lang;
  readonly todayByCategory: ReadonlyMap<string, number>;
  readonly activeEntries: readonly TimeTrackerEntry[];
  readonly canStart: boolean;
  readonly startPicker: string | null;
  readonly onSetStartPicker: (categoryId: string | null) => void;
  readonly onStart: (categoryId: string, subId: string | null) => void;
  readonly onEdit: (category: TimeTrackerCategory) => void;
  readonly onDetail: (category: TimeTrackerCategory) => void;
  readonly onReorder: (dragId: string, overId: string) => void;
  readonly onNew: () => void;
  readonly nowMs: number;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  return (
    <div className="tt-category-grid">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          lang={lang}
          todayMs={todayByCategory.get(category.id) ?? 0}
          activeCount={activeEntries.filter((entry) => entry.categoryId === category.id).length}
          canStart={canStart}
          pickerOpen={startPicker === category.id}
          onOpenPicker={() => onSetStartPicker(startPicker === category.id ? null : category.id)}
          onClosePicker={() => onSetStartPicker(null)}
          onStart={onStart}
          onEdit={() => onEdit(category)}
          onDetail={() => onDetail(category)}
          dragId={dragId}
          onSetDragId={setDragId}
          onReorder={onReorder}
          nowMs={nowMs}
        />
      ))}
      <button type="button" className="tt-category-new" onClick={onNew}>
        <span><IconGlyph name="plus" size={20} /></span>
        {ttCopy(lang, "newCategory")}
      </button>
    </div>
  );
}

function CategoryCard({
  category,
  lang,
  todayMs,
  activeCount,
  canStart,
  pickerOpen,
  onOpenPicker,
  onClosePicker,
  onStart,
  onEdit,
  onDetail,
  dragId,
  onSetDragId,
  onReorder,
}: {
  readonly category: TimeTrackerCategory;
  readonly lang: Lang;
  readonly todayMs: number;
  readonly activeCount: number;
  readonly canStart: boolean;
  readonly pickerOpen: boolean;
  readonly onOpenPicker: () => void;
  readonly onClosePicker: () => void;
  readonly onStart: (categoryId: string, subId: string | null) => void;
  readonly onEdit: () => void;
  readonly onDetail: () => void;
  readonly dragId: string | null;
  readonly onSetDragId: (id: string | null) => void;
  readonly onReorder: (dragId: string, overId: string) => void;
  readonly nowMs: number;
}) {
  const goalPct = category.goalMin > 0 ? Math.min(100, Math.round(todayMs / 60_000 / category.goalMin * 100)) : 0;
  const running = activeCount > 0;
  const style = { "--tt-accent": category.color } as CSSProperties;
  return (
    <article
      className={`tt-category-card${running ? " is-running" : ""}${dragId === category.id ? " is-dragging" : ""}`}
      style={style}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        onSetDragId(category.id);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (dragId !== null && dragId !== category.id) onReorder(dragId, category.id);
      }}
      onDragEnd={() => onSetDragId(null)}
    >
      <button type="button" className="tt-card-menu" aria-label={ttCopy(lang, "editCategory")} onClick={(event) => { event.stopPropagation(); onEdit(); }}>
        <IconGlyph name="dots" size={15} />
      </button>
      <button type="button" className="tt-category-body" onClick={onDetail}>
        <div className="tt-category-top">
          <span className="tt-category-icon"><IconGlyph name={category.icon} size={18} /></span>
          <div>
            <h3>{textName(category.name, lang)}</h3>
            <p>{formatDuration(todayMs)} / {category.goalMin}m {ttCopy(lang, "goal")}</p>
          </div>
          {running && <span className="tt-run-tag"><span className="tt-live-dot" />{activeCount}</span>}
        </div>
        {category.subs.length > 0 && (
          <div className="tt-subchips">
            {category.subs.slice(0, 4).map((sub) => <span key={sub.id}>{textName(sub.name, lang)}</span>)}
            {category.subs.length > 4 && <span>+{category.subs.length - 4}</span>}
          </div>
        )}
        <div className="tt-progress"><span style={{ width: `${goalPct}%` }} /></div>
      </button>
      {canStart ? (
        <button
          type="button"
          className="tt-category-start"
          onClick={(event) => {
            event.stopPropagation();
            if (category.subs.length > 0) onOpenPicker();
            else onStart(category.id, null);
          }}
        >
          <IconGlyph name="play" size={14} />
          {ttCopy(lang, "start")}
          {category.subs.length > 0 && <IconGlyph name="chevD" size={12} />}
        </button>
      ) : (
        <div className="tt-category-past">{formatDuration(todayMs)}</div>
      )}
      {pickerOpen && (
        <>
          <button type="button" className="tt-pop-scrim" aria-label={ttCopy(lang, "cancel")} onClick={(event) => { event.stopPropagation(); onClosePicker(); }} />
          <div className="tt-subpop" onClick={(event) => event.stopPropagation()}>
            <strong>{ttCopy(lang, "pickSub")}</strong>
            <button type="button" onClick={() => onStart(category.id, null)}><span style={{ background: category.color }} />{ttCopy(lang, "whole")}</button>
            {category.subs.map((sub) => (
              <button type="button" key={sub.id} onClick={() => onStart(category.id, sub.id)}><span style={{ background: category.color }} />{textName(sub.name, lang)}</button>
            ))}
          </div>
        </>
      )}
    </article>
  );
}

function ActiveSession({
  entry,
  category,
  lang,
  nowMs,
  onPause,
  onResume,
  onStop,
  onEdit,
}: {
  readonly entry: TimeTrackerEntry;
  readonly category: TimeTrackerCategory | undefined;
  readonly lang: Lang;
  readonly nowMs: number;
  readonly onPause: (entryId: string) => void;
  readonly onResume: (entryId: string) => void;
  readonly onStop: (entryId: string) => void;
  readonly onEdit: () => void;
}) {
  const running = isRunningEntry(entry);
  const sub = category?.subs.find((item) => item.id === entry.subId);
  return (
    <article className={`tt-active-row${running ? " is-running" : " is-paused"}`} style={{ "--tt-accent": category?.color ?? "var(--accent)" } as CSSProperties}>
      <span className="tt-active-icon"><IconGlyph name={category?.icon ?? "timer"} size={18} /></span>
      <button type="button" className="tt-active-body" onClick={onEdit}>
        <strong>{textName(category?.name, lang)}{sub !== undefined && <span> · {textName(sub.name, lang)}</span>}</strong>
        <span>{running ? <><span className="tt-live-dot" />{ttCopy(lang, "running")}</> : ttCopy(lang, "paused")} · {formatClock(entryStart(entry))}</span>
      </button>
      <b>{formatTimer(entryDuration(entry, nowMs))}</b>
      <div className="tt-active-actions" data-no-drag>
        {isPausedEntry(entry) ? (
          <button type="button" onClick={() => onResume(entry.id)} aria-label={ttCopy(lang, "resume")}><IconGlyph name="play" size={15} /></button>
        ) : (
          <button type="button" onClick={() => onPause(entry.id)} aria-label={ttCopy(lang, "pause")}><IconGlyph name="pause" size={15} /></button>
        )}
        <button type="button" onClick={() => onStop(entry.id)} aria-label={ttCopy(lang, "end")}><IconGlyph name="check" size={15} /></button>
      </div>
    </article>
  );
}

function RecordRow({
  entry,
  category,
  lang,
  nowMs,
  onEdit,
  onDelete,
}: {
  readonly entry: TimeTrackerEntry;
  readonly category: TimeTrackerCategory | undefined;
  readonly lang: Lang;
  readonly nowMs: number;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}) {
  const sub = category?.subs.find((item) => item.id === entry.subId);
  const paused = entry.segments.length > 1;
  return (
    <li className="tt-record-row">
      <span className="tt-record-color" style={{ background: category?.color ?? "var(--accent)" }} />
      <div>
        <strong>{textName(category?.name, lang)}{sub !== undefined && <span> · {textName(sub.name, lang)}</span>}</strong>
        <span>{formatClock(entryStart(entry))} - {formatClock(entryLastEnd(entry, nowMs))}{paused && <em>{ttCopy(lang, "paused")}</em>}</span>
        {entry.note[lang] !== "" && <small>{entry.note[lang]}</small>}
      </div>
      <b>{formatDuration(entryDuration(entry, nowMs))}</b>
      <div className="tt-row-actions">
        <button type="button" aria-label={ttCopy(lang, "editRecord")} onClick={onEdit}><IconGlyph name="sliders" size={14} /></button>
        <button type="button" aria-label={ttCopy(lang, "delete")} onClick={onDelete}><IconGlyph name="trash" size={14} /></button>
      </div>
    </li>
  );
}

function SidePanel({
  lang,
  isToday,
  dayTotal,
  dayByCategory,
  categoryMap,
  doneCount,
  activeCount,
  weekTotal,
  trend,
  insightsHidden,
  onSetInsightsHidden,
  onPickDay,
  onOpenInsights,
}: {
  readonly lang: Lang;
  readonly isToday: boolean;
  readonly dayTotal: number;
  readonly dayByCategory: ReadonlyMap<string, number>;
  readonly categoryMap: ReadonlyMap<string, TimeTrackerCategory>;
  readonly doneCount: number;
  readonly activeCount: number;
  readonly weekTotal: number;
  readonly trend: ReadonlyArray<{ readonly key: string; readonly value: number; readonly label: string; readonly selected: boolean; readonly title: string }>;
  readonly insightsHidden: boolean;
  readonly onSetInsightsHidden: (hidden: boolean) => void;
  readonly onPickDay: (key: string) => void;
  readonly onOpenInsights: () => void;
}) {
  const segments = Array.from(dayByCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([categoryId, value]) => ({ categoryId, value, color: categoryMap.get(categoryId)?.color ?? "var(--text-4)" }));
  return (
    <aside className="tt-sidebar">
      <div className="tt-stat-card">
        <span>{isToday ? ttCopy(lang, "todayTotal") : ttCopy(lang, "dayTotal")}</span>
        <strong>{dayTotal > 0 ? formatDuration(dayTotal) : ttCopy(lang, "noneToday")}</strong>
        <small>{activeCount > 0 && isToday ? `${ttCopy(lang, "runningCount")} × ${activeCount}` : `${doneCount} ${doneCount === 1 ? ttCopy(lang, "entryOne") : ttCopy(lang, "entries")}`}</small>
      </div>
      {insightsHidden ? (
        <div className="tt-sidebar-hidden">
          <span>
            <IconChart size={14} />
            {ttCopy(lang, "insightPreviewHidden")}
          </span>
          <button type="button" className="tt-btn tt-btn-subtle" onClick={() => onSetInsightsHidden(false)}>
            {ttCopy(lang, "showInsightPreview")}
          </button>
        </div>
      ) : (
        <>
          <div className="tt-donut-card">
            <div className="tt-section-head">
              <h2>{ttCopy(lang, "distribution")}</h2>
              <button type="button" className="tt-icon-btn tt-mini-action" aria-label={ttCopy(lang, "hideInsightPreview")} onClick={() => onSetInsightsHidden(true)}>
                <IconGlyph name="close" size={13} />
              </button>
            </div>
            {dayTotal > 0 ? (
              <>
                <Donut segments={segments.map((segment) => ({ value: segment.value, color: segment.color }))} total={dayTotal} centerTop={formatDuration(dayTotal)} centerSub={`${segments.length} ${ttCopy(lang, "categoryCount")}`} />
                <ul className="tt-legend">
                  {segments.map((segment) => {
                    const category = categoryMap.get(segment.categoryId);
                    return (
                      <li key={segment.categoryId}>
                        <span style={{ background: segment.color }} />
                        <strong>{textName(category?.name, lang)}</strong>
                        <b>{Math.round(segment.value / dayTotal * 100)}%</b>
                        <em>{formatDuration(segment.value)}</em>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : <div className="tt-empty compact">{ttCopy(lang, "noData")}</div>}
          </div>
          <div className="tt-trend-card">
            <div className="tt-section-head">
              <h2>{ttCopy(lang, "sevenDays")}</h2>
              <span>{formatDuration(weekTotal)}</span>
              <button type="button" className="tt-icon-btn tt-mini-action" aria-label={ttCopy(lang, "hideInsightPreview")} onClick={() => onSetInsightsHidden(true)}>
                <IconGlyph name="close" size={13} />
              </button>
            </div>
            <MiniBars rows={trend} onPick={onPickDay} />
          </div>
        </>
      )}
      <button type="button" className="tt-side-link" onClick={onOpenInsights}>
        <IconChart size={14} />
        {ttCopy(lang, "insights")}
        <IconGlyph name="chevR" size={13} />
      </button>
    </aside>
  );
}

function Donut({
  segments,
  total,
  centerTop,
  centerSub,
  size = 168,
  stroke = 11,
	}: {
	  readonly segments: ReadonlyArray<{ readonly value: number; readonly color: string; readonly detail?: string }>;
	  readonly total: number;
	  readonly centerTop: ReactNode;
	  readonly centerSub?: ReactNode;
  readonly size?: number;
  readonly stroke?: number;
}) {
  const radius = size / 2 - stroke - 1.5;
  const circumference = 2 * Math.PI * radius;
  let acc = 0;
  return (
    <div className="tt-donut" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-1)" strokeWidth={stroke} />
        {total > 0 && segments.map((segment, index) => {
          const len = segment.value / total * circumference;
          const offset = circumference - acc;
          acc += len;
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={stroke}
              strokeDasharray={`${Math.max(0, len - 1.5)} ${circumference - Math.max(0, len - 1.5)}`}
              strokeDashoffset={offset}
	              strokeLinecap="round"
	              transform={`rotate(-90 ${size / 2} ${size / 2})`}
	            >
	              {segment.detail !== undefined && <title>{segment.detail}</title>}
	            </circle>
	          );
	        })}
      </svg>
      <div className="tt-donut-center">
        <strong>{centerTop}</strong>
        {centerSub !== undefined && <span>{centerSub}</span>}
      </div>
    </div>
  );
}

function MiniBars({
  rows,
  onPick,
	}: {
	  readonly rows: readonly InsightBarRow[];
	  readonly onPick?: (key: string) => void;
	}) {
	  const max = Math.max(...rows.map((row) => row.value), 1);
	  return (
	    <div className="tt-mini-bars">
	      {rows.map((row) => (
	        <button
	          type="button"
	          key={row.key}
	          className={`tt-tip${row.selected === true ? " is-selected" : ""}`}
	          title={row.title}
	          data-tip={row.detail ?? row.title}
	          onClick={() => onPick?.(row.key)}
	        >
	          <span><i style={{ height: `${Math.max(3, row.value / max * 100)}%` }} /></span>
	          <em>{row.label}</em>
	        </button>
      ))}
    </div>
  );
}

function CategoryDetail({
  category,
  lang,
  entries,
  selectedKey,
  nowMs,
  isToday,
  onClose,
  onEdit,
  onStartSub,
}: {
  readonly category: TimeTrackerCategory;
  readonly lang: Lang;
  readonly entries: readonly TimeTrackerEntry[];
  readonly selectedKey: string;
  readonly nowMs: number;
  readonly isToday: boolean;
  readonly onClose: () => void;
  readonly onEdit: () => void;
  readonly onStartSub: (subId: string) => void;
}) {
  const dayEntries = entries.filter((entry) => entry.categoryId === category.id && dayKey(entryStart(entry)) === selectedKey);
  const total = dayEntries.reduce((sum, entry) => sum + entryDuration(entry, nowMs), 0);
  const bySub = new Map<string, number>();
  for (const entry of dayEntries) {
    bySub.set(entry.subId ?? "_none", (bySub.get(entry.subId ?? "_none") ?? 0) + entryDuration(entry, nowMs));
  }
  const rows = [
    ...category.subs.map((sub) => ({ id: sub.id, name: textName(sub.name, lang), ms: bySub.get(sub.id) ?? 0 })),
    ...(bySub.has("_none") ? [{ id: null, name: ttCopy(lang, "whole"), ms: bySub.get("_none") ?? 0 }] : []),
  ].sort((a, b) => b.ms - a.ms);
  const max = Math.max(...rows.map((row) => row.ms), 1);
  return (
    <Modal title={<span className="tt-modal-title"><IconGlyph name={category.icon} size={16} />{textName(category.name, lang)}</span>} onClose={onClose} wide footer={(
      <>
        <button type="button" className="tt-btn" onClick={onEdit}><IconGlyph name="sliders" size={14} />{ttCopy(lang, "editCategory")}</button>
        <span className="tt-head-spacer" />
        <button type="button" className="tt-btn" onClick={onClose}>{ttCopy(lang, "cancel")}</button>
      </>
    )}>
      <div className="tt-detail-top">
        <div>
          <strong>{formatDuration(total)}</strong>
          <span>{isToday ? ttCopy(lang, "todayTotal") : ttCopy(lang, "dayTotal")}</span>
        </div>
        <Donut
          size={92}
          stroke={9}
          total={total}
          segments={rows.map((row, index) => ({ value: row.ms, color: index === 0 ? category.color : `color-mix(in oklch, ${category.color} ${80 - index * 12}%, var(--bg-panel-2))` }))}
          centerTop={rows.length}
        />
      </div>
      <h3 className="tt-detail-label">{ttCopy(lang, "breakdown")}</h3>
      {rows.length === 0 ? (
        <div className="tt-empty compact">{ttCopy(lang, "noData")}</div>
      ) : (
        <ul className="tt-detail-list">
          {rows.map((row) => (
            <li key={row.id ?? "whole"}>
              <strong>{row.name}</strong>
              <span><i style={{ width: `${row.ms / max * 100}%`, background: category.color }} /></span>
              <b>{formatDuration(row.ms)}</b>
              {isToday && row.id !== null && <button type="button" onClick={() => onStartSub(row.id)} aria-label={ttCopy(lang, "quickStart")}><IconGlyph name="play" size={12} /></button>}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

function CategoryEditor({
  state,
  lang,
  onClose,
  onSave,
  onDelete,
}: {
  readonly state: CategoryEditorState;
  readonly lang: Lang;
  readonly onClose: () => void;
  readonly onSave: (draft: CategoryDraft) => void;
  readonly onDelete: (category: TimeTrackerCategory) => void;
}) {
  const editing = state.mode === "edit";
  const category = editing ? state.category : undefined;
  const [name, setName] = useState(() => category === undefined ? "" : textName(category.name, lang));
  const [color, setColor] = useState(() => category?.color ?? TIME_TRACKER_CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(() => category?.icon ?? ICON_OPTIONS[0]);
  const [goal, setGoal] = useState(() => String(category?.goalMin ?? 0));
  const [subs, setSubs] = useState<CategorySubDraft[]>(() =>
    category?.subs.map((sub) => ({ id: sub.id, name: textName(sub.name, lang), original: sub.name })) ?? [],
  );

  function submit(): void {
    if (name.trim() === "") return;
    onSave({
      id: category?.id,
      name: localizedInput(name, category?.name, lang),
      color,
      icon,
      goalMin: Number(goal) || 0,
      subs: subs
        .filter((sub) => sub.name.trim() !== "")
        .map((sub) => ({ id: sub.id, name: localizedInput(sub.name, sub.original, lang) })),
    });
  }

  return (
    <Modal title={editing ? ttCopy(lang, "editCategory") : ttCopy(lang, "newCategory")} onClose={onClose} wide footer={(
      <>
        {category !== undefined && <button type="button" className="tt-btn tt-btn-danger" onClick={() => onDelete(category)}><IconGlyph name="trash" size={14} />{ttCopy(lang, "delete")}</button>}
        <span className="tt-head-spacer" />
        <button type="button" className="tt-btn" onClick={onClose}>{ttCopy(lang, "cancel")}</button>
        <button type="button" className="tt-btn tt-btn-primary" disabled={name.trim() === ""} onClick={submit}>{ttCopy(lang, "save")}</button>
      </>
    )}>
      <label className="tt-field">
        <span>{ttCopy(lang, "name")}</span>
        <div className="tt-name-row">
          <i style={{ background: color }}><IconGlyph name={icon} size={18} /></i>
          <input value={name} placeholder={ttCopy(lang, "namePlaceholder")} onChange={(event) => setName(event.target.value)} autoFocus />
        </div>
      </label>
      <div className="tt-field-grid">
        <label className="tt-field">
          <span>{ttCopy(lang, "color")}</span>
          <div className="tt-swatches">
            {TIME_TRACKER_CATEGORY_COLORS.map((item) => (
              <button key={item} type="button" aria-label={item} className={item === color ? "is-selected" : ""} style={{ background: item }} onClick={() => setColor(item)}>
                {item === color && <IconGlyph name="check" size={12} />}
              </button>
            ))}
          </div>
        </label>
        <label className="tt-field">
          <span>{ttCopy(lang, "goalToday")}</span>
          <input type="number" min="0" step="15" value={goal} onChange={(event) => setGoal(event.target.value)} />
        </label>
      </div>
      <label className="tt-field">
        <span>{ttCopy(lang, "icon")}</span>
        <IconPicker value={icon} color={color} lang={lang} onPick={setIcon} />
      </label>
      <div className="tt-field">
        <div className="tt-field-head">
          <span>{ttCopy(lang, "subcategory")}</span>
          <button type="button" onClick={() => setSubs((prev) => [...prev, { id: uid("sub"), name: "", original: undefined }])}><IconGlyph name="plus" size={13} />{ttCopy(lang, "addSub")}</button>
        </div>
        {subs.length === 0 ? (
          <div className="tt-empty compact">{ttCopy(lang, "noSubcategories")}</div>
        ) : (
          <ul className="tt-sub-edit-list">
            {subs.map((sub, index) => (
              <li key={sub.id}>
                <span style={{ background: color }} />
                <input value={sub.name} placeholder={ttCopy(lang, "subcategory")} onChange={(event) => setSubs((prev) => prev.map((item) => item.id === sub.id ? { ...item, name: event.target.value } : item))} />
                <button type="button" disabled={index === 0} onClick={() => setSubs((prev) => moveById(prev, sub.id, -1))}><IconGlyph name="chevD" size={13} /></button>
                <button type="button" disabled={index === subs.length - 1} onClick={() => setSubs((prev) => moveById(prev, sub.id, 1))}><IconGlyph name="chevD" size={13} /></button>
                <button type="button" onClick={() => setSubs((prev) => prev.filter((item) => item.id !== sub.id))}><IconGlyph name="close" size={13} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

function moveById<T extends { readonly id: string }>(items: readonly T[], id: string, delta: number): T[] {
  const next = [...items];
  const from = next.findIndex((item) => item.id === id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= next.length) return next;
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}

function IconPicker({
  value,
  color,
  lang,
  onPick,
}: {
  readonly value: string;
  readonly color: string;
  readonly lang: Lang;
  readonly onPick: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const options = ICON_OPTIONS.filter((option) => q === "" || option.toLowerCase().includes(q));
  return (
    <div className="tt-icon-picker">
      <div className="tt-icon-search">
        <IconGlyph name="search" size={14} />
        <input value={query} placeholder={ttCopy(lang, "iconSearch")} onChange={(event) => setQuery(event.target.value)} />
        {query !== "" && <button type="button" onClick={() => setQuery("")}><IconGlyph name="close" size={13} /></button>}
      </div>
      <div className="tt-icon-grid">
        {options.map((option) => (
          <button key={option} type="button" title={option} className={option === value ? "is-selected" : ""} style={option === value ? { borderColor: color, color } : undefined} onClick={() => onPick(option)}>
            <IconGlyph name={option} size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}

function EntryEditor({
  state,
  categories,
  lang,
  defaultDayKey,
  onSave,
  onClose,
}: {
  readonly state: EntryEditorState;
  readonly categories: readonly TimeTrackerCategory[];
  readonly lang: Lang;
  readonly defaultDayKey: string;
  readonly onSave: (draft: EntryDraft) => void;
  readonly onClose: () => void;
}) {
  const editing = state.mode === "edit";
  const entry = editing ? state.entry : undefined;
  const wasRunning = entry !== undefined && isRunningEntry(entry);
  const baseDay = entry === undefined ? keyToDate(defaultDayKey) : entryStart(entry);
  const firstCategory = categories[0];
  const [categoryId, setCategoryId] = useState(entry?.categoryId ?? firstCategory?.id ?? "");
  const currentCategory = categories.find((category) => category.id === categoryId) ?? firstCategory;
  const [subId, setSubId] = useState<string | null>(entry?.subId ?? null);
  const [startValue, setStartValue] = useState(() => toInputValue(entry === undefined ? baseDay + 9 * 3_600_000 : entryStart(entry)));
  const [endValue, setEndValue] = useState(() => toInputValue(entry === undefined ? baseDay + 10 * 3_600_000 : entryLastEnd(entry, Date.now())));
  const [keepRunning, setKeepRunning] = useState(wasRunning);
  const [note, setNote] = useState(entry?.note[lang] ?? "");
  const startMs = fromInputValue(startValue, Date.now());
  const endMs = fromInputValue(endValue, Date.now());
  const valid = categoryId !== "" && (keepRunning || endMs > startMs);
  const durationMs = keepRunning ? Date.now() - startMs : endMs - startMs;

  function submit(event: FormEvent): void {
    event.preventDefault();
    if (!valid || currentCategory === undefined) return;
    onSave({
      id: entry?.id,
      categoryId,
      subId,
      segments: [{ start: startMs, end: keepRunning ? null : endMs }],
      note: note.trim() === "" ? { en: "", zh: "" } : { en: note.trim(), zh: note.trim() },
      done: !keepRunning,
    });
  }

  return (
    <Modal title={editing ? ttCopy(lang, "editRecord") : ttCopy(lang, "manualTitle")} onClose={onClose} wide footer={(
      <>
        <span className="tt-head-spacer" />
        <button type="button" className="tt-btn" onClick={onClose}>{ttCopy(lang, "cancel")}</button>
        <button type="submit" form="tt-entry-form" className="tt-btn tt-btn-primary" disabled={!valid}>{ttCopy(lang, "save")}</button>
      </>
    )}>
      <form id="tt-entry-form" className="tt-entry-form" onSubmit={submit}>
        <label className="tt-field">
          <span>{ttCopy(lang, "category")}</span>
          <div className="tt-chip-group">
            {categories.map((category) => (
              <button key={category.id} type="button" className={category.id === categoryId ? "is-selected" : ""} style={category.id === categoryId ? { borderColor: category.color } : undefined} onClick={() => { setCategoryId(category.id); setSubId(null); }}>
                <IconGlyph name={category.icon} size={13} />{textName(category.name, lang)}
              </button>
            ))}
          </div>
        </label>
        {currentCategory !== undefined && currentCategory.subs.length > 0 && (
          <label className="tt-field">
            <span>{ttCopy(lang, "subcategory")}</span>
            <div className="tt-chip-group">
              <button type="button" className={subId === null ? "is-selected" : ""} onClick={() => setSubId(null)}>{ttCopy(lang, "whole")}</button>
              {currentCategory.subs.map((sub) => (
                <button key={sub.id} type="button" className={sub.id === subId ? "is-selected" : ""} style={sub.id === subId ? { borderColor: currentCategory.color } : undefined} onClick={() => setSubId(sub.id)}>
                  {textName(sub.name, lang)}
                </button>
              ))}
            </div>
          </label>
        )}
        <div className="tt-field-grid">
          <label className="tt-field">
            <span>{ttCopy(lang, "startTime")}</span>
            <input type="datetime-local" value={startValue} onChange={(event) => setStartValue(event.target.value)} />
          </label>
          <label className="tt-field">
            <span>{ttCopy(lang, "endTime")}</span>
            {keepRunning ? <div className="tt-input-static"><span className="tt-live-dot" />{ttCopy(lang, "running")}</div> : <input type="datetime-local" value={endValue} onChange={(event) => setEndValue(event.target.value)} />}
          </label>
        </div>
        {wasRunning && (
          <label className="tt-check-row">
            <input type="checkbox" checked={keepRunning} onChange={(event) => setKeepRunning(event.target.checked)} />
            <span>{ttCopy(lang, "keepRunning")}</span>
          </label>
        )}
        <div className={`tt-duration-preview${valid ? "" : " is-invalid"}`}>
          <IconGlyph name="clock" size={14} />
          <span>{ttCopy(lang, "duration")}</span>
          <b>{valid ? formatDuration(Math.max(0, durationMs)) : "—"}</b>
        </div>
        <label className="tt-field">
          <span>{ttCopy(lang, "note")}</span>
          <input value={note} placeholder={ttCopy(lang, "notePlaceholder")} onChange={(event) => setNote(event.target.value)} />
        </label>
      </form>
    </Modal>
  );
}

function InsightsBoard({
  categories,
  entries,
  lang,
  nowMs,
  categoryMap,
  onDeleteRange,
}: {
  readonly categories: readonly TimeTrackerCategory[];
  readonly entries: readonly TimeTrackerEntry[];
  readonly lang: Lang;
  readonly nowMs: number;
  readonly categoryMap: ReadonlyMap<string, TimeTrackerCategory>;
  readonly onDeleteRange: (rangeEntries: readonly TimeTrackerEntry[], label: string) => void;
}) {
  const [range, setRange] = useState<InsightRange>("week");
  const [customStart, setCustomStart] = useState(() => dateInputValue(nowMs - 29 * DAY_MS));
  const [customEnd, setCustomEnd] = useState(() => dateInputValue(nowMs));
  const [cards, setCards] = useState(readInsightBoard);
  const [adding, setAdding] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(INSIGHTS_KEY, JSON.stringify(cards));
  }, [cards]);

  const customA = keyToDate(customStart);
  const customB = endOfDayExclusive(customEnd);
  const customRangeStart = Math.min(customA, customB - DAY_MS);
  const customRangeEnd = Math.max(customA + DAY_MS, customB);
  const rangeStart = range === "week"
    ? startOfWeek(nowMs)
    : range === "month"
      ? startOfMonth(nowMs)
      : range === "year"
        ? startOfYear(nowMs)
        : range === "custom"
          ? customRangeStart
          : 0;
  const rangeEnd = range === "custom" ? customRangeEnd : range === "all" ? Number.POSITIVE_INFINITY : startOfDay(nowMs) + DAY_MS;
  const inRange = entries.filter((entry) => {
    const start = entryStart(entry);
    return start >= rangeStart && start < rangeEnd;
  });
  const rangeTotal = inRange.reduce((total, entry) => total + entryDuration(entry, nowMs), 0);
  const activeInRange = inRange.filter(isActiveEntry).length;
  const reportLabel = rangeLabel(rangeStart, rangeEnd, lang);
  function addCard(type: InsightType): void {
    setCards((prev) => [...prev, { iid: uid("w"), type, catId: null }]);
    setAdding(false);
  }
  function reorder(drag: string, over: string): void {
    setCards((prev) => {
      const next = [...prev];
      const from = next.findIndex((card) => card.iid === drag);
      const to = next.findIndex((card) => card.iid === over);
      if (from < 0 || to < 0 || from === to) return prev;
      const [item] = next.splice(from, 1);
      if (item !== undefined) next.splice(to, 0, item);
      return next;
    });
	  }
	  return (
	    <section className="tt-insights-board">
	      <div className={`tt-report-head${filtersOpen ? " is-open" : ""}`}>
	        <div className="tt-report-summary">
	          <div className="tt-report-copy">
	            <span>{ttCopy(lang, "dateRange")}</span>
	            <strong>{reportLabel}</strong>
	            <em>{formatDuration(rangeTotal)} · {entryCountText(inRange.length, lang)}{activeInRange > 0 ? ` · ${ttCopy(lang, "runningCount")} × ${activeInRange}` : ""}</em>
	          </div>
	          <button type="button" className="tt-btn tt-btn-subtle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((value) => !value)}>
	            <IconGlyph name="sliders" size={14} />{filtersOpen ? ttCopy(lang, "hideFilters") : ttCopy(lang, "filters")}
	          </button>
	        </div>
	        <div className="tt-report-actions">
	          <button type="button" className="tt-btn" title={ttCopy(lang, "resetBoard")} onClick={() => setCards(defaultInsightBoard())}><IconGlyph name="sync" size={14} /></button>
	          <button type="button" className="tt-btn" disabled={inRange.length === 0} onClick={() => exportEntriesCsv(inRange, nowMs, lang, categoryMap, reportLabel)}>
	            <IconGlyph name="download" size={14} />{ttCopy(lang, "exportCsv")}
	          </button>
	          <button type="button" className="tt-btn tt-btn-danger" disabled={inRange.length === 0} onClick={() => onDeleteRange(inRange, reportLabel)}>
	            <IconGlyph name="trash" size={14} />{ttCopy(lang, "deleteRange")}
	          </button>
	          <div className="tt-add-menu-wrap">
	            <button type="button" className="tt-btn tt-btn-primary" onClick={() => setAdding((value) => !value)}>
	              <IconGlyph name="plus" size={14} />{ttCopy(lang, "addWidget")}
	            </button>
	            {adding && (
	              <>
	                <button type="button" className="tt-pop-scrim" aria-label={ttCopy(lang, "cancel")} onClick={() => setAdding(false)} />
	                <div className="tt-ins-menu">
	                  {INSIGHT_DEFS.map((def) => (
	                    <button type="button" key={def.type} onClick={() => addCard(def.type)}>
	                      <IconGlyph name={def.icon} size={14} />
	                      {ttCopy(lang, INSIGHT_TITLES[def.type])}
	                    </button>
	                  ))}
	                </div>
	              </>
	            )}
	          </div>
	        </div>
	        {filtersOpen && (
	          <div className="tt-report-filters">
	            <div className="tt-segment">
	              <button type="button" aria-selected={range === "week"} onClick={() => setRange("week")}>{ttCopy(lang, "rangeWeek")}</button>
	              <button type="button" aria-selected={range === "month"} onClick={() => setRange("month")}>{ttCopy(lang, "rangeMonth")}</button>
	              <button type="button" aria-selected={range === "year"} onClick={() => setRange("year")}>{ttCopy(lang, "rangeYear")}</button>
	              <button type="button" aria-selected={range === "custom"} onClick={() => setRange("custom")}>{ttCopy(lang, "rangeCustom")}</button>
	              <button type="button" aria-selected={range === "all"} onClick={() => setRange("all")}>{ttCopy(lang, "rangeAll")}</button>
	            </div>
	            {range === "custom" && (
	              <div className="tt-date-range">
	                <label>
	                  <span>{ttCopy(lang, "from")}</span>
	                  <input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
	                </label>
	                <label>
	                  <span>{ttCopy(lang, "to")}</span>
	                  <input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
	                </label>
	              </div>
	            )}
	          </div>
	        )}
	      </div>
      {cards.length === 0 ? (
        <div className="tt-empty">{ttCopy(lang, "emptyBoard")}</div>
      ) : (
        <div className="tt-ins-grid">
          {cards.map((card) => {
            const def = INSIGHT_DEFS.find((item) => item.type === card.type) ?? INSIGHT_DEFS[0]!;
            return (
              <article
                key={card.iid}
                className={`tt-ins-card tt-ins-span-${def.span}${dragId === card.iid ? " is-dragging" : ""}`}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  setDragId(card.iid);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (dragId !== null && dragId !== card.iid) reorder(dragId, card.iid);
                }}
                onDragEnd={() => setDragId(null)}
              >
                <div className="tt-ins-head">
                  <IconGlyph name="grip" size={14} />
                  <strong>{ttCopy(lang, INSIGHT_TITLES[card.type])}</strong>
                  {card.type === "sub-split" && (
                    <select value={card.catId ?? categories[0]?.id ?? ""} onChange={(event) => setCards((prev) => prev.map((item) => item.iid === card.iid ? { ...item, catId: event.target.value } : item))}>
                      {categories.map((category) => <option key={category.id} value={category.id}>{textName(category.name, lang)}</option>)}
                    </select>
                  )}
                  <span className="tt-head-spacer" />
                  <button type="button" aria-label={ttCopy(lang, "removeWidget")} onClick={() => setCards((prev) => prev.filter((item) => item.iid !== card.iid))}><IconGlyph name="close" size={14} /></button>
                </div>
                <InsightContent card={card} categories={categories} entries={entries} inRange={inRange} lang={lang} nowMs={nowMs} categoryMap={categoryMap} />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function InsightContent({
  card,
  categories,
  entries,
  inRange,
  lang,
  nowMs,
  categoryMap,
}: {
  readonly card: InsightCard;
  readonly categories: readonly TimeTrackerCategory[];
  readonly entries: readonly TimeTrackerEntry[];
  readonly inRange: readonly TimeTrackerEntry[];
  readonly lang: Lang;
  readonly nowMs: number;
  readonly categoryMap: ReadonlyMap<string, TimeTrackerCategory>;
}) {
  const today = dayKey(nowMs);
  const sum = (items: readonly TimeTrackerEntry[]) => items.reduce((total, entry) => total + entryDuration(entry, nowMs), 0);
  if (card.type === "today-total") {
    const todayRows = entries.filter((entry) => dayKey(entryStart(entry)) === today);
    const total = sum(todayRows);
    return (
      <InsightNumber
        value={formatDuration(total)}
        sub={entryCountText(todayRows.length, lang)}
        detail={detailText([ttCopy(lang, "todayTotal"), formatDuration(total), entryCountText(todayRows.length, lang)])}
      />
    );
  }
  if (card.type === "current") {
    const running = entries.filter(isRunningEntry);
    const runningTotal = sum(running);
    return (
      <InsightNumber
        value={running.length > 0 ? formatTimer(runningTotal) : "—"}
        sub={`${ttCopy(lang, "runningCount")} × ${running.length}`}
        live={running.length > 0}
        detail={detailText([ttCopy(lang, "currentRunning"), formatDuration(runningTotal), entryCountText(running.length, lang)])}
      />
    );
  }
  if (card.type === "week-total") {
    const rows = entries.filter((entry) => entryStart(entry) >= startOfWeek(nowMs));
    const total = sum(rows);
    return <InsightNumber value={formatDuration(total)} sub={ttCopy(lang, "week")} detail={detailText([ttCopy(lang, "week"), formatDuration(total), entryCountText(rows.length, lang)])} />;
  }
  if (card.type === "month-total") {
    const rows = entries.filter((entry) => entryStart(entry) >= startOfMonth(nowMs));
    const total = sum(rows);
    return <InsightNumber value={formatDuration(total)} sub={ttCopy(lang, "month")} detail={detailText([ttCopy(lang, "month"), formatDuration(total), entryCountText(rows.length, lang)])} />;
  }
  if (card.type === "avg-day") {
    const days = new Set(inRange.map((entry) => dayKey(entryStart(entry)))).size || 1;
    const total = sum(inRange);
    return <InsightNumber value={formatDuration(total / days)} sub={ttCopy(lang, "avgPerDay")} detail={detailText([`${days} ${ttCopy(lang, "daysTracked")}`, `${ttCopy(lang, "duration")}: ${formatDuration(total)}`])} />;
  }
  if (card.type === "days-tracked") {
    const days = new Set(inRange.map((entry) => dayKey(entryStart(entry)))).size;
    return <InsightNumber value={String(days)} sub={ttCopy(lang, "daysTracked")} detail={detailText([ttCopy(lang, "daysTracked"), `${days}`, entryCountText(inRange.length, lang)])} />;
  }
  if (card.type === "donut-today" || card.type === "donut-range") {
    const list = card.type === "donut-today" ? entries.filter((entry) => dayKey(entryStart(entry)) === today) : inRange;
    return <DistributionInsight list={list} nowMs={nowMs} lang={lang} categoryMap={categoryMap} />;
  }
  if (card.type === "cat-ranking") {
    return <RankingInsight list={inRange} nowMs={nowMs} lang={lang} categoryMap={categoryMap} />;
  }
  if (card.type === "goal-progress") {
    const list = entries.filter((entry) => dayKey(entryStart(entry)) === today);
    return <GoalInsight categories={categories} list={list} nowMs={nowMs} lang={lang} />;
  }
  if (card.type === "sub-split") {
    const category = categoryMap.get(card.catId ?? "") ?? categories[0];
    return category === undefined ? <NoData lang={lang} /> : <SubSplitInsight category={category} list={inRange.filter((entry) => entry.categoryId === category.id)} nowMs={nowMs} lang={lang} />;
  }
  if (card.type === "by-weekday") {
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const entry of inRange) {
      const bucket = (new Date(entryStart(entry)).getDay() + 6) % 7;
      buckets[bucket] = (buckets[bucket] ?? 0) + entryDuration(entry, nowMs);
      counts[bucket] = (counts[bucket] ?? 0) + 1;
    }
    const labels = lang === "zh" ? ["一", "二", "三", "四", "五", "六", "日"] : ["M", "T", "W", "T", "F", "S", "S"];
    return <MiniBars rows={buckets.map((value, index) => ({ key: String(index), value, label: labels[index] ?? "", title: formatDuration(value), detail: detailText([labels[index] ?? "", formatDuration(value), entryCountText(counts[index] ?? 0, lang)]) }))} />;
  }
  if (card.type === "trend-7d" || card.type === "trend-30d") {
    const count = card.type === "trend-7d" ? 7 : 30;
    const rows = Array.from({ length: count }, (_, index) => {
      const start = startOfDay(nowMs - (count - 1 - index) * DAY_MS);
      const key = dayKey(start);
      const dayEntries = entries.filter((entry) => dayKey(entryStart(entry)) === key);
      const value = dayEntries.reduce((total, entry) => total + entryDuration(entry, nowMs), 0);
      return {
        key,
        value,
        label: count === 7 ? shortWeekdayLabel(start, lang) : index % 5 === 0 ? formatDayLabel(start, lang) : "",
        title: formatDuration(value),
        detail: detailText([formatDayKeyLabel(key, lang), formatDuration(value), entryCountText(dayEntries.length, lang)]),
      };
    });
    return count === 7 ? <MiniBars rows={rows} /> : <LineChart rows={rows} />;
  }
  if (card.type === "by-hour") {
    const buckets = Array.from({ length: 24 }, () => 0);
    for (const entry of inRange) {
      for (const segment of entry.segments) {
        const bucket = new Date(segment.start).getHours();
        buckets[bucket] = (buckets[bucket] ?? 0) + Math.max(0, (segment.end ?? nowMs) - segment.start);
      }
    }
    return <HourChart values={buckets} lang={lang} />;
  }
  if (card.type === "heatmap") {
    return <Heatmap entries={entries} nowMs={nowMs} lang={lang} />;
  }
  if (card.type === "range-summary") {
    return <RangeSummaryInsight list={inRange} nowMs={nowMs} lang={lang} categoryMap={categoryMap} />;
  }
  if (card.type === "category-mosaic") {
    return <CategoryMosaicInsight list={inRange} nowMs={nowMs} lang={lang} categoryMap={categoryMap} />;
  }
  if (card.type === "focus-rhythm") {
    return <FocusRhythmInsight list={inRange} nowMs={nowMs} lang={lang} categoryMap={categoryMap} />;
  }
  if (card.type === "recent-sessions") {
    return <RecentSessionsInsight list={entries} nowMs={nowMs} lang={lang} categoryMap={categoryMap} />;
  }
  return null;
}

function InsightNumber({
  value,
  sub,
  live,
  detail,
}: {
  readonly value: ReactNode;
  readonly sub: ReactNode;
  readonly live?: boolean;
  readonly detail?: string;
}) {
  return (
    <div className={`tt-ins-num${detail !== undefined ? " tt-tip" : ""}`} data-tip={detail} tabIndex={detail !== undefined ? 0 : undefined}>
      <strong className={live === true ? "is-live" : ""}>{value}</strong>
      <span>{sub}</span>
    </div>
  );
}

function NoData({ lang }: { readonly lang: Lang }) {
  return <div className="tt-empty compact">{ttCopy(lang, "noData")}</div>;
}

function DistributionInsight({
  list,
  nowMs,
  lang,
  categoryMap,
}: {
  readonly list: readonly TimeTrackerEntry[];
  readonly nowMs: number;
  readonly lang: Lang;
  readonly categoryMap: ReadonlyMap<string, TimeTrackerCategory>;
}) {
  const segments = categorySummaries(list, nowMs, categoryMap, lang);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total <= 0) return <NoData lang={lang} />;
  return (
    <div className="tt-ins-donut">
      <Donut
        segments={segments.map((segment) => ({
          value: segment.value,
          color: segment.color,
          detail: detailText([segment.name, formatDuration(segment.value), percentText(segment.value, total), entryCountText(segment.count, lang)]),
        }))}
        total={total}
        centerTop={formatDuration(total)}
        centerSub={segments.length}
        size={132}
      />
      <ul className="tt-legend compact-list">
        {segments.slice(0, 6).map((segment) => (
          <li
            key={segment.categoryId}
            className="tt-tip"
            data-tip={detailText([segment.name, formatDuration(segment.value), percentText(segment.value, total), entryCountText(segment.count, lang)])}
            tabIndex={0}
          >
            <span style={{ background: segment.color }} />
            <strong>{segment.name}</strong>
            <b>{percentText(segment.value, total)}</b>
            <em>{formatDuration(segment.value)}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RankingInsight({
  list,
  nowMs,
  lang,
  categoryMap,
}: {
  readonly list: readonly TimeTrackerEntry[];
  readonly nowMs: number;
  readonly lang: Lang;
  readonly categoryMap: ReadonlyMap<string, TimeTrackerCategory>;
}) {
  const rows = categorySummaries(list, nowMs, categoryMap, lang);
  if (rows.length === 0) return <NoData lang={lang} />;
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <ul className="tt-hbars">
      {rows.map((row) => (
        <li
          key={row.categoryId}
          className="tt-tip"
          data-tip={detailText([row.name, formatDuration(row.value), `${Math.round(row.percent * 100)}%`, entryCountText(row.count, lang)])}
          tabIndex={0}
        >
          <IconGlyph name={row.icon} size={14} />
          <strong>{row.name}</strong>
          <span><i style={{ width: `${row.value / max * 100}%`, background: row.color }} /></span>
          <b>{formatHours(row.value)}</b>
          <em>{Math.round(row.percent * 100)}%</em>
        </li>
      ))}
    </ul>
  );
}

function GoalInsight({ categories, list, nowMs, lang }: { readonly categories: readonly TimeTrackerCategory[]; readonly list: readonly TimeTrackerEntry[]; readonly nowMs: number; readonly lang: Lang }) {
  const totals = totalByCategory(list, nowMs);
  const rows = categories.filter((category) => category.goalMin > 0);
  if (rows.length === 0) return <NoData lang={lang} />;
  return (
    <ul className="tt-hbars">
      {rows.map((category) => {
        const ms = totals.get(category.id) ?? 0;
        const pct = Math.min(100, Math.round(ms / 60_000 / category.goalMin * 100));
        return (
          <li
            key={category.id}
            className="tt-tip"
            data-tip={detailText([textName(category.name, lang), `${formatDuration(ms)} / ${category.goalMin}m`, `${pct}%`])}
            tabIndex={0}
          >
            <IconGlyph name={category.icon} size={14} />
            <strong>{textName(category.name, lang)}</strong>
            <span><i style={{ width: `${pct}%`, background: category.color }} /></span>
            <b>{pct}%</b>
          </li>
        );
      })}
    </ul>
  );
}

function SubSplitInsight({ category, list, nowMs, lang }: { readonly category: TimeTrackerCategory; readonly list: readonly TimeTrackerEntry[]; readonly nowMs: number; readonly lang: Lang }) {
  const totals = new Map<string, number>();
  for (const entry of list) totals.set(entry.subId ?? "_none", (totals.get(entry.subId ?? "_none") ?? 0) + entryDuration(entry, nowMs));
  const rows = [
    ...category.subs.map((sub) => ({ id: sub.id, name: textName(sub.name, lang), value: totals.get(sub.id) ?? 0 })),
    ...(totals.has("_none") ? [{ id: "_none", name: ttCopy(lang, "whole"), value: totals.get("_none") ?? 0 }] : []),
  ].filter((row) => row.value > 0).sort((a, b) => b.value - a.value);
  if (rows.length === 0) return <NoData lang={lang} />;
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <ul className="tt-hbars">
      {rows.map((row) => (
        <li key={row.id} className="tt-tip" data-tip={detailText([row.name, formatDuration(row.value)])} tabIndex={0}>
          <strong>{row.name}</strong>
          <span><i style={{ width: `${row.value / max * 100}%`, background: category.color }} /></span>
          <b>{formatDuration(row.value)}</b>
        </li>
      ))}
    </ul>
  );
}

function HourChart({ values, lang }: { readonly values: readonly number[]; readonly lang: Lang }) {
  const max = Math.max(...values, 1);
  const peak = values.indexOf(Math.max(...values));
  return (
    <div className="tt-hours">
      {values.map((value, index) => (
        <span
          key={index}
          className={`tt-tip${index === peak && value > 0 ? " is-peak" : ""}`}
          title={`${index}:00 · ${formatDuration(value)}`}
          data-tip={detailText([`${String(index).padStart(2, "0")}:00-${String((index + 1) % 24).padStart(2, "0")}:00`, formatDuration(value), index === peak && value > 0 ? ttCopy(lang, "peakHour") : ""])}
          tabIndex={0}
        >
          <i style={{ height: `${Math.max(2, value / max * 100)}%` }} />
          {index % 3 === 0 && <em>{String(index).padStart(2, "0")}</em>}
        </span>
      ))}
    </div>
  );
}

function LineChart({ rows }: { readonly rows: readonly InsightBarRow[] }) {
  const w = 600;
  const h = 160;
  const pad = 24;
  const max = Math.max(...rows.map((row) => row.value), 1);
  const x = (index: number) => pad + index * (w - pad * 2) / Math.max(1, rows.length - 1);
  const y = (value: number) => h - pad - value / max * (h - pad * 2);
  const path = rows.map((row, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(row.value).toFixed(1)}`).join(" ");
  const area = `${path} L${x(rows.length - 1)},${h - pad} L${x(0)},${h - pad} Z`;
  return (
    <div className="tt-line">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <path d={area} fill="color-mix(in oklch, var(--accent) 18%, transparent)" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="tt-line-points">
        {rows.map((row, index) => (
          <span
            key={row.key}
            className="tt-tip"
            data-tip={row.detail ?? row.title}
            style={{ left: `${x(index) / w * 100}%`, top: `${y(row.value) / h * 100}%` }}
            tabIndex={0}
          >
            <i />
          </span>
        ))}
      </div>
      <div>{rows.map((row, index) => row.label !== "" ? <span key={index} style={{ left: `${x(index) / w * 100}%` }}>{row.label}</span> : null)}</div>
    </div>
  );
}

function Heatmap({ entries, nowMs, lang }: { readonly entries: readonly TimeTrackerEntry[]; readonly nowMs: number; readonly lang: Lang }) {
  const weeks = 15;
  const cells: Array<{ readonly key: string; readonly value: number; readonly count: number }> = [];
  let max = 1;
  const today = startOfDay(nowMs);
  const start = today - (weeks * 7 - 1) * DAY_MS;
  for (let index = 0; index < weeks * 7; index += 1) {
    const ts = start + index * DAY_MS;
    const key = dayKey(ts);
    const rows = entries.filter((entry) => dayKey(entryStart(entry)) === key);
    const value = rows.reduce((total, entry) => total + entryDuration(entry, nowMs), 0);
    max = Math.max(max, value);
    cells.push({ key, value, count: rows.length });
  }
  return (
    <div className="tt-heatmap">
      {cells.map((cell) => {
        const level = cell.value === 0 ? 0 : cell.value < max * 0.25 ? 1 : cell.value < max * 0.5 ? 2 : cell.value < max * 0.75 ? 3 : 4;
        return (
          <span
            key={cell.key}
            className={`tt-tip heat-${level}`}
            title={formatDuration(cell.value)}
            data-tip={detailText([formatDayKeyLabel(cell.key, lang), formatDuration(cell.value), entryCountText(cell.count, lang)])}
            tabIndex={0}
          />
        );
      })}
    </div>
  );
}

function RangeSummaryInsight({
  list,
  nowMs,
  lang,
  categoryMap,
}: {
  readonly list: readonly TimeTrackerEntry[];
  readonly nowMs: number;
  readonly lang: Lang;
  readonly categoryMap: ReadonlyMap<string, TimeTrackerCategory>;
}) {
  const total = list.reduce((sum, entry) => sum + entryDuration(entry, nowMs), 0);
  if (total <= 0) return <NoData lang={lang} />;
  const dayTotals = new Map<string, { value: number; count: number }>();
  const hourTotals = Array.from({ length: 24 }, () => 0);
  let longest: TimeTrackerEntry | undefined;
  for (const entry of list) {
    const key = dayKey(entryStart(entry));
    const value = entryDuration(entry, nowMs);
    const current = dayTotals.get(key) ?? { value: 0, count: 0 };
    dayTotals.set(key, { value: current.value + value, count: current.count + 1 });
    for (const segment of entry.segments) {
      const hour = new Date(segment.start).getHours();
      hourTotals[hour] = (hourTotals[hour] ?? 0) + Math.max(0, (segment.end ?? nowMs) - segment.start);
    }
    if (longest === undefined || value > entryDuration(longest, nowMs)) longest = entry;
  }
  const bestDay = Array.from(dayTotals.entries()).sort((a, b) => b[1].value - a[1].value)[0];
  const peakHour = hourTotals.indexOf(Math.max(...hourTotals));
  const longestCategory = longest !== undefined ? categoryMap.get(longest.categoryId) : undefined;
  return (
    <div className="tt-summary-grid">
      <InsightMetric
        icon="calendar"
        label={ttCopy(lang, "bestDay")}
        value={bestDay !== undefined ? formatDayKeyLabel(bestDay[0], lang) : "—"}
        detail={bestDay !== undefined ? detailText([formatDayKeyLabel(bestDay[0], lang), formatDuration(bestDay[1].value), entryCountText(bestDay[1].count, lang)]) : undefined}
      />
      <InsightMetric
        icon="timer"
        label={ttCopy(lang, "peakHour")}
        value={`${String(peakHour).padStart(2, "0")}:00`}
        detail={detailText([`${String(peakHour).padStart(2, "0")}:00`, formatDuration(hourTotals[peakHour] ?? 0)])}
      />
      <InsightMetric
        icon="target"
        label={ttCopy(lang, "averageSession")}
        value={formatDuration(total / Math.max(1, list.length))}
        detail={detailText([entryCountText(list.length, lang), `${ttCopy(lang, "duration")}: ${formatDuration(total)}`])}
      />
      <InsightMetric
        icon={longestCategory?.icon ?? "clock"}
        label={ttCopy(lang, "longestSession")}
        value={longest !== undefined ? formatDuration(entryDuration(longest, nowMs)) : "—"}
        detail={longest !== undefined ? entryDetail(longest, longestCategory, nowMs, lang) : undefined}
      />
    </div>
  );
}

function InsightMetric({
  icon,
  label,
  value,
  detail,
}: {
  readonly icon: string;
  readonly label: string;
  readonly value: ReactNode;
  readonly detail?: string;
}) {
  return (
    <div className={`tt-metric tt-tip${detail !== undefined ? "" : " no-tip"}`} data-tip={detail} tabIndex={detail !== undefined ? 0 : undefined}>
      <IconGlyph name={icon} size={15} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CategoryMosaicInsight({
  list,
  nowMs,
  lang,
  categoryMap,
}: {
  readonly list: readonly TimeTrackerEntry[];
  readonly nowMs: number;
  readonly lang: Lang;
  readonly categoryMap: ReadonlyMap<string, TimeTrackerCategory>;
}) {
  const rows = categorySummaries(list, nowMs, categoryMap, lang);
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (total <= 0) return <NoData lang={lang} />;
  return (
    <div className="tt-mosaic">
      {rows.slice(0, 8).map((row) => {
        const span = Math.min(6, Math.max(2, Math.round(row.percent * 8)));
        return (
          <div
            key={row.categoryId}
            className="tt-mosaic-tile tt-tip"
            data-tip={detailText([row.name, formatDuration(row.value), percentText(row.value, total), entryCountText(row.count, lang)])}
            style={{ "--tt-accent": row.color, gridColumn: `span ${span}` } as CSSProperties}
            tabIndex={0}
          >
            <IconGlyph name={row.icon} size={16} />
            <strong>{row.name}</strong>
            <span>{percentText(row.value, total)}</span>
            <b>{formatDuration(row.value)}</b>
          </div>
        );
      })}
    </div>
  );
}

function FocusRhythmInsight({
  list,
  nowMs,
  lang,
  categoryMap,
}: {
  readonly list: readonly TimeTrackerEntry[];
  readonly nowMs: number;
  readonly lang: Lang;
  readonly categoryMap: ReadonlyMap<string, TimeTrackerCategory>;
}) {
  const hours = Array.from({ length: 24 }, () => ({ total: 0, count: 0, categoryTotals: new Map<string, number>() }));
  for (const entry of list) {
    for (const segment of entry.segments) {
      const hour = new Date(segment.start).getHours();
      const value = Math.max(0, (segment.end ?? nowMs) - segment.start);
      const bucket = hours[hour];
      if (bucket === undefined) continue;
      bucket.total += value;
      bucket.count += 1;
      bucket.categoryTotals.set(entry.categoryId, (bucket.categoryTotals.get(entry.categoryId) ?? 0) + value);
    }
  }
  const max = Math.max(...hours.map((hour) => hour.total), 1);
  if (max <= 1) return <NoData lang={lang} />;
  return (
    <div className="tt-rhythm">
      {hours.map((hour, index) => {
        const dominantId = Array.from(hour.categoryTotals.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
        const category = dominantId !== undefined ? categoryMap.get(dominantId) : undefined;
        return (
          <span
            key={index}
            className="tt-tip"
            data-tip={detailText([
              `${String(index).padStart(2, "0")}:00-${String((index + 1) % 24).padStart(2, "0")}:00`,
              formatDuration(hour.total),
              category !== undefined ? textName(category.name, lang) : "",
              entryCountText(hour.count, lang),
            ])}
            style={{ "--tt-accent": category?.color ?? "var(--accent)", "--rhythm-height": `${Math.max(8, hour.total / max * 100)}%` } as CSSProperties}
            tabIndex={0}
          >
            <i />
            {index % 4 === 0 && <em>{String(index).padStart(2, "0")}</em>}
          </span>
        );
      })}
    </div>
  );
}

function RecentSessionsInsight({
  list,
  nowMs,
  lang,
  categoryMap,
}: {
  readonly list: readonly TimeTrackerEntry[];
  readonly nowMs: number;
  readonly lang: Lang;
  readonly categoryMap: ReadonlyMap<string, TimeTrackerCategory>;
}) {
  const rows = [...list].sort((a, b) => entryLastEnd(b, nowMs) - entryLastEnd(a, nowMs)).slice(0, 5);
  if (rows.length === 0) return <NoData lang={lang} />;
  return (
    <ul className="tt-session-list">
      {rows.map((entry) => {
        const category = categoryMap.get(entry.categoryId);
        const note = entry.note[lang] || entry.note.en;
        return (
          <li
            key={entry.id}
            className="tt-tip"
            data-tip={entryDetail(entry, category, nowMs, lang)}
            style={{ "--tt-accent": category?.color ?? "var(--accent)" } as CSSProperties}
            tabIndex={0}
          >
            <span><IconGlyph name={category?.icon ?? "timer"} size={14} /></span>
            <div>
              <strong>{textName(category?.name, lang)} · {subcategoryLabel(entry, category, lang)}</strong>
              <em>{formatClock(entryStart(entry))} - {formatClock(entryLastEnd(entry, nowMs))}</em>
              {note !== "" && <small>{note}</small>}
            </div>
            <b>{formatDuration(entryDuration(entry, nowMs))}</b>
          </li>
        );
      })}
    </ul>
  );
}

function Modal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  readonly title: ReactNode;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly wide?: boolean;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="tt-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={`tt-dialog${wide === true ? " is-wide" : ""}`} role="dialog" aria-modal="true">
        <div className="tt-dialog-head">
          <h2>{title}</h2>
          <button type="button" aria-label="close" onClick={onClose}><IconGlyph name="close" size={16} /></button>
        </div>
        <div className="tt-dialog-body">{children}</div>
        {footer !== undefined && <div className="tt-dialog-actions">{footer}</div>}
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  danger,
  lang,
  onClose,
  onConfirm,
}: {
  readonly title: string;
  readonly body: string | undefined;
  readonly confirmLabel: string;
  readonly danger: boolean;
  readonly lang: Lang;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose} footer={(
      <>
        <span className="tt-head-spacer" />
        <button type="button" className="tt-btn" onClick={onClose}>{ttCopy(lang, "cancel")}</button>
        <button type="button" className={`tt-btn ${danger ? "tt-btn-danger" : "tt-btn-primary"}`} onClick={onConfirm}>{confirmLabel}</button>
      </>
    )}>
      {body !== undefined && body !== "" && <p className="tt-confirm-body">{body}</p>}
    </Modal>
  );
}
