# TT-01 / TT-03 caller source inventory

Baseline HEAD: `7102f225282028fc59de901b2b634e201558f726`. Read-only inventory; lines are baseline references.

| File | Line | Enclosing declaration | Source |
|---|---:|---|---|
| `packages/plugin-web-time-tracker/src/internal/time.ts` | 53 | `entryStart` | `export function entryStart(entry: TimeTrackerEntry): number {` |
| `packages/plugin-web-time-tracker/src/internal/time.ts` | 61 | `segmentDuration` | `export function segmentDuration(segment: TimeTrackerSegment, nowMs: number): number {` |
| `packages/plugin-web-time-tracker/src/internal/time.ts` | 62 | `segmentDuration` | `const end = segment.end ?? nowMs;` |
| `packages/plugin-web-time-tracker/src/internal/time.ts` | 63 | `segmentDuration` | `return Math.max(0, end - segment.start);` |
| `packages/plugin-web-time-tracker/src/internal/time.ts` | 66 | `entryDuration` | `export function entryDuration(entry: TimeTrackerEntry, nowMs: number): number {` |
| `packages/plugin-web-time-tracker/src/internal/time.ts` | 67 | `entryDuration` | `return entry.segments.reduce((total, segment) => total + segmentDuration(segment, nowMs), 0);` |
| `packages/plugin-web-time-tracker/src/internal/storage.ts` | 4 | `module` | `import { entryDuration, entryStart, isRunningEntry, startOfDay, startOfWeek } from "./time.js";` |
| `packages/plugin-web-time-tracker/src/internal/storage.ts` | 165 | `finishTimeTrackerEntry` | `if (index !== entry.segments.length - 1 &#124;&#124; segment.end !== null) return segment;` |
| `packages/plugin-web-time-tracker/src/internal/storage.ts` | 173 | `pauseTimeTrackerEntry` | `if (index !== entry.segments.length - 1 &#124;&#124; segment.end !== null) return segment;` |
| `packages/plugin-web-time-tracker/src/internal/storage.ts` | 187 | `getTimeTrackerSnapshot` | `export function getTimeTrackerSnapshot(nowMs = Date.now()): TimeTrackerSnapshot {` |
| `packages/plugin-web-time-tracker/src/internal/storage.ts` | 192 | `getTimeTrackerSnapshot` | `const todayEntries = entries.filter((entry) => entryStart(entry) >= todayStart);` |
| `packages/plugin-web-time-tracker/src/internal/storage.ts` | 193 | `getTimeTrackerSnapshot` | `const weekEntries = entries.filter((entry) => entryStart(entry) >= weekStart);` |
| `packages/plugin-web-time-tracker/src/internal/storage.ts` | 197 | `getTimeTrackerSnapshot` | `byCategory.set(entry.categoryId, (byCategory.get(entry.categoryId) ?? 0) + entryDuration(entry, nowMs));` |
| `packages/plugin-web-time-tracker/src/internal/storage.ts` | 202 | `getTimeTrackerSnapshot` | `todayTotalMs: todayEntries.reduce((total, entry) => total + entryDuration(entry, nowMs), 0),` |
| `packages/plugin-web-time-tracker/src/internal/storage.ts` | 203 | `getTimeTrackerSnapshot` | `weekTotalMs: weekEntries.reduce((total, entry) => total + entryDuration(entry, nowMs), 0),` |
| `packages/plugin-web-time-tracker/src/internal/storage.ts` | 205 | `getTimeTrackerSnapshot` | `activeTotalMs: activeEntries.reduce((total, entry) => total + entryDuration(entry, nowMs), 0),` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 23 | `module` | `entryDuration,` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 25 | `module` | `entryStart,` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 565 | `TimeTrackerModule` | `() => liveEntries.filter((entry) => dayKey(entryStart(entry)) === selectedKey),` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 569 | `TimeTrackerModule` | `() => selectedEntries.filter((entry) => entry.done).sort((a, b) => entryStart(b) - entryStart(a)),` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 572 | `TimeTrackerModule` | `const selectedByCategory = useMemo(() => totalByCategory(selectedEntries, nowMs), [nowMs, selectedEntries]);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 573 | `TimeTrackerModule` | `const selectedTotal = useMemo(() => selectedEntries.reduce((total, entry) => total + entryDuration(entry, nowMs), 0), [nowMs, selectedEntries]);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 574 | `TimeTrackerModule` | `const todayEntries = useMemo(() => liveEntries.filter((entry) => dayKey(entryStart(entry)) === todayKey), [liveEntries, todayKey]);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 575 | `TimeTrackerModule` | `const todayTotal = useMemo(() => todayEntries.reduce((total, entry) => total + entryDuration(entry, nowMs), 0), [nowMs, todayEntries]);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 577 | `TimeTrackerModule` | `() => liveEntries.filter((entry) => entryStart(entry) >= weekStart).reduce((total, entry) => total + entryDuration(entry, nowMs), 0),` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 580 | `TimeTrackerModule` | `const trend = useMemo(() => buildDayTrend(liveEntries, nowMs, lang, selectedKey), [lang, liveEntries, nowMs, selectedKey]);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1022 | `totalByCategory` | `function totalByCategory(entries: readonly TimeTrackerEntry[], nowMs: number): Map<string, number> {` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1025 | `totalByCategory` | `totals.set(entry.categoryId, (totals.get(entry.categoryId) ?? 0) + entryDuration(entry, nowMs));` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1436 | `categorySummaries` | `function categorySummaries(` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1445 | `categorySummaries` | `buckets.set(entry.categoryId, { value: current.value + entryDuration(entry, nowMs), count: current.count + 1 });` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1473 | `entryDetail` | ``${formatClock(entryStart(entry))} - ${formatClock(entryLastEnd(entry, nowMs))}`,` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1474 | `entryDetail` | ``${ttCopy(lang, "duration")}: ${formatDuration(entryDuration(entry, nowMs))}`,` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1498 | `exportEntriesCsv` | `function exportEntriesCsv(` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1508 | `exportEntriesCsv` | `const start = entryStart(entry);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1510 | `exportEntriesCsv` | `const duration = entryDuration(entry, nowMs);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1528 | `buildDayTrend` | `function buildDayTrend(entries: readonly TimeTrackerEntry[], nowMs: number, lang: Lang, selectedKey: string) {` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1532 | `buildDayTrend` | `const dayEntries = entries.filter((entry) => dayKey(entryStart(entry)) === key);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1534 | `buildDayTrend` | `.filter((entry) => dayKey(entryStart(entry)) === key)` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1535 | `buildDayTrend` | `.reduce((sum, entry) => sum + entryDuration(entry, nowMs), 0);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1640 | `CategoryCard` | `const todayMs = todayEntries.reduce((total, entry) => total + entryDuration(entry, nowMs), 0);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1823 | `ActiveSession` | `<span>{running ? <><span className="tt-live-dot" />{ttCopy(lang, "running")}</> : ttCopy(lang, "paused")} · {formatClock(entryStart(entry))}</span>` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1825 | `ActiveSession` | `<b>{formatTimer(entryDuration(entry, nowMs))}</b>` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1941 | `FocusModeOverlay` | `<strong className="tt-focus-time">{formatTimer(entryDuration(entry, nowMs))}</strong>` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1945 | `FocusModeOverlay` | `<b>{formatDuration(entryDuration(entry, nowMs))}</b>` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 1949 | `FocusModeOverlay` | `<b>{formatClockFull(entryStart(entry))}</b>` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2004 | `RecordRow` | `const entryStartMs = toSecondMs(entryStart(entry));` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2078 | `RecordRow` | `<b>{formatDuration(entryDuration(entry, nowMs))}</b>` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2337 | `CategoryDetail` | `const dayEntries = entries.filter((entry) => entry.categoryId === category.id && dayKey(entryStart(entry)) === selectedKey);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2338 | `CategoryDetail` | `const total = dayEntries.reduce((sum, entry) => sum + entryDuration(entry, nowMs), 0);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2341 | `CategoryDetail` | `bySub.set(entry.subId ?? "_none", (bySub.get(entry.subId ?? "_none") ?? 0) + entryDuration(entry, nowMs));` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2682 | `EntryEditor` | `const baseDay = entry === undefined ? keyToDate(defaultDayKey) : entryStart(entry);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2687 | `EntryEditor` | `const [startValue, setStartValue] = useState(() => toInputValue(entry === undefined ? baseDay + 9 * 3_600_000 : entryStart(entry)));` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2803 | `InsightsBoard` | `const rangeStart = range === "week"` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2812 | `InsightsBoard` | `const rangeEnd = range === "custom" ? customRangeEnd : range === "all" ? Number.POSITIVE_INFINITY : nextLocalDayStart(nowMs).getTime();` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2814 | `InsightsBoard` | `const start = entryStart(entry);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2815 | `InsightsBoard` | `return start >= rangeStart && start < rangeEnd;` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2817 | `InsightsBoard` | `const rangeTotal = inRange.reduce((total, entry) => total + entryDuration(entry, nowMs), 0);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2819 | `InsightsBoard` | `const reportLabel = rangeLabel(rangeStart, rangeEnd, lang);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2850 | `InsightsBoard` | `<button type="button" className="tt-btn" disabled={inRange.length === 0} onClick={() => exportEntriesCsv(inRange, nowMs, lang, categoryMap, reportLabel)}>` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2959 | `InsightContent` | `const sum = (items: readonly TimeTrackerEntry[]) => items.reduce((total, entry) => total + entryDuration(entry, nowMs), 0);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2961 | `InsightContent` | `const todayRows = entries.filter((entry) => dayKey(entryStart(entry)) === today);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2984 | `InsightContent` | `const rows = entries.filter((entry) => entryStart(entry) >= startOfWeek(nowMs));` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2989 | `InsightContent` | `const rows = entries.filter((entry) => entryStart(entry) >= startOfMonth(nowMs));` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2994 | `InsightContent` | `const days = new Set(inRange.map((entry) => dayKey(entryStart(entry)))).size &#124;&#124; 1;` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 2999 | `InsightContent` | `const days = new Set(inRange.map((entry) => dayKey(entryStart(entry)))).size;` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3003 | `InsightContent` | `const list = card.type === "donut-today" ? entries.filter((entry) => dayKey(entryStart(entry)) === today) : inRange;` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3010 | `InsightContent` | `const list = entries.filter((entry) => dayKey(entryStart(entry)) === today);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3021 | `InsightContent` | `const bucket = (new Date(entryStart(entry)).getDay() + 6) % 7;` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3022 | `InsightContent` | `buckets[bucket] = (buckets[bucket] ?? 0) + entryDuration(entry, nowMs);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3033 | `InsightContent` | `const dayEntries = entries.filter((entry) => dayKey(entryStart(entry)) === key);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3034 | `InsightContent` | `const value = dayEntries.reduce((total, entry) => total + entryDuration(entry, nowMs), 0);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3049 | `InsightContent` | `const bucket = new Date(segment.start).getHours();` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3050 | `InsightContent` | `buckets[bucket] = (buckets[bucket] ?? 0) + Math.max(0, (segment.end ?? nowMs) - segment.start);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3107 | `DistributionInsight` | `const segments = categorySummaries(list, nowMs, categoryMap, lang);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3153 | `RankingInsight` | `const rows = categorySummaries(list, nowMs, categoryMap, lang);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3177 | `GoalInsight` | `const totals = totalByCategory(list, nowMs);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3205 | `SubSplitInsight` | `for (const entry of list) totals.set(entry.subId ?? "_none", (totals.get(entry.subId ?? "_none") ?? 0) + entryDuration(entry, nowMs));` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3288 | `Heatmap` | `const rows = entries.filter((entry) => dayKey(entryStart(entry)) === key);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3289 | `Heatmap` | `const value = rows.reduce((total, entry) => total + entryDuration(entry, nowMs), 0);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3322 | `RangeSummaryInsight` | `const total = list.reduce((sum, entry) => sum + entryDuration(entry, nowMs), 0);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3328 | `RangeSummaryInsight` | `const key = dayKey(entryStart(entry));` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3329 | `RangeSummaryInsight` | `const value = entryDuration(entry, nowMs);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3333 | `RangeSummaryInsight` | `const hour = new Date(segment.start).getHours();` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3334 | `RangeSummaryInsight` | `hourTotals[hour] = (hourTotals[hour] ?? 0) + Math.max(0, (segment.end ?? nowMs) - segment.start);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3336 | `RangeSummaryInsight` | `if (longest === undefined &#124;&#124; value > entryDuration(longest, nowMs)) longest = entry;` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3364 | `RangeSummaryInsight` | `value={longest !== undefined ? formatDuration(entryDuration(longest, nowMs)) : "—"}` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3402 | `CategoryMosaicInsight` | `const rows = categorySummaries(list, nowMs, categoryMap, lang);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3442 | `FocusRhythmInsight` | `const hour = new Date(segment.start).getHours();` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3443 | `FocusRhythmInsight` | `const value = Math.max(0, (segment.end ?? nowMs) - segment.start);` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3509 | `RecentSessionsInsight` | `<em>{formatClock(entryStart(entry))} - {formatClock(entryLastEnd(entry, nowMs))}</em>` |
| `packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx` | 3512 | `RecentSessionsInsight` | `<b>{formatDuration(entryDuration(entry, nowMs))}</b>` |
| `packages/xai-web-dashboard-widgets/src/widgets/TimeTrackerWidget.tsx` | 1 | `module` | `import { formatDuration, getTimeTrackerSnapshot } from "@repo/plugin-web-time-tracker";` |
| `packages/xai-web-dashboard-widgets/src/widgets/TimeTrackerWidget.tsx` | 11 | `TimeTrackerWidget` | `const snapshot = getTimeTrackerSnapshot(now.getTime());` |
