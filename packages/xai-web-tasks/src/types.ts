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

export type TaskTagId = "study" | "work" | "personal" | "todo" | "other";

// ---------------------------------------------------------------------------
// TaskTitleBundle — bilingual title structure
// ---------------------------------------------------------------------------

export interface TaskTitleBundle {
  readonly en: string;
  readonly zh: string;
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
  /** When true (and target ≠ "nodate"), addCard derives date via dateForCol(targetBucket, now). */
  readonly withDate: boolean;
}
