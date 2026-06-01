import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import type { Lang, TimeTrackerCategory, TimeTrackerEntry } from "./types.js";
import { ttCopy } from "./internal/copy.js";
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
  dayKey,
  entryDuration,
  entryStart,
  formatClock,
  formatDayLabel,
  formatDuration,
  formatTimer,
  fromInputValue,
  isActiveEntry,
  isPausedEntry,
  isRunningEntry,
  startOfDay,
  startOfWeek,
  toInputValue,
} from "./internal/time.js";
import { IconCategory, IconChart, IconPause, IconPlay, IconPlus, IconStop, IconTimer } from "./internal/icons.js";

export interface TimeTrackerModuleProps {
  readonly lang: Lang;
}

export function TimeTrackerModule({ lang }: TimeTrackerModuleProps) {
  const [categories] = useTimeTrackerCategories();
  const [entries, setEntries] = useTimeTrackerEntries();
  const [mode, setMode] = useTimeTrackerMode();
  const [view, setView] = useState<"tracker" | "insights">("tracker");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [manualOpen, setManualOpen] = useState(false);

  const categoryMap = useCategoryMap(categories);
  const liveEntries = useMemo(() => entries.filter((entry) => entry.deleted !== true), [entries]);
  const activeEntries = useMemo(() => liveEntries.filter(isActiveEntry), [liveEntries]);
  const todayStart = startOfDay(nowMs);
  const weekStart = startOfWeek(nowMs);
  const todayEntries = useMemo(() => liveEntries.filter((entry) => entryStart(entry) >= todayStart), [liveEntries, todayStart]);
  const weekTotal = useMemo(() => liveEntries.filter((entry) => entryStart(entry) >= weekStart).reduce((total, entry) => total + entryDuration(entry, nowMs), 0), [liveEntries, nowMs, weekStart]);
  const todayTotal = useMemo(() => todayEntries.reduce((total, entry) => total + entryDuration(entry, nowMs), 0), [nowMs, todayEntries]);
  const hasRunning = activeEntries.some(isRunningEntry);

  useEffect(() => {
    if (!hasRunning) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hasRunning]);

  function startCategory(categoryId: string, subId: string | null = null): void {
    const stamp = Date.now();
    const nextEntry = createTimeTrackerEntry(categoryId, subId, stamp, null, { en: "", zh: "" });
    setEntries((prev) => {
      const finished = mode === "single" ? prev.map((entry) => (isActiveEntry(entry) ? finishTimeTrackerEntry(entry, stamp) : entry)) : prev;
      return [...finished, nextEntry];
    });
    setNowMs(stamp);
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
          <div className="tt-segment" aria-label="Time tracker mode">
            <button type="button" aria-selected={mode === "single"} onClick={() => setMode("single")}>{ttCopy(lang, "single")}</button>
            <button type="button" aria-selected={mode === "multi"} onClick={() => setMode("multi")}>{ttCopy(lang, "multi")}</button>
          </div>
          <button type="button" className="tt-btn tt-btn-primary" onClick={() => setManualOpen(true)}>
            <IconPlus size={15} />
            {ttCopy(lang, "addRecord")}
          </button>
        </div>
      </header>

      {view === "tracker" ? (
        <div className="tt-layout">
          <main className="tt-main">
            {activeEntries.length > 0 && (
              <section className="tt-panel">
                <div className="tt-section-head">
                  <h2>{ttCopy(lang, "active")}</h2>
                  <span>{activeEntries.length}</span>
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
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="tt-panel">
              <div className="tt-section-head">
                <h2>{ttCopy(lang, "categories")}</h2>
                <span>{categories.length}</span>
              </div>
              <div className="tt-category-grid">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    lang={lang}
                    todayMs={todayEntries.filter((entry) => entry.categoryId === category.id).reduce((total, entry) => total + entryDuration(entry, nowMs), 0)}
                    running={activeEntries.some((entry) => entry.categoryId === category.id && isRunningEntry(entry))}
                    onStart={startCategory}
                  />
                ))}
              </div>
            </section>

            <section className="tt-panel">
              <div className="tt-section-head">
                <h2>{ttCopy(lang, "records")}</h2>
                <span>{formatDayLabel(todayStart, lang)}</span>
              </div>
              {todayEntries.length === 0 ? (
                <div className="tt-empty">{ttCopy(lang, "noRecords")}</div>
              ) : (
                <ul className="tt-record-list">
                  {todayEntries
                    .slice()
                    .sort((a, b) => entryStart(b) - entryStart(a))
                    .map((entry) => (
                      <RecordRow
                        key={entry.id}
                        entry={entry}
                        category={categoryMap.get(entry.categoryId)}
                        lang={lang}
                        nowMs={nowMs}
                        onDelete={deleteEntry}
                      />
                    ))}
                </ul>
              )}
            </section>
          </main>

          <aside className="tt-sidebar">
            <div className="tt-stat-card">
              <span>{ttCopy(lang, "today")}</span>
              <strong>{formatDuration(todayTotal)}</strong>
              <small>{todayEntries.length} {ttCopy(lang, "records").toLowerCase()}</small>
            </div>
            <div className="tt-stat-card">
              <span>{ttCopy(lang, "week")}</span>
              <strong>{formatDuration(weekTotal)}</strong>
              <small>{activeEntries.length} {ttCopy(lang, "running").toLowerCase()}</small>
            </div>
            <TrendChart entries={liveEntries} lang={lang} nowMs={nowMs} />
          </aside>
        </div>
      ) : (
        <InsightsView categories={categories} entries={liveEntries} lang={lang} nowMs={nowMs} />
      )}

      {manualOpen && (
        <ManualRecordDialog
          categories={categories}
          lang={lang}
          onClose={() => setManualOpen(false)}
          onSave={(entry) => {
            setEntries((prev) => [...prev, entry]);
            setManualOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CategoryCard({
  category,
  lang,
  todayMs,
  running,
  onStart,
}: {
  readonly category: TimeTrackerCategory;
  readonly lang: Lang;
  readonly todayMs: number;
  readonly running: boolean;
  readonly onStart: (categoryId: string, subId: string | null) => void;
}) {
  const pct = category.goalMin > 0 ? Math.min(100, Math.round(todayMs / 60_000 / category.goalMin * 100)) : 0;
  const primarySub = category.subs[0];
  return (
    <article className={`tt-category-card${running ? " is-running" : ""}`} style={{ "--tt-accent": category.color } as CSSProperties}>
      <div className="tt-category-top">
        <span className="tt-category-icon"><IconCategory kind={category.icon} size={18} /></span>
        <div>
          <h3>{category.name[lang]}</h3>
          <p>{formatDuration(todayMs)} / {category.goalMin}m {ttCopy(lang, "goal")}</p>
        </div>
      </div>
      <div className="tt-progress"><span style={{ width: `${pct}%` }} /></div>
      <div className="tt-category-actions" data-no-drag>
        <button type="button" onClick={() => onStart(category.id, null)}>
          <IconPlay size={14} />
          {ttCopy(lang, "start")}
        </button>
        {primarySub !== undefined && (
          <button type="button" onClick={() => onStart(category.id, primarySub.id)}>{primarySub.name[lang]}</button>
        )}
      </div>
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
}: {
  readonly entry: TimeTrackerEntry;
  readonly category: TimeTrackerCategory | undefined;
  readonly lang: Lang;
  readonly nowMs: number;
  readonly onPause: (entryId: string) => void;
  readonly onResume: (entryId: string) => void;
  readonly onStop: (entryId: string) => void;
}) {
  const running = isRunningEntry(entry);
  return (
    <article className="tt-active-row">
      <span className="tt-live-dot" />
      <div>
        <strong>{category?.name[lang] ?? entry.categoryId}</strong>
        <span>{formatClock(entryStart(entry))} - {running ? ttCopy(lang, "running") : ttCopy(lang, "pause")}</span>
      </div>
      <b>{formatTimer(entryDuration(entry, nowMs))}</b>
      <div className="tt-active-actions" data-no-drag>
        {isPausedEntry(entry) ? (
          <button type="button" onClick={() => onResume(entry.id)} aria-label={ttCopy(lang, "resume")}><IconPlay size={15} /></button>
        ) : (
          <button type="button" onClick={() => onPause(entry.id)} aria-label={ttCopy(lang, "pause")}><IconPause size={15} /></button>
        )}
        <button type="button" onClick={() => onStop(entry.id)} aria-label={ttCopy(lang, "end")}><IconStop size={15} /></button>
      </div>
    </article>
  );
}

function RecordRow({
  entry,
  category,
  lang,
  nowMs,
  onDelete,
}: {
  readonly entry: TimeTrackerEntry;
  readonly category: TimeTrackerCategory | undefined;
  readonly lang: Lang;
  readonly nowMs: number;
  readonly onDelete: (entryId: string) => void;
}) {
  return (
    <li className="tt-record-row">
      <span className="tt-record-color" style={{ background: category?.color ?? "var(--accent)" }} />
      <div>
        <strong>{category?.name[lang] ?? entry.categoryId}</strong>
        <span>{formatClock(entryStart(entry))} - {formatClock(entry.segments.at(-1)?.end ?? nowMs)}</span>
        {entry.note[lang] !== "" && <em>{entry.note[lang]}</em>}
      </div>
      <b>{formatDuration(entryDuration(entry, nowMs))}</b>
      <button type="button" className="tt-link-btn" onClick={() => onDelete(entry.id)}>{ttCopy(lang, "delete")}</button>
    </li>
  );
}

function TrendChart({ entries, lang, nowMs }: { readonly entries: readonly TimeTrackerEntry[]; readonly lang: Lang; readonly nowMs: number }) {
  const rows = Array.from({ length: 7 }, (_, index) => {
    const start = startOfDay(nowMs - (6 - index) * DAY_MS);
    const total = entries
      .filter((entry) => dayKey(entryStart(entry)) === dayKey(start))
      .reduce((sum, entry) => sum + entryDuration(entry, nowMs), 0);
    return { key: dayKey(start), label: formatDayLabel(start, lang), total };
  });
  const max = Math.max(...rows.map((row) => row.total), 1);
  return (
    <div className="tt-trend-card">
      <div className="tt-section-head">
        <h2>{ttCopy(lang, "sevenDays")}</h2>
      </div>
      <div className="tt-bars" aria-label={ttCopy(lang, "sevenDays")}>
        {rows.map((row) => (
          <div key={row.key} className="tt-bar">
            <span style={{ height: `${Math.max(8, row.total / max * 100)}%` }} title={`${row.label}: ${formatDuration(row.total)}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsView({
  categories,
  entries,
  lang,
  nowMs,
}: {
  readonly categories: readonly TimeTrackerCategory[];
  readonly entries: readonly TimeTrackerEntry[];
  readonly lang: Lang;
  readonly nowMs: number;
}) {
  const todayStart = startOfDay(nowMs);
  const todayEntries = entries.filter((entry) => entryStart(entry) >= todayStart);
  const totals = categories
    .map((category) => ({
      category,
      total: todayEntries.filter((entry) => entry.categoryId === category.id).reduce((sum, entry) => sum + entryDuration(entry, nowMs), 0),
    }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);
  const totalMs = totals.reduce((sum, row) => sum + row.total, 0);
  return (
    <section className="tt-insights">
      <div className="tt-insights-hero">
        <IconChart size={24} />
        <div>
          <h2>{ttCopy(lang, "distribution")}</h2>
          <p>{totalMs > 0 ? formatDuration(totalMs) : ttCopy(lang, "emptyInsights")}</p>
        </div>
      </div>
      <div className="tt-insight-list">
        {totals.map((row) => (
          <div key={row.category.id} className="tt-insight-row">
            <span className="tt-record-color" style={{ background: row.category.color }} />
            <strong>{row.category.name[lang]}</strong>
            <div className="tt-insight-track"><span style={{ width: `${Math.round(row.total / totalMs * 100)}%`, background: row.category.color }} /></div>
            <b>{formatDuration(row.total)}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function ManualRecordDialog({
  categories,
  lang,
  onClose,
  onSave,
}: {
  readonly categories: readonly TimeTrackerCategory[];
  readonly lang: Lang;
  readonly onClose: () => void;
  readonly onSave: (entry: TimeTrackerEntry) => void;
}) {
  const firstCategory = categories[0];
  const [categoryId, setCategoryId] = useState(firstCategory?.id ?? "");
  const currentCategory = categories.find((category) => category.id === categoryId) ?? firstCategory;
  const [subId, setSubId] = useState<string>("");
  const [start, setStart] = useState(() => toInputValue(Date.now() - 30 * 60_000));
  const [end, setEnd] = useState(() => toInputValue(Date.now()));
  const [note, setNote] = useState("");

  function submit(e: FormEvent): void {
    e.preventDefault();
    if (currentCategory === undefined) return;
    const startMs = fromInputValue(start, Date.now() - 30 * 60_000);
    const endMsRaw = fromInputValue(end, Date.now());
    const endMs = endMsRaw > startMs ? endMsRaw : startMs + 30 * 60_000;
    onSave(createTimeTrackerEntry(categoryId, subId === "" ? null : subId, startMs, endMs, { en: note, zh: note }));
  }

  return (
    <div className="tt-dialog-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="tt-dialog" role="dialog" aria-modal="true" aria-label={ttCopy(lang, "manualTitle")} onSubmit={submit}>
        <h2>{ttCopy(lang, "manualTitle")}</h2>
        <label>
          <span>{ttCopy(lang, "category")}</span>
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubId(""); }}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name[lang]}</option>)}
          </select>
        </label>
        <label>
          <span>{ttCopy(lang, "subcategory")}</span>
          <select value={subId} onChange={(e) => setSubId(e.target.value)}>
            <option value="">{ttCopy(lang, "wholeCategory")}</option>
            {currentCategory?.subs.map((sub) => <option key={sub.id} value={sub.id}>{sub.name[lang]}</option>)}
          </select>
        </label>
        <label>
          <span>{ttCopy(lang, "startTime")}</span>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label>
          <span>{ttCopy(lang, "endTime")}</span>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <label>
          <span>{ttCopy(lang, "note")}</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <div className="tt-dialog-actions">
          <button type="button" className="tt-btn" onClick={onClose}>{ttCopy(lang, "cancel")}</button>
          <button type="submit" className="tt-btn tt-btn-primary">{ttCopy(lang, "save")}</button>
        </div>
      </form>
    </div>
  );
}
