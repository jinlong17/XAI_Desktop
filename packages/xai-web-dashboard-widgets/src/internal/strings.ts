/**
 * @internal — Local STR table for the StickyComposer dialog.
 *
 * Per §E design: NO `plugin-web-tokens` edit. All new bilingual
 * strings live here, mirroring the tasks `STR_TASK_COMPOSER` and
 * calendar `STR_EVENT_COMPOSER` pattern.
 *
 * Shape: `Record<string, { en: string; zh: string }>` — access via
 * `STR_STICKY_COMPOSER[key][lang]` where `lang: "en" | "zh"`.
 *
 * The widget header label continues flowing through `useI18n` from
 * `@repo/plugin-web-tokens` (existing `dashboard.sticky_notes` key).
 *
 * Design:  packages/xai-web-dashboard-widgets/docs/design.md §E
 * API:     packages/xai-web-dashboard-widgets/docs/api.md §E
 */

/** StickyComposer dialog strings (dialog title, field labels, buttons, color names). */
export const STR_STICKY_COMPOSER = {
  title:           { en: "New sticky note",          zh: "新建便签" },
  title_edit:      { en: "Edit sticky note",         zh: "编辑便签" },
  field_note:      { en: "Note",                     zh: "内容" },
  field_color:     { en: "Color",                    zh: "颜色" },
  color_sun:       { en: "Yellow",                   zh: "黄色" },
  color_mint:      { en: "Green",                    zh: "绿色" },
  color_peach:     { en: "Peach",                    zh: "橙色" },
  color_sky:       { en: "Blue",                     zh: "蓝色" },
  color_lilac:     { en: "Purple",                   zh: "紫色" },
  color_rose:      { en: "Rose",                     zh: "玫瑰" },
  color_coral:     { en: "Coral",                    zh: "珊瑚" },
  color_lime:      { en: "Lime",                     zh: "青柠" },
  color_teal:      { en: "Teal",                     zh: "青色" },
  color_slate:     { en: "Slate",                    zh: "灰蓝" },
  source_panel:    { en: "Use existing tasks",       zh: "选择现有任务" },
  source_hint:     { en: "Click a task to paste its details into the note.", zh: "点击任务即可把标题、清单、标签和时间贴入便签。" },
  source_empty:    { en: "No saved tasks yet",       zh: "暂无已保存任务" },
  source_all:      { en: "All",                      zh: "全部" },
  source_inbox:    { en: "Inbox",                    zh: "收件箱" },
  source_attention:{ en: "Attention",                zh: "待处理" },
  source_completed:{ en: "Completed",                zh: "已完成" },
  source_selected: { en: "Selected source",          zh: "已选择来源" },
  meta_list:       { en: "List",                     zh: "清单" },
  meta_tag:        { en: "Tag",                      zh: "标签" },
  meta_time:       { en: "Time",                     zh: "时间" },
  meta_done:       { en: "Done",                     zh: "已完成" },
  btn_save:        { en: "Save",                     zh: "保存" },
  btn_cancel:      { en: "Cancel",                   zh: "取消" },
  hint_empty:      { en: "Click + to add a note",   zh: "点击 + 添加便签" },
  aria_add:        { en: "Add sticky note",          zh: "添加便签" },
  aria_edit:       { en: "Edit sticky note",         zh: "编辑便签" },
  aria_edit_move:  { en: "Edit or drag sticky note", zh: "编辑或拖拽移动便签" },
  aria_delete:     { en: "Delete note",              zh: "删除便签" },
  aria_resize:     { en: "Resize note",              zh: "调整便签大小" },
  aria_sample:     { en: "Sample note (read-only)",  zh: "示例便签（只读）" },
} as const;

/** Typed key for STR_STICKY_COMPOSER. */
export type StickyComposerStrKey = keyof typeof STR_STICKY_COMPOSER;

/** Convenience accessor: `str(key, lang)`. */
export function str(key: StickyComposerStrKey, lang: "en" | "zh"): string {
  return STR_STICKY_COMPOSER[key][lang];
}

// ---------------------------------------------------------------------------
// §F — Widget empty-state strings (real-data wiring, 2026-05-28)
// ---------------------------------------------------------------------------

/**
 * Local bilingual strings for the 5 real-data widgets' empty states.
 *
 * Per §F design: NO `plugin-web-tokens` edit. Empty-state copy lives here,
 * extending the EXISTING local STR table (added alongside STR_STICKY_COMPOSER
 * by §E). The existing widget LABELS (`dashboard.tasks_done`, `streak`,
 * `pomos`, `upcoming`) continue flowing through `useI18n` / `plugin-web-tokens`.
 *
 * N2 build note: empty-state keys go in THIS dedicated table (STR_WIDGET_EMPTY),
 * NOT blindly into STR_STICKY_COMPOSER.
 *
 * Design:  packages/xai-web-dashboard-widgets/docs/design.md §F.1 #13
 * API:     packages/xai-web-dashboard-widgets/docs/api.md §F
 */
export const STR_WIDGET_EMPTY = {
  /** StatTasks: no tasks at all (total === 0). */
  stat_tasks_empty:   { en: "No tasks yet",    zh: "暂无任务" },
  /** StatStreak: habits exist but 0-streak today (and no habit at all). */
  stat_streak_empty:  { en: "No habits yet",   zh: "暂无习惯" },
  /** UpcomingWidget: calendar store is empty or no upcoming events. */
  upcoming_empty:     { en: "No upcoming events", zh: "暂无近期事件" },
} as const;

/** Typed key for STR_WIDGET_EMPTY. */
export type WidgetEmptyStrKey = keyof typeof STR_WIDGET_EMPTY;

/** Convenience accessor for empty-state strings: `strEmpty(key, lang)`. */
export function strEmpty(key: WidgetEmptyStrKey, lang: "en" | "zh"): string {
  return STR_WIDGET_EMPTY[key][lang];
}

// ---------------------------------------------------------------------------
// §G-A — Weather editor strings (weather manual-entry, 2026-05-29)
// ---------------------------------------------------------------------------

/**
 * Local bilingual strings for WeatherEditor and WeatherWidget empty state.
 *
 * Per §G design: NO `plugin-web-tokens` edit. Dedicated table (NOT stuffed
 * into STR_STICKY_COMPOSER or STR_WIDGET_EMPTY — §F N2 / §G.6 note).
 * The widget header "Weather" label continues from `dashboard.weather` token.
 *
 * Design:  packages/xai-web-dashboard-widgets/docs/design.md §G
 * API:     packages/xai-web-dashboard-widgets/docs/api.md §G.6
 */
export const STR_WEATHER = {
  editor_title:   { en: "Set weather",         zh: "设置天气" },
  auto_section:   { en: "Auto weather",        zh: "自动天气" },
  manual_section: { en: "Manual fallback",     zh: "手动兜底" },
  auto_hint:      { en: "Search a city and choose a result to pull live weather.", zh: "搜索城市并选择结果后自动拉取实时天气。" },
  manual_hint:    { en: "Optional fallback. It stays visible if the network update fails.", zh: "可选兜底；网络更新失败时仍会保留显示。" },
  provider_open_meteo: { en: "Open-Meteo",      zh: "Open-Meteo" },
  field_city:     { en: "City",                 zh: "城市" },
  field_temp:     { en: "Temperature (°)",      zh: "温度 (°)" },
  field_condition:{ en: "Condition",            zh: "天气状况" },
  field_hi:       { en: "Today high (°)",       zh: "今日最高 (°)" },
  field_lo:       { en: "Today low (°)",        zh: "今日最低 (°)" },
  cond_sunny:     { en: "Sunny",                zh: "晴" },
  cond_cloudy:    { en: "Cloudy",               zh: "多云" },
  cond_rainy:     { en: "Rainy",                zh: "雨" },
  btn_save:       { en: "Save",                 zh: "保存" },
  btn_cancel:     { en: "Cancel",               zh: "取消" },
  search_btn:     { en: "Search",               zh: "搜索" },
  searching:      { en: "Searching",            zh: "搜索中" },
  search_results: { en: "City results",         zh: "城市结果" },
  search_empty:   { en: "No city result found", zh: "没有找到城市结果" },
  search_error:   { en: "Could not search cities. Try again or use manual fallback.", zh: "城市搜索失败。可重试或使用手动兜底。" },
  selected_location: { en: "Selected",          zh: "已选择" },
  empty:          { en: "Set your weather",     zh: "设置你的天气" },
  edit_aria:      { en: "Edit weather",         zh: "编辑天气" },
  updating:       { en: "Updating weather",     zh: "正在更新天气" },
  fetch_error:    { en: "Could not update weather. Showing saved fallback.", zh: "天气更新失败，已显示保存的兜底信息。" },
  needs_manual:   { en: "Weather location saved. Add manual fallback if this stays empty.", zh: "天气位置已保存。如持续为空，可添加手动兜底。" },
  humidity:       { en: "Humidity",             zh: "湿度" },
  wind:           { en: "Wind",                 zh: "风速" },
  feels_like:     { en: "Feels",                zh: "体感" },
  rain_chance:    { en: "Rain",                 zh: "降水" },
  source_open_meteo: { en: "Live via Open-Meteo", zh: "Open-Meteo 实时" },
  source_manual:  { en: "Manual weather",       zh: "手动天气" },
  err_city:       { en: "City cannot be empty", zh: "城市不能为空" },
  err_temp:       { en: "Enter a valid temperature", zh: "请输入有效温度" },
} as const;

/** Typed key for STR_WEATHER. */
export type WeatherStrKey = keyof typeof STR_WEATHER;

/** Convenience accessor for weather strings: `strWeather(key, lang)`. */
export function strWeather(key: WeatherStrKey, lang: "en" | "zh"): string {
  return STR_WEATHER[key][lang];
}

// ---------------------------------------------------------------------------
// §G-B — Notifications strings (Mail → Notifications digest, 2026-05-29)
// ---------------------------------------------------------------------------

/**
 * Local bilingual strings for MailWidget (Notifications digest) empty state
 * and source-type labels.
 *
 * Per §G design: NO `plugin-web-tokens` edit. Dedicated table (NOT stuffed
 * into STR_STICKY_COMPOSER or STR_WIDGET_EMPTY — §F N2 / §G.6 note).
 * The widget title may use `STR_NOTIFICATIONS.title` (local copy) instead of
 * the existing `dashboard.mail` token — OQ-Mail-1 resolution.
 *
 * Design:  packages/xai-web-dashboard-widgets/docs/design.md §G
 * API:     packages/xai-web-dashboard-widgets/docs/api.md §G.6
 */
export const STR_NOTIFICATIONS = {
  title:          { en: "Notifications",        zh: "通知" },
  src_overdue:    { en: "Overdue",              zh: "逾期" },
  src_today:      { en: "Today",                zh: "今天" },
  empty:          { en: "All clear",            zh: "暂无通知" },
} as const;

/** Typed key for STR_NOTIFICATIONS. */
export type NotificationStrKey = keyof typeof STR_NOTIFICATIONS;

/** Convenience accessor for notifications strings: `strNotif(key, lang)`. */
export function strNotif(key: NotificationStrKey, lang: "en" | "zh"): string {
  return STR_NOTIFICATIONS[key][lang];
}
