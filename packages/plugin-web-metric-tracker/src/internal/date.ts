import { nextLocalDayStart } from "@repo/plugin-web-tokens";
import type { DateRange, RangeId } from "../types.js";



export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toDateInputValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function toTimeInputValue(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatMonthDay(date: Date, lang: "en" | "zh" = "zh"): string {
  if (lang === "en") return `${date.getMonth() + 1}/${date.getDate()}`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatDateTimeParts(iso: string, lang: "en" | "zh" = "zh") {
  const date = new Date(iso);
  const weekdaysZh = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const weekdaysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    date: lang === "en" ? `${date.getMonth() + 1}/${date.getDate()}` : `${date.getMonth() + 1}月${date.getDate()}日`,
    weekday: lang === "en" ? weekdaysEn[date.getDay()]! : weekdaysZh[date.getDay()]!,
    time: toTimeInputValue(date),
  };
}

export function formatWeekRange(date: Date, lang: "en" | "zh" = "zh"): string {
  const start = startOfDay(date);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = addDays(start, 6);
  if (lang === "en") return `${formatMonthDay(start, "en")} - ${formatMonthDay(end, "en")}`;
  return `${formatMonthDay(start, "zh")} - ${formatMonthDay(end, "zh")}`;
}

export function rangeWindow(id: RangeId, now = new Date(), customStart?: string, customEnd?: string): DateRange {
  const todayEnd = new Date(nextLocalDayStart(now).getTime() - 1);
  if (id === "all") return { id, start: null, end: null };
  if (id === "custom") {
    const start = customStart ? startOfDay(new Date(`${customStart}T00:00:00`)) : null;
    const end = customEnd ? new Date(`${customEnd}T23:59:59.999`) : null;
    return { id, start, end };
  }
  if (id === "lastMonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { id, start, end };
  }
  const start = startOfDay(now);
  if (id === "7d") start.setDate(start.getDate() - 6);
  if (id === "30d") start.setDate(start.getDate() - 29);
  if (id === "3m") start.setMonth(start.getMonth() - 3);
  if (id === "year") {
    start.setMonth(0);
    start.setDate(1);
  }
  return { id, start, end: todayEnd };
}
