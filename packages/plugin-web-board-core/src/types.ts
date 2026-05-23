/**
 * Schema types — verbatim port of `web design/DESIGN.md` §9.3.
 *
 * Re-exported via `index.ts` for consumption by downstream rows
 * `@repo/plugin-web-board-views` (#8) and `@repo/plugin-web-board-workspaces` (#9).
 */

export interface BilingualText {
  en: string;
  zh: string;
}

/** Ten-color list-color palette ids. OKLCH values live in `styles.css`. */
export type BoardListColorId =
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "purple"
  | "blue"
  | "teal"
  | "lime"
  | "pink"
  | "gray";

/** Built-in board templates per DESIGN.md §4.3 / `board-data.js`. */
export type BoardTemplate = "kanban" | "pm" | "blank";

export interface CardChecklist {
  done: number;
  total: number;
}

export interface BoardCard {
  id: string;
  title: BilingualText;
  /** Label ids; reference entries in PM_LABELS or future global label set. */
  labels?: string[];
  /** Member user ids; rendered as avatar chips. */
  members?: string[];
  checklist?: CardChecklist;
  /** Opaque display string (e.g. "5/26", "Today"). Not parsed by row #7. */
  due?: string;
  /** Optional english-localized due override for the prototype's bilingual seed. */
  dueEn?: string;
  /** Opaque display string for start date. */
  start?: string;
  dueLate?: boolean;
  /** Display string (e.g. attachment count). */
  attach?: string | number;
  /** CSS background string for an optional cover bar. */
  cover?: string;
}

export interface BoardList {
  id: string;
  /** When set, name comes from the i18n catalog under board.lists.<key>. */
  key: string | null;
  /** When key is null, customName provides the bilingual display name. */
  customName?: BilingualText;
  /** Null or absent means "no color stripe". */
  color?: BoardListColorId | null;
  cards: BoardCard[];
}

export interface BoardWorkspace {
  id: string;
  name: BilingualText;
  /** OKLCH or CSS color string for the workspace chip (used in #9 only; preserved in seed). */
  color: string;
}

export interface Board {
  id: string;
  workspaceId: string;
  name: BilingualText;
  /** CSS background string (linear-gradient, image, etc.). */
  cover: string;
  template: BoardTemplate;
  lists: BoardList[];
}
