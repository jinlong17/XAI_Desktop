/**
 * Public types for @repo/plugin-web-settings-rest.
 *
 * API contract: packages/xai-web-settings-rest/docs/api.md §1.2
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S5
 *
 * Row #24 · W4b — Settings remaining 11 panes.
 */

// ---- Smart Lists -------------------------------------------------------

/** Built-in smart list ids. */
export type SmartListId =
  | "all"
  | "today"
  | "tomorrow"
  | "next7"
  | "assigned"
  | "inbox"
  | "summary"
  | "tags"
  | "filters"
  | "completed"
  | "wont_do"
  | "trash";

/** Tri-state visibility setting per smart list. */
export type SmartListVisibility = "show" | "if-not-empty" | "hide";

// ---- Sticky Note -------------------------------------------------------

/** Color palette id for sticky notes. "random" is a sentinel — conic-gradient. */
export type StickyColorId =
  | "sun"
  | "peach"
  | "coral"
  | "sky"
  | "indigo"
  | "lilac"
  | "mint"
  | "white"
  | "silver"
  | "graphite"
  | "navy"
  | "midnight"
  | "random";

/** Font size option for sticky notes. */
export type StickyFontSize = "small" | "normal" | "large" | "xl";

/** Grid spacing option for sticky notes. */
export type StickyGridSpacing = "none" | "normal" | "large" | "xl";

// ---- More pane ---------------------------------------------------------

/** Window type when launching the app. */
export type WindowType = "window" | "tray" | "full";

/** Default date when creating tasks. */
export type TaskDefaultDate = "none" | "today" | "tomorrow";

/** Default reminder for tasks with a due time. */
export type TaskDefaultReminderDue = "none" | "on_time" | "5min" | "15min";

/** Default reminder for all-day tasks. */
export type TaskDefaultReminderAll = "none" | "9am" | "day_before";

/** Default priority for new tasks. */
export type TaskDefaultPriority = "none" | "low" | "med" | "high";

/** Default tag id for new tasks. */
export type TaskDefaultTagId = "none" | "study" | "work" | "personal";

/** Default list id for new tasks. */
export type TaskDefaultListId = "inbox" | "today";

/** Where new tasks are added in a list. */
export type AddTo = "top" | "bottom";

/** Where the overdue section appears. */
export type OverdueAt = "top" | "bottom";

// ---- Collaborate -------------------------------------------------------

/** Default share permission when sharing with collaborators. */
export type DefaultShare = "comment" | "edit" | "view";

// ---- Integrations ------------------------------------------------------

/** Placeholder integration card ids. */
export type IntegrationCardId =
  | "wechat"
  | "gcal"
  | "notion"
  | "local"
  | "outlook"
  | "exchange"
  | "icloud"
  | "wecom"
  | "dingtalk"
  | "feishu"
  | "caldav"
  | "url"
  | "slack"
  | "linear"
  | "gh"
  | "todoist";
