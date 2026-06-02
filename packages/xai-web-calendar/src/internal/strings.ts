/**
 * @internal — Local STR tables for the Event CRUD extension.
 *
 * Per `api.md §11.6.2`: NO `plugin-web-tokens` edit. All new bilingual
 * strings live here, mirroring the `CardDetailDialog` local-STR pattern.
 *
 * Shape: `Record<string, { en: string; zh: string }>` — the value-object
 * shape narrows on access so consumers can call `STR.title_create[lang]`
 * with `lang: "en" | "zh"` and get a string.
 *
 * AC-I18N-CREATE-3: TypeScript narrows on access per the sibling-pair
 * `{ en; zh }` shape. (The record-level shape doesn't enforce missing
 * keys across siblings — that's covered by the test that grep-asserts
 * every key has both `en` and `zh`.)
 *
 * Design: docs/design.md §16.2 #8
 * API:    docs/api.md §11.6.2
 */

import type { Lang } from "@repo/plugin-web-tokens";

/**
 * Bilingual record shape — each value object carries `en` + `zh`.
 * Use with `STR.key[lang]` access pattern.
 */
export type BilingualRecord<K extends string = string> = {
  readonly [P in K]: { readonly en: string; readonly zh: string };
};

/** EventComposer dialog strings (titles, field labels, buttons, errors). */
export const STR_EVENT_COMPOSER = {
  title_create:           { en: "New event",                       zh: "新建事件" },
  title_edit:             { en: "Edit event",                      zh: "编辑事件" },
  field_title:            { en: "Title",                           zh: "标题" },
  field_date:             { en: "Date",                            zh: "日期" },
  field_start:            { en: "Start",                           zh: "开始" },
  field_end:              { en: "End",                             zh: "结束" },
  field_color:            { en: "Color",                           zh: "颜色" },
  field_tag:              { en: "Tag",                             zh: "标签" },
  field_notes:            { en: "Notes",                           zh: "备注 / 描述" },
  field_all_day:          { en: "All-day",                         zh: "全天" },
  field_reminder:         { en: "Reminder",                        zh: "提醒" },
  field_recurrence:       { en: "Recurrence",                      zh: "重复" },
  reminder_none:          { en: "No reminder",                     zh: "不提醒" },
  reminder_at_start:      { en: "At start time",                   zh: "开始时" },
  reminder_5m:            { en: "5 minutes before",                zh: "提前 5 分钟" },
  reminder_15m:           { en: "15 minutes before",               zh: "提前 15 分钟" },
  reminder_30m:           { en: "30 minutes before",               zh: "提前 30 分钟" },
  reminder_1h:            { en: "1 hour before",                   zh: "提前 1 小时" },
  reminder_1d:            { en: "1 day before",                    zh: "提前 1 天" },
  recur_none:             { en: "None",                            zh: "不重复" },
  recur_daily:            { en: "Daily",                           zh: "每天" },
  recur_weekly:           { en: "Weekly",                          zh: "每周" },
  btn_save:               { en: "Save",                            zh: "保存" },
  btn_cancel:             { en: "Cancel",                          zh: "取消" },
  btn_delete:             { en: "Delete",                          zh: "删除" },
  err_title_required:     { en: "Title is required",               zh: "标题不能为空" },
  err_end_before_start:   { en: "End time must be after start",    zh: "结束时间必须晚于开始" },
  err_min_duration:       { en: "Event must be at least 5 minutes", zh: "事件时长至少 5 分钟" },
  err_multi_day:          { en: "Event cannot span multiple days", zh: "事件不能跨日" },
  err_invalid_date:       { en: "Date must be YYYY-MM-DD",         zh: "日期格式必须是 YYYY-MM-DD" },
  err_invalid_time:       { en: "Time must be HH:MM",              zh: "时间格式必须是 HH:MM" },
} as const;

/** Empty-state hint shown when both fixture + user events are absent in viewport (Q7-A). */
export const EMPTY_STATE_HINT = {
  hint:  { en: "Click + to create your first event", zh: "点击 + 创建第一个事件" },
} as const;

/** "Sample" badge label appended to fixture chips (Q9-E). */
export const SAMPLE_BADGE = {
  label: { en: "Sample", zh: "示例" },
} as const;

/** Day overview popover strings shown before the event composer. */
export const STR_DAY_OVERVIEW = {
  title:        { en: "Day overview",              zh: "当天总览" },
  empty:        { en: "No events for this day",    zh: "当天暂无事件" },
  new_event:    { en: "New event",                 zh: "新建事件" },
  close:        { en: "Close",                     zh: "关闭" },
  all_day:      { en: "All-day",                   zh: "全天" },
  sample_note:  { en: "Sample event",              zh: "示例事件" },
  editable_note:{ en: "Click to edit",             zh: "点击编辑" },
} as const;

/**
 * Helper: read a bilingual leaf by language. Avoids ad-hoc `STR.x[lang]`
 * call sites and keeps the narrowing in one place.
 */
export function s<K extends string>(
  table: BilingualRecord<K>,
  key: K,
  lang: Lang,
): string {
  return table[key][lang];
}
