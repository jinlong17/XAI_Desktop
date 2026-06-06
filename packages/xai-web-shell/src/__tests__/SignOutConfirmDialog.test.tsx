/**
 * SignOutConfirmDialog tests
 *
 * Cases:
 *  SOCD-1: renders nothing (dialog closed) when open=false
 *  SOCD-2: renders dialog content (title + body + buttons) when open=true
 *  SOCD-3: clicking Confirm button calls onConfirm
 *  SOCD-4: clicking Cancel button calls onCancel
 *  SOCD-5: ESC key calls onCancel via native dialog cancel event
 *  SOCD-6: backdrop click (click on <dialog> element itself) calls onCancel
 *  SOCD-7: i18n — renders ZH strings when lang=zh
 *  SOCD-8: i18n — renders EN strings when lang=en
 *
 * Bugfix: Audit Top-10 #1 / Rail-10 — AvatarMenu Sign-out Option C.
 */

import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { SignOutConfirmDialog } from "../SignOutConfirmDialog.js";
import { WebShellProvider } from "../registry.js";

afterEach(() => cleanup());

// jsdom does not implement HTMLDialogElement.showModal / close natively;
// we stub them so the component can toggle the dialog open state.
function stubDialogMethods() {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
}

function renderDialog(overrides?: {
  open?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  lang?: "en" | "zh";
}) {
  const defaults = {
    open: true,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    lang: "en" as const,
  };
  const cfg = { ...defaults, ...overrides };
  return {
    ...render(
      <MemoryRouter>
        <WebShellProvider
          modules={[]}
          lang={cfg.lang}
          railPos="left"
          petOn={false}
          setPetOn={() => {}}
        >
          <SignOutConfirmDialog
            open={cfg.open}
            onConfirm={cfg.onConfirm}
            onCancel={cfg.onCancel}
          />
        </WebShellProvider>
      </MemoryRouter>
    ),
    cfg,
  };
}

describe("SignOutConfirmDialog", () => {
  beforeEach(() => {
    stubDialogMethods();
  });

  it("SOCD-1 — dialog is closed (no open attribute) when open=false", () => {
    const { container } = renderDialog({ open: false });
    const dialog = container.querySelector("dialog.xai-sign-out-dialog");
    expect(dialog).not.toBeNull();
    expect(dialog?.hasAttribute("open")).toBe(false);
  });

  it("SOCD-2 — dialog is open and shows title, body, and both buttons when open=true", () => {
    renderDialog({ open: true });
    expect(screen.getByRole("heading")).toBeTruthy();
    // Cancel and Sign out buttons must be present
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2);
  });

  it("SOCD-3 — clicking Confirm (Sign out) button calls onConfirm", () => {
    const onConfirm = vi.fn();
    renderDialog({ open: true, onConfirm });
    // The confirm button has class --confirm
    const { container } = renderDialog({ open: true, onConfirm });
    const confirmBtn = container.querySelector(".xai-sign-out-dialog__btn--confirm");
    if (confirmBtn) fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("SOCD-4 — clicking Cancel button calls onCancel", () => {
    const onCancel = vi.fn();
    const { container } = renderDialog({ open: true, onCancel });
    const cancelBtn = container.querySelector(".xai-sign-out-dialog__btn--cancel");
    if (cancelBtn) fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("SOCD-5 — ESC key (native dialog cancel event) calls onCancel", () => {
    const onCancel = vi.fn();
    const { container } = renderDialog({ open: true, onCancel });
    const dialog = container.querySelector("dialog");
    if (dialog) fireEvent(dialog, new Event("cancel", { bubbles: false }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("SOCD-6 — clicking the dialog backdrop (dialog element itself) calls onCancel", () => {
    const onCancel = vi.fn();
    const { container } = renderDialog({ open: true, onCancel });
    const dialog = container.querySelector("dialog");
    if (dialog) {
      // Simulate click directly on dialog (backdrop click)
      fireEvent.click(dialog, { target: dialog });
    }
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("SOCD-7 — renders ZH strings when lang=zh", () => {
    renderDialog({ open: true, lang: "zh" });
    // ZH title
    expect(screen.getByText("退出登录？")).toBeTruthy();
    // ZH body
    expect(screen.getByText("你将从此浏览器退出登录。本地未保存的数据会保留。")).toBeTruthy();
  });

  it("SOCD-8 — renders EN strings when lang=en", () => {
    renderDialog({ open: true, lang: "en" });
    expect(screen.getByText("Sign out?")).toBeTruthy();
    expect(screen.getByText("You'll be signed out of this browser. Any unsaved local data will remain.")).toBeTruthy();
  });
});
