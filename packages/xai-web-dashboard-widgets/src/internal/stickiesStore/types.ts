/**
 * @internal — Sticky store type contracts.
 *
 * Authority: docs/adr/0010-p1-desktop-resume-plan.md §D4 (P0 carve-out) +
 *            docs/reviews/_p0-carve-outs/20260528-dashboard-stickies-create.md.
 * Design:   packages/xai-web-dashboard-widgets/docs/design.md §E.3
 * API:      packages/xai-web-dashboard-widgets/docs/api.md §E
 *
 * Schema invariants:
 *   - `text` is a plain string — what the user typed; NOT bilingual.
 *   - `color` is one of the preset token names (not raw hex).
 *   - `id` is opaque (crypto.randomUUID() in modern browsers; fallback string in jsdom).
 *   - `createdAt` is an ISO ms timestamp (`new Date().toISOString()`).
 *   - `source` is optional and only records display metadata copied from another module.
 *   - `width` + `height` are per-sticky dimensions controlled only by the
 *     sticky resize handle; outer dashboard widget resize does not rewrite them.
 *   - `x` + `y` are user-controlled canvas coordinates inside the stickies widget.
 *   - `order` is retained as a stable render/z-index fallback for older data.
 *
 * Fixture stickies (`StickyFixture` in fixtures.ts) are a distinct type —
 * they use `text: { en: string; zh: string }` and raw hex `color`.
 * The widget branches on `list.length === 0` to pick the right render path.
 *
 * Note on token vocabulary compatibility: the palette keeps the original
 * `{sun, mint, peach, sky, lilac}` tokens aligned with `xai_pref_sticky_color`
 * (registry.ts:811, default "sun") and adds newer tokens as an additive UI-only
 * expansion. v1 hard-codes "sun" as the default.
 */

/** Closed union of preset color token names. */
export type StickyColor =
  | "sun"
  | "mint"
  | "peach"
  | "sky"
  | "lilac"
  | "rose"
  | "coral"
  | "lime"
  | "teal"
  | "slate";

/**
 * Map from StickyColor token to hex value used at render time.
 * User stickies resolve `STICKY_COLORS[s.color]`; fixture stickies keep their
 * raw hex literal (`n.color`) and MUST NOT go through this map.
 */
export const STICKY_COLORS: Readonly<Record<StickyColor, string>> = {
  sun:   "#fff7c0",
  mint:  "#cfe7d8",
  peach: "#fad6c8",
  sky:   "#c8ddf5",
  lilac: "#e5d8f5",
  rose:  "#ffd7e5",
  coral: "#ffd8bd",
  lime:  "#dff2b8",
  teal:  "#c3eee7",
  slate: "#d9e0eb",
} as const;

/** Default persisted size for a newly created user sticky. */
export const STICKY_DEFAULT_SIZE = {
  width: 204,
  height: 112,
} as const;

/** Clamp bounds for user-controlled sticky resize. */
export const STICKY_SIZE_LIMITS = {
  minWidth: 150,
  maxWidth: 360,
  minHeight: 84,
  maxHeight: 280,
} as const;

/** User-controlled sticky dimensions in CSS pixels. */
export interface StickySize {
  width: number;
  height: number;
}

/** User-controlled sticky canvas coordinates in CSS pixels. */
export interface StickyPosition {
  x: number;
  y: number;
}

/**
 * Optional display metadata copied from another module into a sticky.
 * This is intentionally denormalized: a sticky remains readable even if the
 * original task later changes or is deleted.
 */
export interface StickySourceMeta {
  /** Source module kind. v1 supports task cards. */
  type: "task";
  /** Source item id, used only for display/debug; no live reference is followed. */
  id: string;
  /** User-facing source title at creation time. */
  title: string;
  /** Source list/bucket label, e.g. "Overdue" / "过期". */
  listLabel?: string;
  /** Source tag label, e.g. "Study" / "学习". */
  tagLabel?: string;
  /** Source date or date label, e.g. "7/31" / "6 月 14 日" / "Next Mon". */
  dateLabel?: string;
  /** Whether the source card was already completed. */
  completed?: boolean;
}

/**
 * User-created sticky note. Distinct from the fixture `StickyFixture` shape.
 */
export interface UserSticky {
  /** Opaque ID — crypto.randomUUID() in modern browsers; fallback string in jsdom. */
  id: string;
  /** Plain-text note body; trimmed before persist. */
  text: string;
  /** Color preset token (resolved via STICKY_COLORS at render time). */
  color: StickyColor;
  /** ISO millisecond timestamp at create. */
  createdAt: string;
  /** User-controlled sticky width in CSS px. */
  width?: number;
  /** User-controlled sticky height in CSS px. */
  height?: number;
  /** User-controlled left coordinate within the sticky canvas. */
  x?: number;
  /** User-controlled top coordinate within the sticky canvas. */
  y?: number;
  /** User-controlled display order inside the stickies widget. */
  order?: number;
  /** Optional copied source metadata. */
  source?: StickySourceMeta;
}

/**
 * Input shape for creating a new sticky (omits id + createdAt).
 */
export interface NewStickyDraft {
  text: string;
  color: StickyColor;
  source?: StickySourceMeta;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}
