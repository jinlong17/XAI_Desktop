/**
 * @internal — DeleteAccountConfirmModal.tsx
 *
 * Native <dialog>-based confirm modal for the Delete Account action.
 * Uses showModal() / close() per HTMLDialogElement API.
 *
 * API contract: packages/xai-web-settings-rest/docs/api.md §2.1
 * ADR: docs/adr/0007-xai-web-console-build-form.md §S5 R8 (no DOM globals; typed refs)
 */

import * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { localI18n } from "./localI18n.js";

interface DeleteAccountConfirmModalProps {
  readonly open: boolean;
  readonly lang: Lang;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

export function DeleteAccountConfirmModal({
  open,
  lang,
  onCancel,
  onConfirm,
}: DeleteAccountConfirmModalProps): React.ReactElement {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const t = localI18n(lang);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (typeof dialog.showModal === "function") {
        try {
          dialog.showModal();
        } catch {
          // Already open — safe to ignore.
        }
      }
    } else {
      if (typeof dialog.close === "function") {
        dialog.close();
      }
    }
  }, [open]);

  function handleCancel(): void {
    onCancel();
  }

  function handleConfirm(): void {
    onConfirm();
  }

  // Clicking the backdrop (dialog itself, not its children) cancels.
  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>): void {
    if (e.target === dialogRef.current) {
      handleCancel();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="delete-account-modal"
      onClick={handleDialogClick}
      aria-labelledby="dam-title"
      aria-describedby="dam-body"
    >
      <div className="dam-inner">
        <h3 id="dam-title" className="dam-title">
          {t("deleteModal.title")}
        </h3>
        <p id="dam-body" className="dam-body">
          {t("deleteModal.body")}
        </p>
        <div className="dam-actions">
          <button type="button" className="btn ghost" onClick={handleCancel}>
            {t("deleteModal.cancel")}
          </button>
          <button type="button" className="btn danger" onClick={handleConfirm}>
            {t("deleteModal.confirm")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
