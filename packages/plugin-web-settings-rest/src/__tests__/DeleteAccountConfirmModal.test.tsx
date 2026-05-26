/**
 * DeleteAccountConfirmModal.test.tsx — Row #9 gap-closure: 2-step modal tests
 *
 * P1 tests (this file):
 *   DEL-STEP-1..3    — step navigation
 *   DEL-TYPEMATCH-1..6 — case-sensitive type-match gate
 *   DEL-CANCEL-1..2  — cancel semantics
 *   DEL-BILINGUAL-1..2 — bilingual rendering
 *
 * P3 tests (appended in P3):
 *   DEL-WIRE-1..3    — orchestrator wiring
 *   DEL-MOCK-BANNER-1..3 — mock-auth banner
 *
 * test.md §7.3 P1
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteAccountConfirmModal } from "../internal/DeleteAccountConfirmModal.js";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

function renderModal(
  overrides: Partial<{
    open: boolean;
    lang: "en" | "zh";
    onCancel: () => void;
    onStep1Continue: () => void;
    onSubmit: () => void;
    failureKind: string | null;
    isSubmitting: boolean;
    isMockAuth: boolean;
  }> = {},
) {
  const props = {
    open: true,
    lang: "en" as const,
    onCancel: vi.fn(),
    onStep1Continue: vi.fn(),
    onSubmit: vi.fn(),
    failureKind: null,
    isSubmitting: false,
    isMockAuth: false,
    ...overrides,
  };
  return { ...render(<DeleteAccountConfirmModal {...props} />), props };
}

describe("DeleteAccountConfirmModal — P1 (step navigation + type-match)", () => {
  // ---- Step navigation ----

  it("DEL-STEP-1: open=true → Step 1 panel visible (step1_title + continue button)", () => {
    renderModal();
    expect(screen.getByText("Delete your account?")).toBeInTheDocument();
    expect(screen.getByTestId("dam-continue-btn")).toBeInTheDocument();
    // Step 2 elements not yet visible
    expect(screen.queryByTestId("dam-delete-input")).toBeNull();
  });

  it("DEL-STEP-2: Step 1 → click Continue → Step 2 panel visible (step2_title; input present)", () => {
    renderModal();
    fireEvent.click(screen.getByTestId("dam-continue-btn"));

    expect(screen.getByText("Type DELETE to confirm")).toBeInTheDocument();
    expect(screen.getByTestId("dam-delete-input")).toBeInTheDocument();
    // Step 1 elements should be gone
    expect(screen.queryByText("Delete your account?")).toBeNull();
    expect(screen.queryByTestId("dam-continue-btn")).toBeNull();
  });

  it("DEL-STEP-3: Step 2 → type DELETE → submit enabled → click submit → calls onSubmit", () => {
    const onSubmit = vi.fn();
    renderModal({ onSubmit });
    fireEvent.click(screen.getByTestId("dam-continue-btn"));

    const input = screen.getByTestId("dam-delete-input");
    fireEvent.change(input, { target: { value: "DELETE" } });

    const submitBtn = screen.getByTestId("dam-delete-submit-btn");
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // ---- Type-match gate (DEL-TYPEMATCH-1..6) ----

  it("DEL-TYPEMATCH-1: input value \"DELETE\" → submit button enabled (NOT disabled)", () => {
    renderModal();
    fireEvent.click(screen.getByTestId("dam-continue-btn"));
    fireEvent.change(screen.getByTestId("dam-delete-input"), { target: { value: "DELETE" } });
    expect(screen.getByTestId("dam-delete-submit-btn")).not.toBeDisabled();
  });

  it("DEL-TYPEMATCH-2: input value \"delete\" (lowercase) → submit button disabled", () => {
    renderModal();
    fireEvent.click(screen.getByTestId("dam-continue-btn"));
    fireEvent.change(screen.getByTestId("dam-delete-input"), { target: { value: "delete" } });
    expect(screen.getByTestId("dam-delete-submit-btn")).toBeDisabled();
  });

  it("DEL-TYPEMATCH-3: input value \"Delete\" (mixed case) → submit button disabled", () => {
    renderModal();
    fireEvent.click(screen.getByTestId("dam-continue-btn"));
    fireEvent.change(screen.getByTestId("dam-delete-input"), { target: { value: "Delete" } });
    expect(screen.getByTestId("dam-delete-submit-btn")).toBeDisabled();
  });

  it("DEL-TYPEMATCH-4: input value \"\" (empty) → submit button disabled", () => {
    renderModal();
    fireEvent.click(screen.getByTestId("dam-continue-btn"));
    // Input is empty by default
    expect(screen.getByTestId("dam-delete-submit-btn")).toBeDisabled();
  });

  it("DEL-TYPEMATCH-5: input value \"DELETEX\" (extra char) → submit button disabled", () => {
    renderModal();
    fireEvent.click(screen.getByTestId("dam-continue-btn"));
    fireEvent.change(screen.getByTestId("dam-delete-input"), { target: { value: "DELETEX" } });
    expect(screen.getByTestId("dam-delete-submit-btn")).toBeDisabled();
  });

  it("DEL-TYPEMATCH-6: input value \"DELETE \" (trailing space) → submit button disabled (no trim)", () => {
    renderModal();
    fireEvent.click(screen.getByTestId("dam-continue-btn"));
    fireEvent.change(screen.getByTestId("dam-delete-input"), { target: { value: "DELETE " } });
    expect(screen.getByTestId("dam-delete-submit-btn")).toBeDisabled();
  });

  // ---- Cancel semantics ----

  it("DEL-CANCEL-1: Cancel on Step 1 → onCancel called; modal step resets to step1", () => {
    const onCancel = vi.fn();
    renderModal({ onCancel });
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("DEL-CANCEL-2: Cancel on Step 2 → onCancel called", () => {
    const onCancel = vi.fn();
    renderModal({ onCancel });
    fireEvent.click(screen.getByTestId("dam-continue-btn"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // ---- Bilingual rendering ----

  it("DEL-BILINGUAL-1: EN labels — Step 1 title + Continue + Step 2 title + type_prompt", () => {
    renderModal({ lang: "en" });
    expect(screen.getByText("Delete your account?")).toBeInTheDocument();
    expect(screen.getByTestId("dam-continue-btn")).toHaveTextContent("Continue");
    fireEvent.click(screen.getByTestId("dam-continue-btn"));
    expect(screen.getByText("Type DELETE to confirm")).toBeInTheDocument();
    expect(screen.getByText(/Type DELETE \(capital letters\)/)).toBeInTheDocument();
  });

  it("DEL-BILINGUAL-2: ZH labels — Step 1 title + Continue + Step 2 title + type_prompt", () => {
    renderModal({ lang: "zh" });
    expect(screen.getByText("确定要删除账号吗？")).toBeInTheDocument();
    expect(screen.getByTestId("dam-continue-btn")).toHaveTextContent("继续");
    fireEvent.click(screen.getByTestId("dam-continue-btn"));
    expect(screen.getByText("请输入 DELETE 以确认")).toBeInTheDocument();
    expect(screen.getByText(/请输入大写 DELETE/)).toBeInTheDocument();
  });
});
