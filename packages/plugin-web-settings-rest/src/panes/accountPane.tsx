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
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { localI18n } from "../internal/localI18n.js";
import { DeleteAccountConfirmModal } from "../internal/DeleteAccountConfirmModal.js";

function AccountPaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const t = localI18n(lang);
  const [modalOpen, setModalOpen] = React.useState(false);

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

  function handleSubmit(): void {
    // Orchestrator wiring added in P3.
    // In P1, no-op (UI only).
    setModalOpen(false);
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

      <DeleteAccountConfirmModal
        open={modalOpen}
        lang={lang}
        onCancel={handleModalCancel}
        onStep1Continue={handleStep1Continue}
        onSubmit={handleSubmit}
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
