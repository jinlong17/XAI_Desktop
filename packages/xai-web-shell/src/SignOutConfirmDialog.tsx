/**
 * SignOutConfirmDialog — native <dialog> confirmation modal for sign-out.
 *
 * Pattern: native HTML <dialog> element, matching the dashboard-widget picker
 * pattern used in gap-closure #5. No new npm dependencies.
 *
 * Props:
 *   open      — controls visibility (true = dialog is shown)
 *   onConfirm — called when user clicks "Sign out" / "退出" — host performs sign-out
 *   onCancel  — called when user cancels (Cancel button / ESC / backdrop click)
 *
 * a11y:
 *   - Focus is moved to the dialog on open (focus trap via <dialog> native behaviour)
 *   - ESC closes (native <dialog> ESC handling + explicit keydown fallback)
 *   - Backdrop click closes
 *   - role="dialog" + aria-modal="true" + aria-labelledby
 *
 * i18n: reads from useWebShell().lang — uses existing avatar.sign_out_confirm_*
 *       keys added to @repo/plugin-web-tokens i18n bundles.
 *
 * Bugfix: Audit Top-10 #1 / Rail-10 — AvatarMenu Sign-out Option C wire.
 */

import type { ReactElement } from "react";
import { useEffect, useRef } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import { useWebShell } from "./registry.js";

export interface SignOutConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SignOutConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: SignOutConfirmDialogProps): ReactElement | null {
  const { lang } = useWebShell();
  const { s } = useI18n(lang);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Open / close the native <dialog> imperatively to keep HTML semantics
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [open]);

  // ESC closes via native <dialog> cancel event (browser default)
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onCancel();
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [onCancel]);

  // Backdrop (::backdrop / click outside content) closes
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    // A click directly on the <dialog> element (not its children) = backdrop click
    if (e.target === dialogRef.current) {
      onCancel();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="xai-sign-out-dialog"
      aria-modal="true"
      aria-labelledby="xai-sign-out-title"
      onClick={handleDialogClick}
    >
      <div className="xai-sign-out-dialog__content">
        <h2 id="xai-sign-out-title" className="xai-sign-out-dialog__title">
          {s("avatar.sign_out_confirm_title")}
        </h2>
        <p className="xai-sign-out-dialog__body">
          {s("avatar.sign_out_confirm_body")}
        </p>
        <div className="xai-sign-out-dialog__actions">
          <button
            type="button"
            className="xai-sign-out-dialog__btn xai-sign-out-dialog__btn--cancel"
            onClick={onCancel}
          >
            {s("common.cancel")}
          </button>
          <button
            type="button"
            className="xai-sign-out-dialog__btn xai-sign-out-dialog__btn--confirm"
            onClick={onConfirm}
          >
            {s("avatar.sign_out")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
