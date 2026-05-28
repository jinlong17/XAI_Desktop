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
