/**
 * @internal — Local STR table for the TaskComposer dialog.
 *
 * Per api.md §E.7: NO `plugin-web-tokens` edit. All new bilingual
 * strings live here, mirroring the calendar `STR_EVENT_COMPOSER` pattern.
 *
 * Shape: `Record<string, { en: string; zh: string }>` — access via
 * `STR_TASK_COMPOSER.key[lang]` where `lang: "en" | "zh"`.
 *
 * Tag labels themselves continue flowing through `useI18n` from
 * `@repo/plugin-web-tokens` (existing `tag.*` keys).
 *
 * Design:  packages/xai-web-tasks/docs/design.md §E.1 #9
 * API:     packages/xai-web-tasks/docs/api.md §E.7
 */

/**
 * Smart-list filter empty-state strings (FP2 — xai-web-tasks-smartlist-filter).
 *
 * D-QT BINDING DIRECTIVE (feature-review): today/tomorrow empty-state copy MUST NOT
 * claim "due today/tomorrow" precision. These lists show *bucket views*:
 *  - "today" shows the "overdue" bucket (past-due / needs-attention-now).
 *  - "tomorrow" shares the "next7" bucket with "next7" (nearest upcoming bucket).
 * Wording must reflect what is actually shown, not a calendar-day filter.
 *
 * Examples of COMPLIANT copy (D-QT):
 *  - today → "No overdue tasks" / "没有逾期任务"
 *  - tomorrow/next7 → "Nothing in the next 7 days" / "最近 7 天没有任务"
 *
 * Examples of NON-COMPLIANT copy (D-QT VIOLATION):
 *  - "Nothing due today" / "今天没有到期任务" — claims precise calendar-day match.
 *  - "Nothing due tomorrow" — same issue.
 *
 * API: packages/xai-web-tasks/docs/api.md §F.6
 * Design: packages/xai-web-tasks/docs/design.md §F.1 #8 + Q-T ruling
 */
export const STR_SMART_LIST_EMPTY = {
  /** list=all / list=summary: should never be shown (all/summary show everything) */
  all:      { en: "No tasks",                      zh: "没有任务" },
  summary:  { en: "No tasks",                      zh: "没有任务" },
  /** list=inbox */
  inbox:    { en: "No inbox tasks",                zh: "没有收件箱任务" },
  /** list=next7 — shows the next7 bucket (nearest upcoming dated bucket) */
  next7:    { en: "Nothing in the next 7 days",    zh: "最近 7 天没有任务" },
  /**
   * list=today — shows the "overdue" bucket (D-QT: bucket view, NOT "due today").
   * Copy is bucket-framed: "No overdue tasks", not "Nothing due today".
   */
  today:    { en: "No overdue tasks",              zh: "没有逾期任务" },
  /**
   * list=tomorrow — shows the "next7" bucket (D-QT: bucket view, NOT "due tomorrow").
   * Shares wording with next7 since both map to the same bucket.
   */
  tomorrow: { en: "Nothing in the next 7 days",    zh: "最近 7 天没有任务" },
} as const;

/** TaskComposer dialog strings (dialog title, field labels, buttons, errors). */
export const STR_TASK_COMPOSER = {
  title_create:        { en: "New task",                    zh: "新建任务" },
  field_title:         { en: "Title",                       zh: "标题" },
  field_tag:           { en: "Tag",                         zh: "标签" },
  field_bucket:        { en: "Bucket",                      zh: "时间列" },
  field_add_date:      { en: "Add a date",                  zh: "添加日期" },
  tag_none:            { en: "None",                        zh: "无" },
  bucket_overdue:      { en: "Overdue",                     zh: "过期" },
  bucket_next7:        { en: "Next 7 Days",                 zh: "最近 7 天" },
  bucket_later:        { en: "Later",                       zh: "以后" },
  bucket_nodate:       { en: "No Date",                     zh: "无日期" },
  btn_save:            { en: "Add",                         zh: "添加" },
  btn_cancel:          { en: "Cancel",                      zh: "取消" },
  err_title_required:  { en: "Title is required",           zh: "标题不能为空" },
} as const;
