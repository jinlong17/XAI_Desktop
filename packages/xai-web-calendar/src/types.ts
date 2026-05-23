/**
 * Public type surface for @repo/plugin-web-calendar.
 *
 * Re-exported from src/index.ts. See packages/xai-web-calendar/docs/api.md §1.1.
 */

import type { Lang } from "@repo/plugin-web-tokens";

/** Active view tab. Month is the only functional view in v1. */
export type CalendarView = "month" | "week" | "day";

/** Top-level component props. */
export interface CalendarModuleProps {
  /** Active language — drives all bilingual text via useI18n. */
  lang: Lang;
}

/** Year+month tuple (month 1..12, NOT 0..11). */
export interface DisplayedMonth {
  year: number;
  month: number;
}
