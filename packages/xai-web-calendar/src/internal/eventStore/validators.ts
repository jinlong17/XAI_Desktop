/**
 * @internal — Pure validation for user-event drafts.
 *
 * Used by EventComposer at Save time to surface inline error messages.
 * Bilingual messages are inlined here (not duplicated in strings.ts) so
 * the validator can run headlessly in tests without an i18n context.
 *
 * Design: docs/design.md §16.7
 * API:    docs/api.md §11.2 / §11.5
 */

import type { EventColorPreset, RecurrenceRule } from "./types.js";

export interface ValidationError {
  field: "title" | "date" | "startTime" | "endTime" | "color" | "recurrence";
  code:
    | "REQUIRED"
    | "INVALID_FORMAT"
    | "END_BEFORE_START"
    | "MIN_DURATION"
    | "MULTI_DAY";
  message: { en: string; zh: string };
}

export interface UserCalEventDraft {
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  colorPreset: EventColorPreset;
  recurrence: RecurrenceRule | null;
}

const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/** Convert "HH:MM" to total minutes since midnight, or null if malformed. */
function hhmmToMinutes(hhmm: string): number | null {
  if (!HHMM_RE.test(hhmm)) return null;
  const parts = hhmm.split(":").map((n) => Number(n));
  const h = parts[0];
  const m = parts[1];
  if (h === undefined || m === undefined) return null;
  if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
  return h * 60 + m;
}

/**
 * Returns the list of validation errors (empty array = OK).
 *
 * Order: title → date → time formats → end-before-start → min-duration → multi-day.
 * Order matters because UI surfaces the first error per field.
 */
export function validateUserCalEvent(draft: UserCalEventDraft): ValidationError[] {
  const errors: ValidationError[] = [];

  // 1. Title required.
  if (draft.title.trim().length === 0) {
    errors.push({
      field: "title",
      code: "REQUIRED",
      message: {
        en: "Title is required",
        zh: "标题不能为空",
      },
    });
  }

  // 2. Date format.
  if (!DATE_RE.test(draft.date)) {
    errors.push({
      field: "date",
      code: "INVALID_FORMAT",
      message: {
        en: "Date must be YYYY-MM-DD",
        zh: "日期格式必须是 YYYY-MM-DD",
      },
    });
  }

  // 3. Start time format.
  const startMin = hhmmToMinutes(draft.startTime);
  if (startMin === null) {
    errors.push({
      field: "startTime",
      code: "INVALID_FORMAT",
      message: {
        en: "Start time must be HH:MM",
        zh: "开始时间格式必须是 HH:MM",
      },
    });
  }

  // 4. End time format.
  const endMin = hhmmToMinutes(draft.endTime);
  if (endMin === null) {
    errors.push({
      field: "endTime",
      code: "INVALID_FORMAT",
      message: {
        en: "End time must be HH:MM",
        zh: "结束时间格式必须是 HH:MM",
      },
    });
  }

  // 5. End-before-start + min-duration only when both times are valid.
  if (startMin !== null && endMin !== null) {
    if (endMin <= startMin) {
      errors.push({
        field: "endTime",
        code: "END_BEFORE_START",
        message: {
          en: "End time must be after start",
          zh: "结束时间必须晚于开始",
        },
      });
    } else if (endMin - startMin < 5) {
      errors.push({
        field: "endTime",
        code: "MIN_DURATION",
        message: {
          en: "Event must be at least 5 minutes",
          zh: "事件时长至少 5 分钟",
        },
      });
    }
  }

  return errors;
}

/**
 * Programmatic-only check: caller built two ISO strings and asks whether
 * they belong to the same calendar day. UI prevents multi-day via a single
 * date field, but the store-level boundary still rejects it.
 */
export function isMultiDay(startISO: string, endISO: string): boolean {
  const startDate = startISO.slice(0, 10); // "YYYY-MM-DD"
  const endDate = endISO.slice(0, 10);
  return startDate !== endDate;
}

/** Build the MULTI_DAY error in the same bilingual shape. */
export function multiDayError(): ValidationError {
  return {
    field: "endTime",
    code: "MULTI_DAY",
    message: {
      en: "Event cannot span multiple days",
      zh: "事件不能跨日",
    },
  };
}
