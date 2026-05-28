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
 *   - `color` is one of the 5 preset token names (not raw hex).
 *   - `id` is opaque (crypto.randomUUID() in modern browsers; fallback string in jsdom).
 *   - `createdAt` is an ISO ms timestamp (`new Date().toISOString()`).
 *
 * Fixture stickies (`StickyFixture` in fixtures.ts) are a distinct type —
 * they use `text: { en: string; zh: string }` and raw hex `color`.
 * The widget branches on `list.length === 0` to pick the right render path.
 *
 * Note on token vocabulary compatibility: the 5-token palette
 * `{sun, mint, peach, sky, lilac}` is aligned with `xai_pref_sticky_color`
 * (registry.ts:811, default "sun") so a future "read-pref-as-default" increment
 * will not hit a token mismatch. v1 hard-codes "sun" as the default.
 */

/** Closed union of 5 preset color token names. */
export type StickyColor = "sun" | "mint" | "peach" | "sky" | "lilac";

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
} as const;

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
}

/**
 * Input shape for creating a new sticky (omits id + createdAt).
 */
export interface NewStickyDraft {
  text: string;
  color: StickyColor;
}
