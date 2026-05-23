/**
 * Internal narrowed types for xai-web-board-workspaces.
 *
 * These narrow the `unknown`-typed registry slots `xai_board_panels` and
 * `xai_board_inbox` at the consumer boundary. The registry itself remains
 * `unknown` — no edits to `@repo/plugin-web-storage`'s registry.
 *
 * Also defines the pure-helper output shape `RingSegment` consumed by
 * `StatusOverviewBanner.tsx`.
 */

import type { BilingualText } from "@repo/plugin-web-board-core";

/** Narrowed shape of `xai_board_panels` once it has passed `isBoardPanelState`. */
export interface BoardPanelStateShape {
  inbox: boolean;
  planner: boolean;
  board: boolean;
}

/** Narrowed shape of each element of `xai_board_inbox` once it has passed `isInboxCardArray`. */
export interface InboxCardShape {
  id: string;
  text: BilingualText;
}

/** Output of `computeRingSegments` — one SVG ring slice. */
export interface RingSegment {
  /** Stable list id sourced from Board.lists[].id. */
  listId: string;
  /** Bilingual-resolved display label (list.customName?.[lang] || list.key fallback || "Untitled"). */
  label: string;
  /** Card count for this list. Must be > 0 to appear in the segment array. */
  count: number;
  /** CSS color string — OKLCH from board-core's LIST_COLOR_PALETTE or "var(--accent)" fallback. */
  color: string;
}
