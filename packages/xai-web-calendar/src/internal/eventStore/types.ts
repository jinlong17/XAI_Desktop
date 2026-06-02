/**
 * @internal — Event store type contracts for the Event CRUD extension.
 *
 * Authority: docs/adr/0010-p1-desktop-resume-plan.md §D4 (P0 carve-out) +
 *            docs/reviews/_p0-carve-outs/20260527-calendar-event-create.md.
 * Design:   packages/xai-web-calendar/docs/design.md §16.7
 * API:      packages/xai-web-calendar/docs/api.md §11.2
 *
 * Schema invariants:
 *   - `startISO` and `endISO` are LOCAL CLOCK "YYYY-MM-DDTHH:MM" strings
 *     with NO timezone suffix. The local-clock policy keeps recurrence
 *     stable across DST boundaries (HH:MM string never shifts).
 *   - `endISO` MUST be ≥ `startISO + 5 minutes` AND share the SAME calendar
 *     day (multi-day events are out of scope per v1.2).
 *   - `colorPreset` is a closed union; consumers must handle the default
 *     branch when pattern-matching (TypeScript will warn on missing branches).
 *   - `recurrence === null` means non-recurring; `recurrence.kind ===
 *     "daily" | "weekly"` materializes via expandRecurrence at render time.
 *   - `id` is opaque (crypto.randomUUID() in modern browsers; fallback in jsdom).
 *   - `createdAt` / `updatedAt` are ISO ms timestamps (`new Date().toISOString()`).
 *
 * This type is the SOLE public surface for user-created events; the existing
 * fixture `CalEvent` shape (day-of-month indexed) is unchanged.
 */

/** Recurrence frequency. v1.2: daily + weekly only (no monthly, no yearly). */
export type RecurrenceKind = "daily" | "weekly";

/** Recurrence rule attached to a UserCalEvent. v1.2 has no `interval`/`until`/`byWeekday`. */
export interface RecurrenceRule {
  kind: RecurrenceKind;
}

/** Closed union of UI color presets. 5 entries: 4 baseline + 1 new (rose). */
export type EventColorPreset = "mint" | "amber" | "blue" | "violet" | "rose";

/** Reminder presets stored on user events. */
export type EventReminderPreset =
  | "none"
  | "at_start"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "1d";

/**
 * User-created calendar event. Distinct from the fixture `CalEvent` shape.
 * See the file-level invariant comment for schema constraints.
 */
export interface UserCalEvent {
  /** Opaque ID — crypto.randomUUID() in modern browsers; fallback string in jsdom. */
  id: string;
  /** Plain-text title; trimmed before persist; max ~200 chars (UI-enforced). */
  title: string;
  /** "YYYY-MM-DDTHH:MM" local-clock. NO TZ suffix. */
  startISO: string;
  /** "YYYY-MM-DDTHH:MM" local-clock. >= startISO + 5 minutes. SAME DAY as startISO. */
  endISO: string;
  /** UI color band. Default "mint" on create. */
  colorPreset: EventColorPreset;
  /** Recurrence rule (daily/weekly) or null for non-recurring. */
  recurrence: RecurrenceRule | null;
  /** True means render in all-day strips / date cells without a clock label. */
  allDay?: boolean;
  /** Optional short tag used for chip badges and filtering future rows. */
  tag?: string;
  /** Optional free-form notes / description text. */
  notes?: string;
  /** Reminder setting for local notification future rows. */
  reminder?: EventReminderPreset;
  /** ISO millisecond timestamp at create. */
  createdAt: string;
  /** ISO millisecond timestamp; bumped on every successful update. */
  updatedAt: string;
}
