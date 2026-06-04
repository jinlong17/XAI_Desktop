import type { BoardCard } from "../types.js";

export type BoardIsoDate = string;

export interface BoardDateLabel {
  en: string;
  zh: string;
}

export type BoardDateSource =
  | "typed"
  | "legacy-recoverable"
  | "legacy-ambiguous"
  | "none";

export interface BoardCardDateMeta {
  startDate?: BoardIsoDate;
  dueDate?: BoardIsoDate;
  startLabel: BoardDateLabel | null;
  dueLabel: BoardDateLabel | null;
  isDueToday: boolean;
  isOverdue: boolean;
  isWithinWeek: boolean;
  isInvalidRange: boolean;
  isLegacyAmbiguous: boolean;
  startSource: BoardDateSource;
  dueSource: BoardDateSource;
}

export interface BoardDateOptions {
  now?: Date;
}

export interface DateOnlyParts {
  year: number;
  month: number;
  day: number;
}

interface DateResolution {
  date?: BoardIsoDate;
  label: BoardDateLabel | null;
  source: BoardDateSource;
}

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const LEGACY_MD_RE = /^(\d{1,2})\/(\d{1,2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toLocalDateOnly(date: Date): DateOnlyParts {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

function isValidDateOnlyParts(parts: DateOnlyParts): boolean {
  if (!Number.isInteger(parts.year)) return false;
  if (!Number.isInteger(parts.month) || parts.month < 1 || parts.month > 12) {
    return false;
  }
  if (!Number.isInteger(parts.day) || parts.day < 1 || parts.day > 31) {
    return false;
  }

  const date = new Date(parts.year, parts.month - 1, parts.day);
  return (
    date.getFullYear() === parts.year &&
    date.getMonth() + 1 === parts.month &&
    date.getDate() === parts.day
  );
}

export function formatIsoDateOnly(parts: DateOnlyParts): BoardIsoDate {
  return `${parts.year}-${padDatePart(parts.month)}-${padDatePart(parts.day)}`;
}

export function parseIsoDateOnly(value: unknown): DateOnlyParts | null {
  if (typeof value !== "string") return null;
  const match = value.match(ISO_DATE_RE);
  if (!match) return null;

  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  return isValidDateOnlyParts(parts) ? parts : null;
}

export function isIsoDateOnly(value: unknown): value is BoardIsoDate {
  return parseIsoDateOnly(value) !== null;
}

export function compareIsoDateOnly(a: BoardIsoDate, b: BoardIsoDate): number {
  const aParts = parseIsoDateOnly(a);
  const bParts = parseIsoDateOnly(b);
  if (!aParts || !bParts) {
    throw new Error("compareIsoDateOnly requires valid YYYY-MM-DD dates");
  }
  if (aParts.year !== bParts.year) return aParts.year - bParts.year;
  if (aParts.month !== bParts.month) return aParts.month - bParts.month;
  return aParts.day - bParts.day;
}

export function isoDateFromOffset(offset: number, now = new Date()): BoardIsoDate {
  const anchor = toLocalDateOnly(now);
  const date = new Date(anchor.year, anchor.month - 1, anchor.day + offset);
  return formatIsoDateOnly(toLocalDateOnly(date));
}

function buildLabel(date: BoardIsoDate, todayIso: BoardIsoDate): BoardDateLabel {
  const parts = parseIsoDateOnly(date);
  if (!parts) {
    return { en: date, zh: date };
  }
  if (date === todayIso) {
    return { en: "Today", zh: "今天" };
  }
  const label = `${parts.month}/${parts.day}`;
  return { en: label, zh: label };
}

function buildRawLegacyLabel(values: readonly (string | undefined)[]): BoardDateLabel | null {
  const zh = values.find((value) => typeof value === "string" && value.trim() !== "");
  const en = values.find(
    (value) => typeof value === "string" && value.trim() !== "" && value !== zh,
  );
  if (!zh && !en) return null;
  return {
    zh: (zh ?? en ?? "").trim(),
    en: (en ?? zh ?? "").trim(),
  };
}

function inferLegacyDate(value: string, now: DateOnlyParts): BoardIsoDate | null {
  const trimmed = value.trim();
  if (trimmed === "Today" || trimmed === "今天") {
    return formatIsoDateOnly(now);
  }

  const match = trimmed.match(LEGACY_MD_RE);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  let year = now.year;

  if (now.month === 1 && month === 12) {
    year -= 1;
  } else if (now.month === 12 && month === 1) {
    year += 1;
  }

  const parts = { year, month, day };
  return isValidDateOnlyParts(parts) ? formatIsoDateOnly(parts) : null;
}

function resolveDate(
  typedDate: string | undefined,
  legacyValues: readonly (string | undefined)[],
  now: DateOnlyParts,
  todayIso: BoardIsoDate,
): DateResolution {
  if (typedDate !== undefined) {
    if (isIsoDateOnly(typedDate)) {
      return {
        date: typedDate,
        label: buildLabel(typedDate, todayIso),
        source: "typed",
      };
    }
    return {
      label: buildRawLegacyLabel(legacyValues),
      source: "legacy-ambiguous",
    };
  }

  let sawLegacy = false;
  for (const value of legacyValues) {
    if (typeof value !== "string" || value.trim() === "") continue;
    sawLegacy = true;
    const inferred = inferLegacyDate(value, now);
    if (inferred) {
      return {
        date: inferred,
        label: buildLabel(inferred, todayIso),
        source: "legacy-recoverable",
      };
    }
  }

  if (!sawLegacy) {
    return { label: null, source: "none" };
  }

  return {
    label: buildRawLegacyLabel(legacyValues),
    source: "legacy-ambiguous",
  };
}

export function getBoardCardDateMeta(
  card: BoardCard,
  options: BoardDateOptions = {},
): BoardCardDateMeta {
  const now = toLocalDateOnly(options.now ?? new Date());
  const todayIso = formatIsoDateOnly(now);
  const start = resolveDate(card.startDate, [card.start], now, todayIso);
  const due = resolveDate(card.dueDate, [card.due, card.dueEn], now, todayIso);
  const dueDate = due.date;
  const startDate = start.date;
  const tomorrowIso = isoDateFromOffset(1, options.now ?? new Date());
  const weekEndIso = isoDateFromOffset(6, options.now ?? new Date());

  return {
    startDate,
    dueDate,
    startLabel: start.label,
    dueLabel: due.label,
    isDueToday: dueDate !== undefined && dueDate === todayIso,
    isOverdue: dueDate !== undefined && compareIsoDateOnly(dueDate, todayIso) < 0,
    isWithinWeek:
      dueDate !== undefined &&
      compareIsoDateOnly(dueDate, tomorrowIso) >= 0 &&
      compareIsoDateOnly(dueDate, weekEndIso) <= 0,
    isInvalidRange:
      startDate !== undefined &&
      dueDate !== undefined &&
      compareIsoDateOnly(startDate, dueDate) > 0,
    isLegacyAmbiguous:
      start.source === "legacy-ambiguous" || due.source === "legacy-ambiguous",
    startSource: start.source,
    dueSource: due.source,
  };
}

export function normalizeBoardCardDates(
  card: BoardCard,
  options: BoardDateOptions = {},
): BoardCard {
  const meta = getBoardCardDateMeta(card, options);
  return {
    ...card,
    ...(card.startDate === undefined && meta.startSource === "legacy-recoverable"
      ? { startDate: meta.startDate }
      : null),
    ...(card.dueDate === undefined && meta.dueSource === "legacy-recoverable"
      ? { dueDate: meta.dueDate }
      : null),
  };
}

export function getBoardCardDateCompatibilityPatch(
  patch: Pick<Partial<BoardCard>, "startDate" | "dueDate">,
  options: BoardDateOptions = {},
): Partial<BoardCard> {
  const now = options.now ?? new Date();
  const todayIso = formatIsoDateOnly(toLocalDateOnly(now));
  const next: Partial<BoardCard> = {};

  if ("startDate" in patch) {
    if (patch.startDate !== undefined && isIsoDateOnly(patch.startDate)) {
      next.startDate = patch.startDate;
      next.start = buildLabel(patch.startDate, todayIso).zh;
    } else {
      next.startDate = undefined;
      next.start = undefined;
    }
  }

  if ("dueDate" in patch) {
    if (patch.dueDate !== undefined && isIsoDateOnly(patch.dueDate)) {
      const label = buildLabel(patch.dueDate, todayIso);
      next.dueDate = patch.dueDate;
      next.due = label.zh;
      next.dueEn = label.en === label.zh ? undefined : label.en;
      next.dueLate = compareIsoDateOnly(patch.dueDate, todayIso) < 0;
    } else {
      next.dueDate = undefined;
      next.due = undefined;
      next.dueEn = undefined;
      next.dueLate = undefined;
    }
  }

  return next;
}
