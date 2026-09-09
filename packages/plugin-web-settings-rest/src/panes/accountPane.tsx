/**
 * accountPane — Settings → Account pane.
 *
 * Displays mock user info (name / email / free-tier status) + Sign Out button
 * + Delete Account button that opens a native <dialog> 2-step confirm modal.
 *
 * On Step 1 Continue, emits web:settings:rest:account-delete-confirmed
 * (deprecated since 2026-05-26, gap-closure row #9; will be removed in P1
 * desktop pivot. Timing semantics changed from "confirm" to "continue" for
 * one-release back-compat per FA-9 in row #9 design extension.)
 *
 * Port of web design/module-settings.jsx lines 102-131.
 * API contract: packages/plugin-web-settings-rest/docs/api.md §4.1
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { accountScope, exportAccountLocalData, requestAccountDataManagement } from "@repo/plugin-web-storage";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { localI18n } from "../internal/localI18n.js";
import { DeleteAccountConfirmModal } from "../internal/DeleteAccountConfirmModal.js";
import { DeviceRecoveryExport } from "../internal/DeviceRecoveryExport.js";

function AccountPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const t = localI18n(lang);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [scope] = React.useState(() => accountScope.capture());
  const [exportMessage, setExportMessage] = React.useState<string | null>(null);
  const [exportFailed, setExportFailed] = React.useState(false);

  function exportLocalData(): void {
    let url: string | undefined;
    try {
      accountScope.assertCurrent(scope);
      const data = exportAccountLocalData(scope);
      url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `xai-account-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link);
      try { link.click(); } finally { link.remove(); }
      setExportFailed(false);
      const omitted = data.manifest.omitted.length;
      setExportMessage(omitted > 0
        ? (lang === "zh" ? `已请求下载；${omitted} 项凭据类数据已排除，详情见文件内范围清单。这不是云端备份。` : `Download requested; ${omitted} credential-related items were excluded. See the file's scope manifest; this is not a cloud backup.`)
        : (lang === "zh" ? "已请求下载，请检查浏览器下载记录。这不是云端备份。" : "Download requested. Check your browser downloads; this is not a cloud backup."));
    } catch {
      setExportFailed(true);
      setExportMessage(lang === "zh" ? "无法导出当前账户数据。请确认账户已解锁，并检查浏览器存储权限后重试。" : "Could not export this account. Unlock the account and check browser storage permissions, then retry.");
    } finally {
      if (url) { const completedUrl = url; setTimeout(() => URL.revokeObjectURL(completedUrl), 1000); }
    }
  }

  function handleDeleteClick(): void {
    setModalOpen(true);
  }

  function handleModalCancel(): void {
    setModalOpen(false);
  }

  /**
   * Step 1 → Continue:
   * Emit deprecated event (one-release back-compat per row #9 FA-9).
   * Timing changed from final-confirm to step1-continue.
   * @deprecated since 2026-05-26 (gap-closure row #9); removed in P1.
   */
  function handleStep1Continue(): void {
    emitWebEvent("web:settings:rest:account-delete-confirmed", {
      confirmedAt: new Date().toISOString(),
    });
    // Modal itself transitions to Step 2 internally.
  }

  return (
    <div className="account-pane">
      <div className="acct-avatar">
        <svg viewBox="0 0 96 96" width="96" height="96" aria-hidden="true">
          <defs>
            <linearGradient id="agf" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="oklch(85% 0.05 55)" />
              <stop offset="1" stopColor="oklch(65% 0.08 40)" />
            </linearGradient>
          </defs>
          <circle cx="48" cy="48" r="48" fill="url(#agf)" />
          <circle cx="48" cy="38" r="14" fill="oklch(100% 0 0)" opacity={0.75} />
          <ellipse cx="48" cy="78" rx="26" ry="18" fill="oklch(100% 0 0)" opacity={0.55} />
        </svg>
        <button type="button" className="acct-edit" aria-label={t("account.edit_avatar")}>
          +
        </button>
      </div>

      <h3 className="acct-name">{t("account.name_en")}</h3>
      <div className="acct-email">{t("account.email")}</div>
      <div className="acct-status">
        {t("account.using_free")}{" "}
        <button type="button" className="acct-upgrade">
          {t("account.upgrade_now")}
        </button>
      </div>

      <div className="acct-actions">
        <button type="button" className="btn ghost">
          {t("account.sign_out")}
        </button>
        <button
          type="button"
          className="acct-danger"
          onClick={handleDeleteClick}
          data-testid="delete-account-btn"
        >
          {t("account.delete")}
        </button>
      </div>

      <section aria-label={lang === "zh" ? "本地账户数据" : "Local account data"}>
        <p>{lang === "zh" ? "导出仅包含当前账户的本地业务数据，不包含登录凭据、AI 密钥或其他账户数据。" : "Export includes this account's local content, excluding login credentials, AI keys and other accounts."}</p>
        <p>{lang === "zh" ? "设备布局、未归属的旧数据与迁移归档不在此账户文件中。导出文件附有范围清单；暂不支持直接导入恢复。" : "Device layout, unassigned old data and migration archives are excluded. The file includes a scope manifest; direct import and restore are not currently supported."}</p>
        <button type="button" className="btn ghost" onClick={exportLocalData}>
          {lang === "zh" ? "导出当前账户本地数据" : "Export this account's local data"}
        </button>
        <button type="button" className="btn ghost" onClick={() => { try { accountScope.assertCurrent(scope); requestAccountDataManagement(); } catch { setExportFailed(true); setExportMessage(lang === "zh" ? "账户已更改，请重新打开设置。" : "Account changed. Reopen settings."); } }}>
          {lang === "zh" ? "管理本地数据导入与回滚" : "Manage local data import and rollback"}
        </button>
        {exportMessage && <p role={exportFailed ? "alert" : "status"}>{exportMessage}</p>}
      </section>
      <DeviceRecoveryExport lang={lang} />

      <DeleteAccountConfirmModal
        open={modalOpen}
        lang={lang}
        onCancel={handleModalCancel}
        onStep1Continue={handleStep1Continue}
      />
    </div>
  );
}

export const accountPane: Pane = {
  id: "account",
  icon: "sliders",
  i18nKey: "settings.account",
  render: (props: PaneRenderProps): React.ReactElement => (
    <AccountPaneContent {...props} />
  ),
};
