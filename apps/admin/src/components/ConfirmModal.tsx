/**
 * apps/admin/src/components/ConfirmModal.tsx — type-to-confirm destructive modal.
 *
 * Structural port of the prototype `openConfirm` / `updateCmBtn` flow
 * (docs/prototypes/admin-dashboard/index.html). Preserves the destructive-action
 * UI affordance (AC-4): a confirm dialog whose primary button stays DISABLED
 * until the operator types the exact `requireType` word.
 *
 * Wired to NO-OP commands: `onConfirm` callers invoke the no-op command adapter
 * (`../adapters/commands`), so confirming performs NO production write
 * (api.md §5, test.md §2 TT-CONFIRM-RENDERS / TT-CMD-NOOP).
 *
 * CSP-clean: no inline <style>; styling via the admin stylesheet classes.
 */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export interface ConfirmRequest {
  title: string;
  body?: ReactNode;
  tone?: "danger" | "warning";
  confirmLabel?: string;
  /** when set, the confirm button unlocks only on this exact word (case-insensitive) */
  requireType?: string;
  /** invoked on confirm — callers wire this to the no-op command adapter */
  onConfirm: () => void | Promise<void>;
}

export interface ConfirmModalProps {
  request: ConfirmRequest | null;
  onClose: () => void;
}

export function ConfirmModal({ request, onClose }: ConfirmModalProps): React.ReactElement | null {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();

  useEffect(() => {
    setTyped("");
    if (request?.requireType) {
      // focus the type-to-confirm field when a confirm word is required
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [request]);

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    if (request) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
    return undefined;
  }, [request, onClose]);

  if (!request) return null;

  const tone = request.tone ?? "danger";
  const needsType = Boolean(request.requireType);
  const unlocked =
    !needsType || typed.trim().toUpperCase() === request.requireType!.toUpperCase();

  async function handleConfirm(): Promise<void> {
    if (!unlocked) return;
    await request!.onConfirm();
    onClose();
  }

  return (
    <div className="cm-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`cm-modal cm-modal--${tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={labelId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`cm-icon cm-icon--${tone}`} aria-hidden>
          {tone === "danger" ? "⚠️" : "❗"}
        </div>
        <h2 id={labelId} className="cm-title">
          {request.title}
        </h2>
        {request.body ? <p className="cm-body">{request.body}</p> : null}

        {needsType ? (
          <label className="cm-typewrap">
            <span className="cm-type-label">
              输入 <b>{request.requireType}</b> 以确认
            </span>
            <input
              ref={inputRef}
              className="cm-input"
              value={typed}
              placeholder={request.requireType}
              onChange={(e) => setTyped(e.target.value)}
              aria-label={`type ${request.requireType} to confirm`}
            />
          </label>
        ) : null}

        <div className="cm-actions">
          <button type="button" className="btn cm-cancel" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className={`btn cm-confirm cm-confirm--${tone}`}
            disabled={!unlocked}
            aria-disabled={!unlocked}
            onClick={() => void handleConfirm()}
          >
            {request.confirmLabel ?? "确认"}
          </button>
        </div>
      </div>
    </div>
  );
}
