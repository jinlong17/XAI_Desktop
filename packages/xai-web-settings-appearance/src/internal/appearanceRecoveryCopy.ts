/**
 * @internal — EN/ZH recovery copy for Settings → Appearance (CP-APPEARANCE-01).
 *
 * Normative wording: docs/reviews/web-appearance-recovery-contract/contract.md
 * §5 (per-field and pane actions, field messages, status lines, the Reset to
 * defaults and sign-out confirmations, the Topbar status). Field labels come
 * from the existing `settings.*` i18n keys and are not defined here.
 */

import type { Lang } from "@repo/plugin-web-tokens";

export interface AppearanceRecoveryCopy {
  /** Visible per-field action text; the accessible name adds the field label. */
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
  /** Retry all: the visible label and accessible name in every state (A2.1). */
  readonly retryAll: string;
  readonly saved: string;
  readonly restored: string;
  readonly exportFailed: string;
  readonly retrying: string;
  /** The not-saved count line (A2.4 rule 3). */
  readonly notSavedCount: (count: number) => string;
  /** Truthful `window.confirm` text: six fields return to their defaults; language is kept. */
  readonly confirmReset: string;
  /** Topbar status accessible name and visible text. */
  readonly statusName: string;
  readonly statusText: string;
  /** `window.confirm` text of the sign-out step. */
  readonly confirmSignOut: string;
}

const EN: AppearanceRecoveryCopy = {
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
  exportDraft: "Export Appearance draft",
  discardAll: "Discard all changes",
  retryAll: "Retry all",
  saved: "Appearance settings saved.",
  restored: "Defaults restored.",
  exportFailed: "Export failed. Please retry.",
  retrying: "Retrying unsaved appearance changes…",
  notSavedCount: (count) => (count === 1 ? "1 appearance change is not saved." : `${count} appearance changes are not saved.`),
  confirmReset:
    "Reset theme, density, font scale, accent color, background palette and sidebar position to their defaults? Language is kept.",
  statusName: "Appearance changes not saved. Review them in Settings.",
  statusText: "Not saved",
  confirmSignOut: "Some appearance changes are not saved. Sign out and discard them?",
};

const ZH: AppearanceRecoveryCopy = {
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
  exportDraft: "导出外观草稿",
  discardAll: "放弃全部更改",
  retryAll: "全部重试",
  saved: "外观设置已保存。",
  restored: "已恢复默认设置。",
  exportFailed: "导出失败，请重试。",
  retrying: "正在重试未保存的外观更改…",
  notSavedCount: (count) => `${count} 项外观更改未保存。`,
  confirmReset: "将主题、密度、字体大小、主题色、背景调子和侧栏位置恢复为默认值？语言保持不变。",
  statusName: "外观更改未保存，前往设置查看。",
  statusText: "未保存",
  confirmSignOut: "部分外观更改尚未保存。仍要退出并放弃这些更改吗？",
};

export function appearanceRecoveryCopy(lang: Lang): AppearanceRecoveryCopy {
  return lang === "zh" ? ZH : EN;
}
