/**
 * Public types for @repo/plugin-web-board-views.
 *
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 * API contract: packages/xai-web-board-views/docs/api.md §0
 */

/** Six view identifiers for the Board module view picker. */
export type BoardViewId = "board" | "table" | "calendar" | "dashboard" | "timeline" | "map";

/** Icon keys used in the ViewPicker. */
export type ViewPickerIconId = "kanban" | "grid" | "calendar" | "barchart" | "gantt" | "globe";

/** A single entry in the ViewPicker. */
export interface ViewPickerEntry {
  id: BoardViewId;
  labelEn: string;
  labelZh: string;
  icon: ViewPickerIconId;
}

/** Identifier for a due-date quick-shortcut in the Table view due picker. */
export type DueShortcutId = "today" | "tomorrow" | "next-mon";
