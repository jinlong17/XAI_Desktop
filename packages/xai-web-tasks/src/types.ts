/**
 * Public types for @repo/plugin-web-tasks.
 *
 * API contract: packages/xai-web-tasks/docs/api.md §1
 * Design: packages/xai-web-tasks/docs/design.md §4
 */

import type { Lang } from "@repo/plugin-web-tokens";

// Re-export Lang so consumers need only this package's types for component props.
export type { Lang };

// ---------------------------------------------------------------------------
// BucketId — closed set of 4 time buckets
// ---------------------------------------------------------------------------

export type BucketId = "overdue" | "next7" | "later" | "nodate";

// ---------------------------------------------------------------------------
// TaskTagId — 5 tag colours supported in v1
// ---------------------------------------------------------------------------

export type TaskTagId = "study" | "work" | "personal" | "todo" | "other" | (string & {});

export type TaskPriority = "low" | "normal" | "high" | "urgent";

export interface TaskListMeta {
  readonly id: string;
  readonly name: TaskTitleBundle;
  readonly color: string;
  readonly icon: string;
}

export interface TaskTagMeta {
  readonly id: string;
  readonly name: TaskTitleBundle;
  readonly color: string;
}

// ---------------------------------------------------------------------------
// TaskTitleBundle — bilingual title structure
// ---------------------------------------------------------------------------

export interface TaskTitleBundle {
  readonly en: string;
  readonly zh: string;
}

export interface BoardTaskLinkSource {
  readonly type: "board-card";
  readonly boardId: string;
  readonly listId: string;
  readonly cardId: string;
}

// ---------------------------------------------------------------------------
// TaskCard — immutable card; moves create new objects via the reducer
// ---------------------------------------------------------------------------

export interface TaskCard {
  /** Stable card id (e.g. "t1", "c1") — globally unique within taskCols. */
  readonly id: string;
  /** Bilingual title — required. */
  readonly title: TaskTitleBundle;
  /** Optional bilingual subtitle (used for holiday descriptions in prototype). */
  readonly sub?: TaskTitleBundle;
  /** Optional tag class — drives the pill colour. */
  readonly tag?: TaskTagId;
  /** Optional multi-tag assignment. `tag` remains the primary/legacy tag. */
  readonly tags?: ReadonlyArray<string>;
  /** Custom list assignment used by list filters and list drop targets. */
  readonly listId?: string;
  /** Optional priority for sorting/scanning and bulk updates. */
  readonly priority?: TaskPriority;
  /** Freeform note edited from the detail panel. */
  readonly notes?: string;
  /** Optional source reference used by Board card -> Task linking. */
  readonly source?: BoardTaskLinkSource;
  /** Optional date display string in EN format ("7/31", "Jun 14", etc.). */
  readonly date?: string;
  /** Optional date display string in ZH format ("6 月 14 日", etc.). */
  readonly dateZh?: string;
  /** Optional bilingual date *label* (e.g. "Next Mon" / "下周一"). */
  readonly dateLabel?: TaskTitleBundle;
  /** When true, renders the inbox-source icon in the meta row. */
  readonly inbox?: boolean;
  /**
   * When true, the card is marked as completed.
   * Persisted inside xai_task_cols so completion survives page refresh (T-10 fix).
   * Absent/undefined is treated as false by all consumers.
   */
  readonly done?: boolean;
}

// ---------------------------------------------------------------------------
// TaskCol — a single time-bucket column
// ---------------------------------------------------------------------------

export interface TaskCol {
  /** Bucket id — closed set. */
  readonly id: BucketId;
  /** i18n key suffix (used as `common.${key}`). */
  readonly key: "overdue" | "next_7_days" | "later" | "no_date";
  /** Cached count — kept in sync with tasks.length by the reducer. */
  readonly count: number;
  /** Header action button kind — "postpone" or "add" or absent. */
  readonly action?: "postpone" | "add";
  /** Ordered task list (top of column = index 0). */
  readonly tasks: ReadonlyArray<TaskCard>;
  /** Optional completed-group inside this column (only nodate has this in MOCK). */
  readonly completed?: ReadonlyArray<TaskCard>;
}

// ---------------------------------------------------------------------------
// TasksModuleProps — public props interface for TasksModule
// ---------------------------------------------------------------------------

export interface TasksModuleProps {
  /** Active UI language. */
  readonly lang: Lang;
}

// ---------------------------------------------------------------------------
// SmartListId — closed set of sidebar smart-list ids (smartlist-filter, design §F.1)
// Kept internal-to-module in v1 per Rec-F3 (not promoted to barrel unless a consumer emerges).
// ---------------------------------------------------------------------------

export type SmartListId = "all" | "today" | "tomorrow" | "next7" | "inbox" | "summary";

export type TaskViewSelection =
  | { readonly kind: "smart"; readonly id: SmartListId }
  | { readonly kind: "list"; readonly id: "all" | string }
  | { readonly kind: "tag"; readonly id: "all" | string };

// ---------------------------------------------------------------------------
// TaskCardPatch — patch shape for updateCard (api.md §14.3 / xai-web-ai-tool-edit-delete)
// Re-exported from internal so consumers can type-check the AI event payloads.
// ---------------------------------------------------------------------------

export type { TaskCardPatch } from "./internal/tasksReducer.js";

// ---------------------------------------------------------------------------
// NewTaskDraft — card-create extension (api.md §E.1)
// ---------------------------------------------------------------------------

/**
 * The data the user enters in TaskComposer before saving.
 * `title` fills BOTH `title.en` and `title.zh` (single-input bilingual design).
 */
export interface NewTaskDraft {
  /** Raw title string typed by the user; trimmed by addCard. Fills BOTH title.en + title.zh. */
  readonly title: string;
  /** Optional tag preset — omitted means "no tag". */
  readonly tag?: TaskTagId;
  /** Optional custom-list preset. */
  readonly listId?: string;
  /** Optional multi-tag preset. */
  readonly tags?: ReadonlyArray<string>;
  /** Optional priority preset. */
  readonly priority?: TaskPriority;
  /** Optional detail notes. */
  readonly notes?: string;
  /** When true (and target ≠ "nodate"), addCard derives date via dateForCol(targetBucket, now). */
  readonly withDate: boolean;
}
