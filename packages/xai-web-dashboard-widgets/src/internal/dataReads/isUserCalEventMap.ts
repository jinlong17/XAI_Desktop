/**
 * @internal — isUserCalEventMap predicate.
 *
 * Narrows the `unknown` from `usePref("xai_calendar_events")` into a map
 * of minimal UserCalEvent-shaped records:
 *
 *   Record<string, { id; title; startISO; endISO; colorPreset; recurrence }>
 *
 * Calendar events are stored as `Record<string, UserCalEvent>` (id-keyed).
 *
 * **startISO / endISO are LOCAL-CLOCK "YYYY-MM-DDTHH:MM" strings, NO TZ
 * suffix.** Date basis = local clock (NOT UTC). Do not unify with habits (UTC)
 * or pomodoro (local, but ISO full-timestamp). (RD3 guard.)
 *
 * Non-conforming entries are silently skipped (defensive — RD12).
 *
 * Authority: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #10/11
 * Discovery: docs/reviews/xai-web-dashboard-real-data/20260528-discovery-review.md §3.4
 */

/** Minimal recurrence shape for local expansion. */
export interface RecurrenceMin {
  kind: "daily" | "weekly";
}

/** Minimal UserCalEvent shape needed by the dashboard selectors. */
export interface UserCalEventMin {
  id: string;
  title: string;
  /** "YYYY-MM-DDTHH:MM" local-clock, no TZ suffix. */
  startISO: string;
  /** "YYYY-MM-DDTHH:MM" local-clock, no TZ suffix. */
  endISO: string;
  /** "mint" | "amber" | "blue" | "violet" | "rose" */
  colorPreset: string;
  recurrence: RecurrenceMin | null;
}

const ISO_LOCAL_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const COLOR_PRESETS = new Set(["mint", "amber", "blue", "violet", "rose"]);

function isRecurrenceMin(v: unknown): v is RecurrenceMin | null {
  if (v === null) return true;
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return obj.kind === "daily" || obj.kind === "weekly";
}

function isUserCalEventMin(v: unknown): v is UserCalEventMin {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    obj.id.length > 0 &&
    typeof obj.title === "string" &&
    typeof obj.startISO === "string" &&
    ISO_LOCAL_RE.test(obj.startISO) &&
    typeof obj.endISO === "string" &&
    ISO_LOCAL_RE.test(obj.endISO) &&
    typeof obj.colorPreset === "string" &&
    COLOR_PRESETS.has(obj.colorPreset) &&
    isRecurrenceMin(obj.recurrence)
  );
}

/**
 * Narrows `v` into a `Record<string, UserCalEventMin>`.
 * Returns `false` if the top level is not an object.
 * Non-conforming entries are silently dropped during iteration by selectors.
 */
export function isUserCalEventMap(v: unknown): v is Record<string, UserCalEventMin> {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  return true; // top-level check only; per-entry validation done in selectors
}

/**
 * Returns an array of valid `UserCalEventMin` from the raw store value,
 * dropping any non-conforming entries silently.
 */
export function listValidCalEvents(store: unknown): UserCalEventMin[] {
  if (!isUserCalEventMap(store)) return [];
  const out: UserCalEventMin[] = [];
  for (const val of Object.values(store as Record<string, unknown>)) {
    if (isUserCalEventMin(val)) out.push(val);
  }
  return out;
}
