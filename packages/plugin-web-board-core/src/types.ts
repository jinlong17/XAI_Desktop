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

/** Board-level visibility state. Missing legacy values resolve to private. */
export type BoardVisibility = "private" | "shared";

export interface CardChecklist {
  done: number;
  total: number;
}

export interface BoardChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export type BoardIntegrationProviderId =
  | "gcal"
  | "github"
  | "linear"
  | "drive"
  | "link";

export interface BoardAttachmentIntegrationSource {
  kind: "integration";
  providerId: BoardIntegrationProviderId;
  providerName: string;
  externalId?: string;
}

export interface BoardCardAttachmentLink {
  id: string;
  url: string;
  title?: string;
  /** Optional provider metadata for integration-backed external links. */
  source?: BoardAttachmentIntegrationSource;
}

export type BoardCardActivityKind = "note" | "comment";

export interface BoardCardActivityEntry {
  id: string;
  kind: BoardCardActivityKind;
  body: string;
  createdAt: string;
  authorId?: string;
  authorName?: string;
}

export interface BoardCardTaskLink {
  source: "xai-web-tasks";
  taskId: string;
  createdAt: string;
}

export interface BoardMemberOption {
  id: string;
  name: string;
  color: string;
}

/**
 * Canonical board label definition. A card references labels by id; the board
 * (or the default catalog) owns the id → {name, color} mapping that the card
 * chips and the detail-modal label editor resolve against.
 */
export interface BoardLabel {
  id: string;
  name: BilingualText;
  /** OKLCH or CSS color string. */
  color: string;
}

/**
 * Card priority. Ordered urgent > high > medium > low. `undefined` = no
 * priority. Chip color/name metadata lives in `BOARD_PRIORITIES`.
 */
export type BoardCardPriority = "urgent" | "high" | "medium" | "low";

/** Geographic location for Map view rendering (gap-closure row #6). */
export interface CardLocation {
  /** WGS84 latitude, -90..90. */
  lat: number;
  /** WGS84 longitude, -180..180. */
  lng: number;
  /** Optional human-readable label rendered in the pin popup. */
  label?: string;
}

export interface BoardCard {
  id: string;
  title: BilingualText;
  /** Soft-hidden from active card renders; restored/deleted by card manager. */
  archived?: boolean;
  /** ISO datetime marker set by Automation Lite when a card enters Done. */
  completedAt?: string;
  /** Rich card detail description, persisted by the workspace detail modal. */
  description?: string;
  /** Label ids; resolved against the board's label catalog (or defaults). */
  labels?: string[];
  /** Member user ids; resolved against the board's member catalog (or defaults). */
  members?: string[];
  /** Card priority. Resolved against BOARD_PRIORITIES for chip color/label. */
  priority?: BoardCardPriority;
  checklist?: CardChecklist;
  /** Structured checklist rows. `checklist` is derived for legacy chip rendering. */
  checklistItems?: BoardChecklistItem[];
  /** Structured link attachments. `attach` is derived for legacy chip rendering. */
  attachments?: BoardCardAttachmentLink[];
  /** Lightweight card activity timeline. */
  activity?: BoardCardActivityEntry[];
  /** Optional one-way link to a generated Tasks module card. */
  taskLink?: BoardCardTaskLink;
  /** Opaque display string (e.g. "5/26", "Today"). Not parsed by row #7. */
  due?: string;
  /** Optional english-localized due override for the prototype's bilingual seed. */
  dueEn?: string;
  /** Opaque display string for start date. */
  start?: string;
  /** ISO date input value (`YYYY-MM-DD`) used by the detail modal. */
  startDate?: string;
  /** ISO date input value (`YYYY-MM-DD`) used by the detail modal. */
  dueDate?: string;
  dueLate?: boolean;
  /** Display string (e.g. attachment count). */
  attach?: string | number;
  /** CSS background string for an optional cover bar. */
  cover?: string;
  /** OPTIONAL — geographic location for Map view rendering.
   *  Cards without this field render as empty-state in Map view. */
  location?: CardLocation;
}

export interface BoardList {
  id: string;
  /** When set, name comes from the i18n catalog under board.lists.<key>. */
  key: string | null;
  /** When key is null, customName provides the bilingual display name. */
  customName?: BilingualText;
  /** Null or absent means "no color stripe". */
  color?: BoardListColorId | null;
  /** Soft-hidden from active board renders; restored/deleted by list manager. */
  archived?: boolean;
  cards: BoardCard[];
}

export interface BoardListMutationContext {
  template: BoardTemplate;
}

export interface ArchivedBoardCardRecord {
  listId: string;
  list: BoardList;
  card: BoardCard;
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
  /** Local visibility state. This is not a backend ACL grant. */
  visibility?: BoardVisibility;
  /**
   * Board-scoped label catalog. When absent (legacy boards), resolves to
   * DEFAULT_BOARD_LABELS. Materialized lazily on first label edit.
   */
  labels?: BoardLabel[];
  /**
   * Board-scoped member directory. When absent (legacy boards), resolves to
   * DEFAULT_BOARD_MEMBERS. Materialized lazily on first member edit.
   */
  members?: BoardMemberOption[];
  lists: BoardList[];
}
