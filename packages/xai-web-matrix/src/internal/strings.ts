/**
 * @internal — Local STR table for the MatrixComposer dialog.
 *
 * Per design.md §E.1 #9 / api.md §E: NO `plugin-web-tokens` edit.
 * All new bilingual strings live here, mirroring the Tasks `STR_TASK_COMPOSER` pattern.
 *
 * Shape: `Record<string, { en: string; zh: string }>` — access via
 * `STR_MATRIX_COMPOSER.key[lang]` where `lang: "en" | "zh"`.
 *
 * Reviewer rec (non-blocking): quadrant labels prefer existing `matrix.*` i18n keys
 * over duplicates here. For the quadrant radiogroup, we use the `useI18n` hook
 * with the existing `matrix.*` keys (no duplication), so those are NOT listed here.
 * Only truly-composer-specific strings are in this table.
 *
 * Design:  packages/xai-web-matrix/docs/design.md §E.1 #9
 * API:     packages/xai-web-matrix/docs/api.md §E (extension)
 */

/** MatrixComposer dialog strings (dialog title, field labels, buttons, errors). */
export const STR_MATRIX_COMPOSER = {
  title_create:       { en: "New card",             zh: "新建卡片" },
  field_title:        { en: "Title",                zh: "标题" },
  field_tag:          { en: "Tag",                  zh: "标签" },
  field_quadrant:     { en: "Quadrant",             zh: "象限" },
  tag_none:           { en: "None",                 zh: "无" },
  btn_save:           { en: "Add",                  zh: "添加" },
  btn_cancel:         { en: "Cancel",               zh: "取消" },
  err_title_required: { en: "Title is required",    zh: "标题不能为空" },
} as const;
