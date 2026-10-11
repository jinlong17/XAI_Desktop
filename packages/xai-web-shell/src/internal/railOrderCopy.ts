/**
 * @internal — EN/ZH wording of the rail-order recovery surface (CP-APPRAIL-01).
 *
 * Normative text: docs/reviews/web-apprail-order-recovery-contract/contract.md
 * r1 §5 ("Normative wording"). "Sidebar" follows the accepted Appearance label
 * "Sidebar position" / "侧栏位置". Every string appears in the language
 * currently displayed.
 */

import type { Lang } from "@repo/plugin-web-tokens";

export interface RailOrderActionCopy {
  /** Visible label. */
  readonly label: string;
  /** Accessible name. */
  readonly name: string;
}

export interface RailOrderCopy {
  /** Status button accessible name for an unsaved draft. */
  readonly statusDraftName: string;
  /** Status button accessible name for an invalid or unreadable stored order. */
  readonly statusSourceName: string;
  /** Status button visible text (shown from 768 px) for a draft. */
  readonly statusDraftText: string;
  /** Status button visible text (shown from 768 px) for a source issue. */
  readonly statusSourceText: string;
  /** Panel accessible name. */
  readonly panelName: string;
  readonly saving: string;
  readonly notSaved: string;
  readonly unavailable: string;
  readonly exportFailed: string;
  readonly retry: RailOrderActionCopy;
  readonly discard: RailOrderActionCopy;
  readonly exportDraft: RailOrderActionCopy;
  readonly reload: RailOrderActionCopy;
  /** The sign-out confirmation (`window.confirm`). */
  readonly confirmSignOut: string;
}

const EN: RailOrderCopy = {
  statusDraftName: "Sidebar order not saved. Review it.",
  statusSourceName: "Saved sidebar order is unavailable. Review it.",
  statusDraftText: "Order not saved",
  statusSourceText: "Order unavailable",
  panelName: "Sidebar order",
  saving: "Sidebar order is saving.",
  notSaved: "Sidebar order was not saved.",
  unavailable: "Saved sidebar order is unavailable. Reload it; this is not a new unsaved change.",
  exportFailed: "Export failed. Please retry.",
  retry: { label: "Retry", name: "Retry sidebar order" },
  discard: { label: "Discard", name: "Discard sidebar order change" },
  exportDraft: { label: "Export", name: "Export sidebar order draft" },
  reload: { label: "Reload", name: "Reload sidebar order" },
  confirmSignOut: "Your sidebar order change is not saved. Sign out and discard it?",
};

const ZH: RailOrderCopy = {
  statusDraftName: "侧栏顺序未保存，点击查看。",
  statusSourceName: "已保存的侧栏顺序不可用，点击查看。",
  statusDraftText: "顺序未保存",
  statusSourceText: "顺序不可用",
  panelName: "侧栏顺序",
  saving: "侧栏顺序正在保存。",
  notSaved: "侧栏顺序未保存。",
  unavailable: "已保存的侧栏顺序不可用。请重新读取；这不是新的未保存更改。",
  exportFailed: "导出失败，请重试。",
  retry: { label: "重试", name: "重试 侧栏顺序" },
  discard: { label: "放弃", name: "放弃 侧栏顺序更改" },
  exportDraft: { label: "导出", name: "导出侧栏顺序草稿" },
  reload: { label: "重新读取", name: "重新读取 侧栏顺序" },
  confirmSignOut: "侧栏顺序更改尚未保存。仍要退出并放弃这项更改吗？",
};

export function railOrderCopy(lang: Lang): RailOrderCopy {
  return lang === "zh" ? ZH : EN;
}
