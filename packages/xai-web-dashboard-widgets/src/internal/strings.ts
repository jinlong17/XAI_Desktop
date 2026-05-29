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
  field_note:      { en: "Note",                     zh: "内容" },
  field_color:     { en: "Color",                    zh: "颜色" },
  color_sun:       { en: "Yellow",                   zh: "黄色" },
  color_mint:      { en: "Green",                    zh: "绿色" },
  color_peach:     { en: "Peach",                    zh: "橙色" },
  color_sky:       { en: "Blue",                     zh: "蓝色" },
  color_lilac:     { en: "Purple",                   zh: "紫色" },
  btn_save:        { en: "Save",                     zh: "保存" },
  btn_cancel:      { en: "Cancel",                   zh: "取消" },
  hint_empty:      { en: "Click + to add a note",   zh: "点击 + 添加便签" },
  aria_add:        { en: "Add sticky note",          zh: "添加便签" },
  aria_delete:     { en: "Delete note",              zh: "删除便签" },
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
