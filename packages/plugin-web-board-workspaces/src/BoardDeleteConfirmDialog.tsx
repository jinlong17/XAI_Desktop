/**
 * BoardDeleteConfirmDialog — native <dialog> alertdialog for destructive
 * delete actions in the board module.
 *
 * Covers two delete sites (Audit Option A §5 — B-12 + B-28):
 *   mode="board" — BoardSwitcher delete board (replaces window.confirm)
 *   mode="card"  — InboxPanel card delete (was ungated; now gated)
 *
 * Design decisions:
 *   - Conditional-mount pattern (MANDATORY): host must only render this
 *     component when a delete is pending. Unconditional mount triggers
 *     jsdom's missing HTMLDialogElement.prototype.close on mount with
 *     open=false → cascades to AC-W8-VIEWS-FIX-LD failures (see
 *     dev_log "Top-10 #5 cycle-2 BLOCKED" entry for history).
 *   - Cancel button has autoFocus: prevents accidental Enter-confirms.
 *   - ESC handled via native `cancel` event → calls onCancel.
 *   - Backdrop click (event.target === dialogRef.current) → calls onCancel.
 *   - role="alertdialog" + aria-labelledby + aria-describedby per ARIA spec.
 *   - No new npm deps; no plugin-web-tokens edit; no EventMap entry.
 *
 * Modeled on ShareModal.tsx (native <dialog>) + SignOutConfirmDialog.tsx
 * (a11y attributes, alertdialog role, autoFocus cancel) precedents.
 */

import { useEffect, useRef } from "react";
import { STR_DELETE_CONFIRM, type Lang } from "./internal/strings.js";

export interface BoardDeleteConfirmDialogProps {
  /** Always true when mounted (use conditional mount in host, not this prop). */
  open: boolean;
  /** "board" → board title/description copy; "card" → card copy. */
  mode: "board" | "card";
  /** Human-readable name of the item being deleted (board name or card text). */
  targetLabel: string;
  lang: Lang;
  /** Called when user clicks Confirm (destructive action approved). */
  onConfirm: () => void;
  /** Called when user clicks Cancel, ESC, or backdrop. */
  onCancel: () => void;
}

const TITLE_ID = "bdc-title";
const DESC_ID = "bdc-desc";

export function BoardDeleteConfirmDialog({
  open,
  mode,
  targetLabel,
  lang,
  onConfirm,
  onCancel,
}: BoardDeleteConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Open via showModal on mount (open is always true when mounted).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    }
  }, [open]);

  // Native ESC fires "cancel" event → call onCancel.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function handleCancel(e: Event) {
      e.preventDefault();
      onCancel();
    }
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onCancel]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      onCancel();
    }
  }

  const STR = STR_DELETE_CONFIRM;
  const title = mode === "board" ? STR.titleBoard[lang] : STR.titleCard[lang];
  const desc = mode === "board" ? STR.descBoard[lang] : STR.descCard[lang];
  const cancelLabel = STR.cancel[lang];
  const confirmLabel = mode === "board" ? STR.confirmBoard[lang] : STR.confirmCard[lang];

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby={TITLE_ID}
      aria-describedby={DESC_ID}
      className="board-delete-dialog"
      data-testid="board-delete-dialog"
      onClick={handleBackdropClick}
    >
      <div className="bdc-body">
        <h2 id={TITLE_ID} className="bdc-title" data-testid="bdc-title">
          {title}
        </h2>
        <p id={DESC_ID} className="bdc-desc" data-testid="bdc-desc">
          {desc}{" "}
          <strong className="bdc-target-label" data-testid="bdc-target-label">
            {targetLabel}
          </strong>
        </p>
        <div className="bdc-footer">
          <button
            type="button"
            className="bdc-btn bdc-btn--cancel"
            data-testid="bdc-cancel"
            onClick={onCancel}
            // autoFocus on Cancel prevents accidental Enter-confirms (R6)
            autoFocus
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="bdc-btn bdc-btn--confirm"
            data-testid="bdc-confirm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
