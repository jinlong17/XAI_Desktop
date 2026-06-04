/**
 * @internal — validate.ts
 *
 * Storage boundary normalization for `xai_countdowns`.
 * v1 cards are still accepted; v2 optional fields are defaulted here.
 */

import type {
  CountdownCard,
  CountdownCategory,
  CountdownColorId,
  CountdownDisplayStyle,
  CountdownIconId,
  CountdownLayout,
  CountdownStatus,
  CountdownVariant,
} from "../types.js";
import {
  COUNTDOWN_CATEGORIES,
  COUNTDOWN_COLORS,
  COUNTDOWN_ICONS,
  COUNTDOWN_STYLES,
  hasOption,
} from "./options.js";
import { isValidTime, todayDateString } from "./countdownMath.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isDev(): boolean {
  return (
    typeof import.meta !== "undefined" &&
    (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true
  );
}

function isPlainRecord(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object";
}

export function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const roundTrip = new Date(year, month - 1, day);
  return (
    roundTrip.getFullYear() === year &&
    roundTrip.getMonth() === month - 1 &&
    roundTrip.getDate() === day
  );
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function booleanOr(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function enumOr<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? value as T : fallback;
}

/**
 * Return a fully defaulted card when the required v1 fields are valid.
 * Optional v2 fields are repaired instead of dropping the whole record.
 */
export function normalizeCountdownCard(x: unknown, now = new Date()): CountdownCard | null {
  if (!isPlainRecord(x)) {
    devWarn(x, "not an object");
    return null;
  }

  if (typeof x["id"] !== "string" || x["id"] === "") {
    devWarn(x, "id missing or empty");
    return null;
  }

  const rawTitle = x["title"];
  if (
    !isPlainRecord(rawTitle) ||
    typeof rawTitle["en"] !== "string" ||
    typeof rawTitle["zh"] !== "string"
  ) {
    devWarn(x, "title.en or title.zh missing");
    return null;
  }

  if (!isValidDateString(x["target_date"])) {
    devWarn(x, "target_date invalid");
    return null;
  }

  const variant = enumOr<CountdownVariant>(x["variant"], ["image", "light"], "light");
  const coverUrl = x["cover_url"];
  if (variant === "light" && coverUrl !== null) {
    devWarn(x, "variant=light requires cover_url=null");
    return null;
  }
  if (variant === "image" && (coverUrl === null || typeof coverUrl !== "string")) {
    devWarn(x, "variant=image requires non-null string cover_url");
    return null;
  }

  const createdAt = stringOr(x["created_at"], now.toISOString());
  const targetTime = typeof x["target_time"] === "string" && isValidTime(x["target_time"])
    ? x["target_time"]
    : null;
  const category = typeof x["category"] === "string" && hasOption(COUNTDOWN_CATEGORIES, x["category"])
    ? x["category"] as CountdownCategory
    : "custom";
  const color = typeof x["color"] === "string" && hasOption(COUNTDOWN_COLORS, x["color"])
    ? x["color"] as CountdownColorId
    : category === "holiday" ? "red" : category === "month" ? "teal" : category === "year" ? "indigo" : "slate";
  const icon = typeof x["icon"] === "string" && hasOption(COUNTDOWN_ICONS, x["icon"])
    ? x["icon"] as CountdownIconId
    : category === "holiday" ? "gift" : category === "year" ? "flag" : "calendar";
  const displayStyle = typeof x["display_style"] === "string" && hasOption(COUNTDOWN_STYLES, x["display_style"])
    ? x["display_style"] as CountdownDisplayStyle
    : category === "holiday" ? "festival" : "digital";
  const status = enumOr<CountdownStatus>(x["status"], ["active", "deleted"], "active");
  const startDate = isValidDateString(x["start_date"]) ? x["start_date"] : todayDateString(now);
  const normalizedCoverUrl: string | null = variant === "light"
    ? null
    : typeof coverUrl === "string" ? coverUrl : null;

  return {
    id: x["id"],
    title: { en: rawTitle["en"], zh: rawTitle["zh"] },
    target_date: x["target_date"],
    variant,
    cover_url: normalizedCoverUrl,
    target_time: targetTime,
    start_date: startDate,
    category,
    color,
    icon,
    note: stringOr(x["note"], ""),
    is_pinned: booleanOr(x["is_pinned"], false),
    is_hidden: booleanOr(x["is_hidden"], false),
    show_countdown: booleanOr(x["show_countdown"], true),
    show_progress: booleanOr(x["show_progress"], true),
    display_style: displayStyle,
    layout: enumOr<CountdownLayout>(x["layout"], ["stacked", "split"], "stacked"),
    status,
    source: enumOr<"preset" | "custom">(x["source"], ["preset", "custom"], "custom"),
    preset_id: typeof x["preset_id"] === "string" ? x["preset_id"] : null,
    sort_order: numberOr(x["sort_order"], Number.MAX_SAFE_INTEGER),
    created_at: createdAt,
    updated_at: stringOr(x["updated_at"], createdAt),
    deleted_at: typeof x["deleted_at"] === "string" ? x["deleted_at"] : null,
  };
}

export function isCountdownCard(x: unknown): x is CountdownCard {
  return normalizeCountdownCard(x) !== null;
}

function devWarn(x: unknown, reason: string): void {
  if (isDev()) {
    console.warn("[plugin-web-countdown] isCountdownCard: dropped entry —", reason, x);
  }
}
