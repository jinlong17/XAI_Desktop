/**
 * @internal — EN/ZH recovery copy for the Settings → Features pane.
 *
 * Normative wording: docs/reviews/web-features-recovery-contract/contract.md §5
 * (field messages, per-field and pane actions, status lines and the Reset to
 * defaults confirmation). Module labels come from the existing `nav.<id>` keys
 * and the guard label from `settings.features`; neither is defined here.
 */

import type { Lang } from "@repo/plugin-web-tokens";

export interface FeaturesRecoveryCopy {
  /** Visible per-field action text; the accessible name adds the module label. */
  readonly retry: string;
  readonly discard: string;
  readonly reload: string;
  readonly retryName: (label: string) => string;
  readonly discardName: (label: string) => string;
  readonly reloadName: (label: string) => string;
  readonly saving: (label: string) => string;
  readonly resetting: (label: string) => string;
  readonly notSaved: (label: string) => string;
  readonly notReset: (label: string) => string;
  readonly unavailable: (label: string) => string;
  /** Existing visible label of Reset to defaults, kept unchanged. */
  readonly reset: string;
  readonly exportDraft: string;
  readonly discardAll: string;
  readonly saved: string;
  readonly restored: string;
  readonly exportFailed: string;
  /** Truthful `window.confirm` text: only module visibility changes; data is kept. */
  readonly confirmReset: string;
}

const EN: FeaturesRecoveryCopy = {
  retry: "Retry",
  discard: "Discard",
  reload: "Reload",
  retryName: (label) => `Retry ${label}`,
  discardName: (label) => `Discard ${label}`,
  reloadName: (label) => `Reload ${label}`,
  saving: (label) => `${label} is saving.`,
  resetting: (label) => `${label} is being reset to its default.`,
  notSaved: (label) => `${label} was not saved.`,
  notReset: (label) => `${label} was not reset to its default.`,
  unavailable: (label) => `Saved ${label} is unavailable. Reload it; this is not a new unsaved change.`,
  reset: "Reset to defaults",
  exportDraft: "Export Features draft",
  discardAll: "Discard all changes",
  saved: "Features settings saved.",
  restored: "Defaults restored.",
  exportFailed: "Export failed. Please retry.",
  confirmReset: "Turn all 8 modules back on? This only changes which modules are shown; your data is kept.",
};

const ZH: FeaturesRecoveryCopy = {
  retry: "重试",
  discard: "放弃",
  reload: "重新读取",
  retryName: (label) => `重试 ${label}`,
  discardName: (label) => `放弃 ${label}`,
  reloadName: (label) => `重新读取 ${label}`,
  saving: (label) => `${label}正在保存。`,
  resetting: (label) => `${label}正在恢复默认。`,
  notSaved: (label) => `${label}未保存。`,
  notReset: (label) => `${label}未恢复默认。`,
  unavailable: (label) => `已保存的${label}不可用。请重新读取；这不是新的未保存更改。`,
  reset: "恢复默认",
  exportDraft: "导出功能草稿",
  discardAll: "放弃全部更改",
  saved: "功能设置已保存。",
  restored: "已恢复默认设置。",
  exportFailed: "导出失败，请重试。",
  confirmReset: "将全部 8 个模块恢复为开启？这只改变显示哪些模块，数据会保留。",
};

export function featuresRecoveryCopy(lang: Lang): FeaturesRecoveryCopy {
  return lang === "zh" ? ZH : EN;
}
