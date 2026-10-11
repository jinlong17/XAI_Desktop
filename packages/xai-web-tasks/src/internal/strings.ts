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
 * REL-01 supersedes the legacy bucket approximation: exact local dueDate filters.
 */
export const STR_SMART_LIST_EMPTY = {
  /** list=all / list=summary: should never be shown (all/summary show everything) */
  all:      { en: "No tasks",                      zh: "没有任务" },
  summary:  { en: "No tasks",                      zh: "没有任务" },
  /** list=inbox */
  inbox:    { en: "No inbox tasks",                zh: "没有收件箱任务" },
  next7: { en: "Nothing due in the next 7 days", zh: "未来 7 天没有到期任务" },
  today: { en: "Nothing due today or overdue", zh: "今天没有到期或逾期任务" },
  tomorrow: { en: "Nothing due tomorrow", zh: "明天没有到期任务" },
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
