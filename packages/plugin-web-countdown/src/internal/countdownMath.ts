import type { CountdownCard } from "../types.js";
import { formatTargetLabel } from "./formatTargetLabel.js";
import type { Lang } from "@repo/plugin-web-tokens";

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MS_PER_DAY = 86_400_000;

export interface CountdownMetrics {
  readonly targetAt: Date | null;
  readonly startAt: Date | null;
  readonly dayDelta: number;
  readonly absDays: number;
  readonly hours: number;
  readonly minutes: number;
  readonly isPast: boolean;
  readonly progress: number;
  readonly progressLabel: string;
  readonly targetLabel: string;
  readonly fullTargetLabel: string;
}

function parseDateParts(value: string | null | undefined): { year: number; month: number; day: number } | null {
  if (!value) return null;
  const match = DATE_RE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const roundTrip = new Date(year, month - 1, day);
  if (
    roundTrip.getFullYear() !== year ||
    roundTrip.getMonth() !== month - 1 ||
    roundTrip.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function isValidTime(value: string | null | undefined): boolean {
  return value === null || value === undefined || value === "" || TIME_RE.test(value);
}

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayDateString(now = new Date()): string {
  return toDateString(now);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function combineDateTime(dateValue: string, timeValue?: string | null): Date | null {
  const parts = parseDateParts(dateValue);
  if (!parts) return null;
  const hourMinute = timeValue && TIME_RE.test(timeValue) ? timeValue : "00:00";
  const [hourRaw, minuteRaw] = hourMinute.split(":");
  return new Date(parts.year, parts.month - 1, parts.day, Number(hourRaw), Number(minuteRaw), 0, 0);
}

function utcDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function computeCountdownMetrics(card: CountdownCard, now: Date, lang: Lang): CountdownMetrics {
  const targetAt = combineDateTime(card.target_date, card.target_time);
  const startAt = card.start_date ? combineDateTime(card.start_date, "00:00") : null;
  const targetLabel = formatTargetLabel(card.target_date, lang);
  const fullTargetLabel = `${targetLabel}${card.target_time ? ` ${card.target_time}` : ""}`;

  if (!targetAt) {
    return {
      targetAt: null,
      startAt,
      dayDelta: NaN,
      absDays: NaN,
      hours: 0,
      minutes: 0,
      isPast: false,
      progress: 0,
      progressLabel: "0%",
      targetLabel,
      fullTargetLabel,
    };
  }

  const dayDelta = utcDayNumber(targetAt) - utcDayNumber(now);
  const diff = targetAt.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const absDays = Math.abs(dayDelta);
  const hours = Math.floor((abs % MS_PER_DAY) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);

  let progress = diff < 0 ? 1 : 0;
  if (startAt && targetAt.getTime() > startAt.getTime()) {
    progress = clamp((now.getTime() - startAt.getTime()) / (targetAt.getTime() - startAt.getTime()), 0, 1);
  }

  return {
    targetAt,
    startAt,
    dayDelta,
    absDays,
    hours,
    minutes,
    isPast: diff < 0,
    progress,
    progressLabel: `${Math.round(progress * 100)}%`,
    targetLabel,
    fullTargetLabel,
  };
}

export function bumpPastDateForward(targetDate: string, now = new Date()): string {
  const parts = parseDateParts(targetDate);
  if (!parts) return toDateString(addDays(now, 1));
  let next = new Date(now.getFullYear(), parts.month - 1, parts.day);
  if (next.getTime() <= new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) {
    next = new Date(now.getFullYear() + 1, parts.month - 1, parts.day);
  }
  return toDateString(next);
}
