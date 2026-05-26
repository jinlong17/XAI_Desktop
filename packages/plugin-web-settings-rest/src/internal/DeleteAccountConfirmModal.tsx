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
 * P3 wiring: uses useAccountDeleteOrchestrator internally.
 * isMockAuth derived from the orchestrator (not a prop) — always current.
 * onSubmit / failureKind / isSubmitting are driven by the orchestrator state machine.
 *
 * API contract: packages/plugin-web-settings-rest/docs/api.md §8.1
 * Review security gates: DEL-TYPEMATCH-1..6, DEL-CANCEL-1..2, DEL-MOCK-BANNER-1..3
 */

import * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { localI18n } from "./localI18n.js";
import { useAccountDeleteOrchestrator } from "./useAccountDeleteOrchestrator.js";

type ModalStep = "step1" | "step2" | "submitting" | "failure";

interface DeleteAccountConfirmModalProps {
  readonly open: boolean;
  readonly lang: Lang;
  /** Called when the user closes the modal (Cancel or backdrop click). */
  readonly onCancel: () => void;
  /** Called on Step 1 → Continue (emits deprecated event). */
  readonly onStep1Continue: () => void;
}

const CONFIRM_LITERAL = "DELETE";

export function DeleteAccountConfirmModal({
  open,
  lang,
  onCancel,
  onStep1Continue,
}: DeleteAccountConfirmModalProps): React.ReactElement {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const t = localI18n(lang);

  const [step, setStep] = React.useState<ModalStep>("step1");
  const [inputValue, setInputValue] = React.useState("");

  const orchestrator = useAccountDeleteOrchestrator();
  const { isMockAuth } = orchestrator;

  // Sync orchestrator state into local modal step machine.
  React.useEffect(() => {
    if (orchestrator.state === "submitting" && step === "step2") {
      setStep("submitting");
    } else if (orchestrator.state === "wiping" && step === "submitting") {
      // Stay in submitting visually — wiping is fast.
    } else if (orchestrator.state === "failure" && step === "submitting") {
      setStep("failure");
    } else if (orchestrator.state === "success") {
      // Success triggers redirect — nothing to show.
      setStep("step1");
    }
  }, [orchestrator.state, step]);

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
      orchestrator.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleCancel(): void {
    orchestrator.reset();
    onCancel();
  }

  function handleContinue(): void {
    onStep1Continue();
    setStep("step2");
    setInputValue("");
  }

  function handleRetry(): void {
    orchestrator.reset();
    setStep("step2");
    setInputValue("");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setInputValue(e.target.value);
  }

  function handleDeleteSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (inputValue !== CONFIRM_LITERAL) return;
    void orchestrator.submit();
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

  const submitEnabled = inputValue === CONFIRM_LITERAL && step === "step2";
  // Extracted as a typed boolean so TS cannot re-narrow `step` inside compound
  // disabled expressions — prevents TS2367 "no overlap" error on
  // `!submitEnabled || step === "submitting"` within the step2|submitting|failure block.
  const stepIsSubmitting: boolean = step === "submitting";

  const failureKind = orchestrator.error?.kind;
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

        {/* ---- Step 2 / Submitting / Failure ---- */}
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
                disabled={stepIsSubmitting}
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
                    disabled={stepIsSubmitting}
                  >
                    {t("deleteModal.cancel")}
                  </button>
                )}

                <button
                  type="submit"
                  className="btn danger"
                  disabled={!submitEnabled || stepIsSubmitting}
                  aria-disabled={!submitEnabled || stepIsSubmitting}
                  title={!submitEnabled && !stepIsSubmitting ? t("deleteModal.confirm_disabled_tooltip") : undefined}
                  data-testid="dam-delete-submit-btn"
                >
                  {stepIsSubmitting
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
