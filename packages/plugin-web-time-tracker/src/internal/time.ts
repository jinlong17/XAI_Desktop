import { localDateKey, startOfLocalDay, parseLocalDateKey } from "@repo/plugin-web-tokens";
import type { Lang, TimeTrackerEntry, TimeTrackerSegment } from "../types.js";

export const MINUTE_MS = 60_000;
export const DAY_MS = 86_400_000;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function dayKey(ts: number): string {
  return localDateKey(ts);
}

export function fromInputValue(value: string, fallback: number): number {
  const next = new Date(value).getTime();
  return Number.isFinite(next) ? next : fallback;
}

export function keyToDate(key: string): number {
  const ts = parseLocalDateKey(key)?.getTime() ?? Number.NaN;
  return Number.isFinite(ts) ? ts : startOfDay(Date.now());
}

export function addDays(key: string, delta: number): string {
  const d = new Date(keyToDate(key));
  d.setDate(d.getDate() + delta);
  return dayKey(d.getTime());
}

export function toInputValue(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function startOfDay(ts: number): number {
  return startOfLocalDay(ts).getTime();
}

export function startOfWeek(ts: number): number {
  const d = new Date(startOfDay(ts));
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.getTime();
}

export function startOfMonth(ts: number): number {
  const d = new Date(startOfDay(ts));
  d.setDate(1);
  return d.getTime();
}

export function entryStart(entry: TimeTrackerEntry): number {
  return entry.segments[0]?.start ?? entry.createdAt;
}

export function entryLastEnd(entry: TimeTrackerEntry, nowMs: number): number {
  return entry.segments.at(-1)?.end ?? nowMs;
}

export function segmentDuration(segment: TimeTrackerSegment, nowMs: number): number {
  const end = Math.min(segment.end ?? nowMs, nowMs);
  return Number.isFinite(segment.start) && Number.isFinite(end) ? Math.max(0, end - segment.start) : 0;
}

export function entryDuration(entry: TimeTrackerEntry, nowMs: number): number {
  return accountingSegments(entry, nowMs).reduce((total, segment) => total + segmentDuration(segment, nowMs), 0);
}

/** Read-only report views keep original segments/IDs. Metadata never enters persisted JSON. */
const accountingWindows = new WeakMap<TimeTrackerEntry, { source: TimeTrackerEntry; start: number; end: number }>();
export function sourceEntry(entry: TimeTrackerEntry): TimeTrackerEntry {
  return accountingWindows.get(entry)?.source ?? entry;
}
export function accountingSegments(entry: TimeTrackerEntry, nowMs: number): readonly TimeTrackerSegment[] {
  const window = accountingWindows.get(entry);
  const start = window?.start ?? Number.NEGATIVE_INFINITY;
  const end = Math.min(window?.end ?? nowMs, nowMs);
  return entry.segments.flatMap(segment => {
    if (!Number.isFinite(segment.start) || !Number.isFinite(segment.end ?? nowMs)) return [];
    const a = Math.max(start, segment.start);
    const b = Math.min(end, segment.end ?? nowMs);
    return b > a ? [{ start: a, end: b }] : [];
  });
}
export function entriesInWindow(entries: readonly TimeTrackerEntry[], start: number, end: number, nowMs: number): readonly TimeTrackerEntry[] {
  return entries.flatMap(entry => {
    const previous = accountingWindows.get(entry);
    const view = { ...sourceEntry(entry) };
    accountingWindows.set(view, { source: sourceEntry(entry), start: Math.max(start, previous?.start ?? start), end: Math.min(end, previous?.end ?? end, nowMs) });
    return entryDuration(view, nowMs) > 0 ? [view] : [];
  });
}
export function entriesOnDay(entries: readonly TimeTrackerEntry[], key: string, nowMs: number): readonly TimeTrackerEntry[] {
  return entriesInWindow(entries, keyToDate(key), keyToDate(addDays(key, 1)), nowMs);
}
/** Split at civil midnight; 23/25-hour days preserve elapsed milliseconds. */
export function entryDayTotals(entry: TimeTrackerEntry, nowMs: number): ReadonlyMap<string, number> {
  const result = new Map<string, number>();
  for (const segment of accountingSegments(entry, nowMs)) {
    let cursor = segment.start;
    const end = segment.end ?? nowMs;
    while (cursor < end) {
      const key = dayKey(cursor);
      const stop = Math.min(end, keyToDate(addDays(key, 1)));
      result.set(key, (result.get(key) ?? 0) + stop - cursor);
      cursor = stop;
    }
  }
  return result;
}
/** Epoch-minute boundaries retain repeated DST hours (including half-hour transitions). */
export function entryHourTotals(entry: TimeTrackerEntry, nowMs: number): readonly number[] {
  const result = Array.from({ length: 24 }, () => 0);
  for (const segment of accountingSegments(entry, nowMs)) {
    let cursor = segment.start;
    const end = segment.end ?? nowMs;
    while (cursor < end) {
      const stop = Math.min(end, (Math.floor(cursor / MINUTE_MS) + 1) * MINUTE_MS);
      const hour = new Date(cursor).getHours();
      result[hour] = (result[hour] ?? 0) + stop - cursor;
      cursor = stop;
    }
  }
  return result;
}

export function isActiveEntry(entry: TimeTrackerEntry): boolean {
  return entry.deleted !== true && entry.done !== true;
}

export function isRunningEntry(entry: TimeTrackerEntry): boolean {
  const last = entry.segments.at(-1);
  return isActiveEntry(entry) && last !== undefined && last.end === null;
}

export function isPausedEntry(entry: TimeTrackerEntry): boolean {
  return isActiveEntry(entry) && !isRunningEntry(entry);
}

export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / MINUTE_MS));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours > 0) return `${hours}h ${pad(rest)}m`;
  return `${rest}m`;
}

export function formatHours(ms: number): string {
  return `${(Math.max(0, ms) / 3_600_000).toFixed(1)}h`;
}

export function formatTimer(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(rest)}`;
}

export function formatClock(ts: number): string {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDayLabel(ts: number, lang: Lang): string {
  const d = new Date(ts);
  if (lang === "zh") return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDayKeyLabel(key: string, lang: Lang): string {
  return formatDayLabel(keyToDate(key), lang);
}

export function shortWeekdayLabel(ts: number, lang: Lang): string {
  const d = new Date(ts);
  if (lang === "zh") return ["日", "一", "二", "三", "四", "五", "六"][d.getDay()] ?? "";
  return ["S", "M", "T", "W", "T", "F", "S"][d.getDay()] ?? "";
}
