import type { CountdownCard } from "../types.js";
import { addDays, bumpPastDateForward, toDateString, todayDateString } from "./countdownMath.js";
import { normalizeCountdownCard } from "./validate.js";

interface PresetDef {
  readonly id: string;
  readonly title: CountdownCard["title"];
  readonly targetDate: string;
  readonly startDate: string;
  readonly category: CountdownCard["category"];
  readonly color: CountdownCard["color"];
  readonly icon: CountdownCard["icon"];
  readonly style: CountdownCard["display_style"];
  readonly note: CountdownCard["note"];
  readonly cover: string | null;
}

const CNY_DATES: Readonly<Record<number, string>> = Object.freeze({
  2026: "2026-02-17",
  2027: "2027-02-06",
  2028: "2028-01-26",
  2029: "2029-02-13",
  2030: "2030-02-03",
  2031: "2031-01-23",
  2032: "2032-02-11",
  2033: "2033-01-31",
  2034: "2034-02-19",
  2035: "2035-02-08",
  2036: "2036-01-28",
});

function atStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function fixedAnnual(now: Date, month: number, day: number): { target: Date; start: Date } {
  const today = atStartOfDay(now);
  let target = new Date(now.getFullYear(), month - 1, day);
  if (target.getTime() < today.getTime()) {
    target = new Date(now.getFullYear() + 1, month - 1, day);
  }
  const start = new Date(target.getFullYear() - 1, month - 1, day);
  return { target, start };
}

function firstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function firstDayOfNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function quarterStart(date: Date): Date {
  const month = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), month, 1);
}

function quarterEnd(date: Date): Date {
  const month = Math.floor(date.getMonth() / 3) * 3 + 3;
  return new Date(date.getFullYear(), month, 0);
}

function nextYearStart(now: Date): Date {
  return new Date(now.getFullYear() + 1, 0, 1);
}

function yearStart(now: Date): Date {
  return new Date(now.getFullYear(), 0, 1);
}

function yearEnd(now: Date): Date {
  return new Date(now.getFullYear(), 11, 31);
}

function nextChineseNewYear(now: Date): { target: Date; start: Date } {
  const today = atStartOfDay(now).getTime();
  const years = Object.keys(CNY_DATES).map(Number).sort((a, b) => a - b);
  const targetValue = years.map((year) => CNY_DATES[year]!).find((date) => {
    const [y, m, d] = date.split("-").map(Number);
    return new Date(y!, m! - 1, d!).getTime() >= today;
  });
  if (!targetValue) {
    const fallback = bumpPastDateForward(`${now.getFullYear()}-02-10`, now);
    const [y, m, d] = fallback.split("-").map(Number);
    const target = new Date(y!, m! - 1, d!);
    return { target, start: addDays(target, -365) };
  }
  const [targetYear, targetMonth, targetDay] = targetValue.split("-").map(Number);
  const target = new Date(targetYear!, targetMonth! - 1, targetDay!);
  const previousValue = CNY_DATES[targetYear! - 1];
  if (!previousValue) return { target, start: addDays(target, -365) };
  const [startYear, startMonth, startDay] = previousValue.split("-").map(Number);
  return { target, start: new Date(startYear!, startMonth! - 1, startDay!) };
}

export function getPresetCountdowns(now = new Date()): CountdownCard[] {
  const christmas = fixedAnnual(now, 12, 25);
  const newYearsDay = fixedAnnual(now, 1, 1);
  const cny = nextChineseNewYear(now);
  const nextMonth = firstDayOfNextMonth(now);
  const nextYear = nextYearStart(now);
  const defs: PresetDef[] = [
    {
      id: "christmas",
      title: { en: "Christmas", zh: "圣诞节" },
      targetDate: toDateString(christmas.target),
      startDate: toDateString(christmas.start),
      category: "holiday",
      color: "red",
      icon: "gift",
      style: "festival",
      note: "Annual holiday countdown.",
      cover: "preset:peach",
    },
    {
      id: "yuandan",
      title: { en: "New Year's Day", zh: "元旦" },
      targetDate: toDateString(newYearsDay.target),
      startDate: toDateString(newYearsDay.start),
      category: "holiday",
      color: "amber",
      icon: "spark",
      style: "festival",
      note: "The first day of the Gregorian year.",
      cover: "preset:sand",
    },
    {
      id: "new-year",
      title: { en: "New year", zh: "新年" },
      targetDate: toDateString(nextYear),
      startDate: toDateString(yearStart(now)),
      category: "year",
      color: "indigo",
      icon: "flag",
      style: "hero",
      note: "Year transition planning checkpoint.",
      cover: "preset:midnight",
    },
    {
      id: "spring-festival",
      title: { en: "Spring Festival", zh: "春节" },
      targetDate: toDateString(cny.target),
      startDate: toDateString(cny.start),
      category: "holiday",
      color: "red",
      icon: "moon",
      style: "festival",
      note: "Chinese New Year date is table-backed for the next several years.",
      cover: "preset:dusk",
    },
    {
      id: "month-end",
      title: { en: "End of this month", zh: "本月底" },
      targetDate: toDateString(endOfMonth(now)),
      startDate: toDateString(firstDayOfMonth(now)),
      category: "month",
      color: "teal",
      icon: "calendar",
      style: "notion",
      note: "Current month progress.",
      cover: null,
    },
    {
      id: "next-month",
      title: { en: "Start of next month", zh: "下个月月初" },
      targetDate: toDateString(nextMonth),
      startDate: toDateString(firstDayOfMonth(now)),
      category: "month",
      color: "blue",
      icon: "calendar",
      style: "progress",
      note: "Monthly reset checkpoint.",
      cover: null,
    },
    {
      id: "next-year",
      title: { en: "Next year begins", zh: "明年" },
      targetDate: toDateString(nextYear),
      startDate: toDateString(yearStart(now)),
      category: "year",
      color: "indigo",
      icon: "flag",
      style: "ring",
      note: "Time remaining before the next calendar year.",
      cover: null,
    },
    {
      id: "quarter-end",
      title: { en: "Quarter end", zh: "本季度结束" },
      targetDate: toDateString(quarterEnd(now)),
      startDate: toDateString(quarterStart(now)),
      category: "quarter",
      color: "green",
      icon: "target",
      style: "notion",
      note: "Quarter progress and remaining days.",
      cover: null,
    },
    {
      id: "year-end",
      title: { en: "End of this year", zh: "今年结束" },
      targetDate: toDateString(yearEnd(now)),
      startDate: toDateString(yearStart(now)),
      category: "year",
      color: "slate",
      icon: "ring",
      style: "progress",
      note: "Current year progress.",
      cover: null,
    },
  ];

  const stamp = now.toISOString();
  return defs.map((def) => ({
    id: `preset_${def.id}`,
    title: def.title,
    target_date: def.targetDate,
    target_time: null,
    start_date: def.startDate,
    variant: def.cover ? "image" : "light",
    cover_url: def.cover,
    category: def.category,
    color: def.color,
    icon: def.icon,
    note: def.note,
    is_pinned: false,
    is_hidden: false,
    show_countdown: true,
    show_progress: true,
    display_style: def.style,
    layout: "stacked",
    status: "active",
    source: "preset",
    preset_id: def.id,
    created_at: stamp,
    updated_at: stamp,
    deleted_at: null,
  }));
}

export function mergePresetCountdowns(rawCards: unknown, now = new Date()): CountdownCard[] {
  const existing = Array.isArray(rawCards)
    ? rawCards.map((card) => normalizeCountdownCard(card, now)).filter((card): card is CountdownCard => card !== null)
    : [];
  const presets = getPresetCountdowns(now);
  const byPresetId = new Map(existing.filter((card) => card.preset_id).map((card) => [card.preset_id, card]));
  const mergedPresets = presets.map((preset) => {
    const current = byPresetId.get(preset.preset_id);
    if (!current) return preset;
    if (current.source !== "preset") return current;
    return {
      ...preset,
      ...current,
      target_date: preset.target_date,
      start_date: preset.start_date,
      updated_at: current.updated_at,
    };
  });
  const custom = existing.filter((card) => !card.preset_id);
  return [...mergedPresets, ...custom];
}

export function isCardVisible(card: CountdownCard): boolean {
  return card.status !== "deleted" && card.is_hidden !== true;
}

export function isHistoryCard(card: CountdownCard, now = new Date()): boolean {
  if (card.status === "deleted" || card.is_hidden) return true;
  const target = new Date(`${card.target_date}T${card.target_time ?? "00:00"}:00`);
  return Number.isFinite(target.getTime()) && target.getTime() < now.getTime();
}

export function sortedCountdowns(cards: readonly CountdownCard[]): CountdownCard[] {
  return [...cards].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return `${a.target_date}${a.target_time ?? ""}`.localeCompare(`${b.target_date}${b.target_time ?? ""}`);
  });
}

export function defaultDraft(now = new Date()): Omit<CountdownCard, "id"> {
  const stamp = now.toISOString();
  return {
    title: { en: "", zh: "" },
    target_date: todayDateString(addDays(now, 7)),
    target_time: null,
    start_date: todayDateString(now),
    variant: "light",
    cover_url: null,
    category: "custom",
    color: "slate",
    icon: "calendar",
    note: "",
    is_pinned: false,
    is_hidden: false,
    show_countdown: true,
    show_progress: true,
    display_style: "digital",
    layout: "stacked",
    status: "active",
    source: "custom",
    preset_id: null,
    created_at: stamp,
    updated_at: stamp,
    deleted_at: null,
  };
}
