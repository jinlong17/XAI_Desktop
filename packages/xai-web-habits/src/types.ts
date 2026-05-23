/**
 * Canonical type declarations for @repo/plugin-web-habits.
 *
 * These types are re-exported via index.ts (the only public surface).
 * The storage layer uses HabitsStateBlob = unknown; callers cast through here.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 * Frozen assumptions: design.md §1.1 items 1-17
 */

import type { Lang } from "@repo/plugin-web-tokens";

/** Stable opaque habit id. Format: `"h_" + 8 random hex chars`. */
export type HabitId = string;

/** UTC day key, format `YYYY-MM-DD`. Matches the event payload's `date` field. */
export type DateKey = string;

/** UTC month key, format `YYYY-MM`. */
export type MonthKey = string;

/** Week-start preference. Default "sun"; Settings W4 (row #24) may flip to "mon". */
export type WeekStart = "sun" | "mon";

/** A single habit definition (no check-in state — that's separate). */
export interface Habit {
  /** Stable opaque id; consumer must not reuse across habits. */
  readonly id: HabitId;
  /** Emoji glyph string (1–8 chars typical). */
  readonly emoji: string;
  /** Bilingual title. Both langs MUST be present. */
  readonly title: { en: string; zh: string };
  /** ISO timestamp the habit was created; the "since" date for total counts. */
  readonly createdAt: string;
}

/** Top-level persisted state — JSON-encoded in localStorage. */
export interface HabitsState {
  readonly schemaVersion: 1;
  readonly habits: ReadonlyArray<Habit>;
  /** Sparse: only checked (habit, day) pairs appear. Absence = not checked. */
  readonly checkIns: Readonly<Record<HabitId, Readonly<Record<DateKey, true>>>>;
  /** Per-habit per-month diary text. Absence = empty. */
  readonly diaries: Readonly<Record<HabitId, Readonly<Record<MonthKey, string>>>>;
}

/** Props for `<HabitsModule/>`. */
export interface HabitsModuleProps {
  /** Active UI language. Drives `useI18n(lang)` inside the module. */
  lang: Lang;
  /** Week-start preference (default "sun"; Settings W4 may flip to "mon"). */
  weekStart?: WeekStart;
}
