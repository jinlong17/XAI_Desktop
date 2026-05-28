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
