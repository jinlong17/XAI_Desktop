/**
 * 10-color list-color palette — ids only.
 *
 * OKLCH values live in `../styles.css` as `--board-list-color-<id>` custom
 * properties so consumers can override via CSS without rebuilding the package
 * (DESIGN.md §5 tokens-first contract; satisfies seed brief's "10 column colors
 * via tokens.css (no hard-coded hex)" hard constraint).
 *
 * Order matches `web design/module-board.jsx` lines 13–24 verbatim.
 */

import type { BoardListColorId } from "../types.js";

export const LIST_COLOR_IDS = [
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
  "blue",
  "teal",
  "lime",
  "pink",
  "gray",
] as const satisfies readonly BoardListColorId[];

export interface ListColorEntry {
  id: BoardListColorId;
  /** CSS custom property reference. Resolved by `../styles.css`. */
  cssVar: string;
}

export const LIST_COLOR_PALETTE: readonly ListColorEntry[] = [
  { id: "green", cssVar: "var(--board-list-color-green)" },
  { id: "yellow", cssVar: "var(--board-list-color-yellow)" },
  { id: "orange", cssVar: "var(--board-list-color-orange)" },
  { id: "red", cssVar: "var(--board-list-color-red)" },
  { id: "purple", cssVar: "var(--board-list-color-purple)" },
  { id: "blue", cssVar: "var(--board-list-color-blue)" },
  { id: "teal", cssVar: "var(--board-list-color-teal)" },
  { id: "lime", cssVar: "var(--board-list-color-lime)" },
  { id: "pink", cssVar: "var(--board-list-color-pink)" },
  { id: "gray", cssVar: "var(--board-list-color-gray)" },
] as const;
