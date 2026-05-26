/**
 * @internal — DeleteAccountConfirmModal.tsx
 *
 * Native <dialog>-based 2-step confirm modal for the Delete Account action.
 *
 * Step 1 — "Are you sure?": warn user, Continue / Cancel.
 *   Step 1 Continue emits web:settings:rest:account-delete-confirmed (deprecated, one-release back-compat).
 * Step 2 — "Type DELETE to confirm": case-sensitive controlled input, no trim/no fold.
 *   Submit disabled unless input === "DELETE" (exact literal, DEL-TYPEMATCH-1..6).
 *
 * The modal accepts onSubmit called after the user types DELETE and clicks submit.
 * The outer accountPane / orchestrator is responsible for side-effects.
 *
 * API contract: packages/plugin-web-settings-rest/docs/api.md §8.1
 * Review security gates: DEL-TYPEMATCH-1..6, DEL-CANCEL-1..2, DEL-MOCK-BANNER-1..3
 */

import * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { localI18n } from "./localI18n.js";

type ModalStep = "step1" | "step2" | "submitting" | "failure";

interface DeleteAccountConfirmModalProps {
  readonly open: boolean;
  readonly lang: Lang;
  /** Called when the user closes the modal (Cancel or backdrop click). */
  readonly onCancel: () => void;
  /** Called on Step 1 → Continue (emits deprecated event). */
  readonly onStep1Continue: () => void;
  /** Called when the user completes Step 2 and submits. */
  readonly onSubmit: () => void;
  /** If non-null, show failure banner with this error kind. */
  readonly failureKind?: string | null;
  /** If true, in-flight submission (Step 2 submit spinner). */
  readonly isSubmitting?: boolean;
  /** Whether to render mock-auth disclosure banner (VITE_WEB_AUTH_MODE=mock-authenticated). */
  readonly isMockAuth?: boolean;
}

const CONFIRM_LITERAL = "DELETE";

export function DeleteAccountConfirmModal({
  open,
  lang,
  onCancel,
  onStep1Continue,
  onSubmit,
  failureKind = null,
  isSubmitting = false,
  isMockAuth = false,
}: DeleteAccountConfirmModalProps): React.ReactElement {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const t = localI18n(lang);

  const [step, setStep] = React.useState<ModalStep>("step1");
  const [inputValue, setInputValue] = React.useState("");

  // Sync dialog open/close with the open prop.
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
      // Reset step and input when closed.
      setStep("step1");
      setInputValue("");
    }
  }, [open]);

  // Sync step with external submitting / failure states.
  React.useEffect(() => {
    if (isSubmitting && step === "step2") {
      setStep("submitting");
    }
  }, [isSubmitting, step]);

  React.useEffect(() => {
    if (failureKind && step === "submitting") {
      setStep("failure");
    }
  }, [failureKind, step]);

  function handleCancel(): void {
    onCancel();
  }

  function handleContinue(): void {
    onStep1Continue();
    setStep("step2");
    setInputValue("");
  }

  function handleRetry(): void {
    setStep("step2");
    setInputValue("");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setInputValue(e.target.value);
  }

  function handleDeleteSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (inputValue !== CONFIRM_LITERAL) return;
    onSubmit();
  }

  // Clicking the backdrop (dialog itself, not its children) cancels.
  // During Submitting, backdrop click does nothing.
  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>): void {
    if (e.target === dialogRef.current) {
      if (step !== "submitting") {
        handleCancel();
      }
    }
  }

  const submitEnabled = inputValue === CONFIRM_LITERAL;

  const errorKey =
    failureKind === "network" ? "deleteModal.error_network"
    : failureKind === "unauthorized" ? "deleteModal.error_unauthorized"
    : failureKind === "forbidden" ? "deleteModal.error_forbidden"
    : failureKind === "server" ? "deleteModal.error_server"
    : "deleteModal.error_unknown";

  return (
    <dialog
      ref={dialogRef}
      className="delete-account-modal"
      onClick={handleDialogClick}
      aria-labelledby="dam-title"
      aria-describedby="dam-body"
    >
      <div className="dam-inner">
        {/* ---- Step 1 ---- */}
        {step === "step1" && (
          <>
            <h3 id="dam-title" className="dam-title">
              {t("deleteModal.step1_title")}
            </h3>
            <p id="dam-body" className="dam-body">
              {t("deleteModal.step1_body")}
            </p>
            <div className="dam-actions-row">
              <button
                type="button"
                className="btn ghost"
                onClick={handleCancel}
              >
                {t("deleteModal.cancel")}
              </button>
              <button
                type="button"
                className="btn danger"
                onClick={handleContinue}
                data-testid="dam-continue-btn"
              >
                {t("deleteModal.continue")}
              </button>
            </div>
          </>
        )}

        {/* ---- Step 2 ---- */}
        {(step === "step2" || step === "submitting" || step === "failure") && (
          <>
            {/* Mock-auth disclosure banner (DEL-MOCK-BANNER-1..3) */}
            {isMockAuth && (
              <div
                className="dam-mock-banner"
                role="note"
                data-testid="dam-mock-banner"
              >
                {t("deleteModal.mock_banner")}
              </div>
            )}

            <h3 id="dam-title" className="dam-title">
              {t("deleteModal.step2_title")}
            </h3>
            <p id="dam-body" className="dam-body">
              {t("deleteModal.step2_body")}
            </p>

            {/* Error banner — shown on failure state */}
            {step === "failure" && failureKind && (
              <div
                className="dam-error"
                role="alert"
                data-testid="dam-error-banner"
              >
                {t(errorKey)}
              </div>
            )}

            <form onSubmit={handleDeleteSubmit}>
              <p className="dam-type-prompt">{t("deleteModal.type_prompt")}</p>
              <input
                type="text"
                className="dam-input"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={t("deleteModal.input_placeholder")}
                aria-label={t("deleteModal.type_prompt")}
                autoComplete="off"
                disabled={step === "submitting"}
                data-testid="dam-delete-input"
              />
              <div className="dam-actions-row">
                {step === "failure" ? (
                  <>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={handleCancel}
                    >
                      {t("deleteModal.cancel")}
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={handleRetry}
                      data-testid="dam-retry-btn"
                    >
                      {t("deleteModal.retry")}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={handleCancel}
                    disabled={step === "submitting"}
                  >
                    {t("deleteModal.cancel")}
                  </button>
                )}

                <button
                  type="submit"
                  className="btn danger"
                  disabled={!submitEnabled || step === "submitting"}
                  aria-disabled={!submitEnabled || step === "submitting"}
                  title={!submitEnabled ? t("deleteModal.confirm_disabled_tooltip") : undefined}
                  data-testid="dam-delete-submit-btn"
                >
                  {step === "submitting"
                    ? t("deleteModal.submitting")
                    : t("deleteModal.delete_now")}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
