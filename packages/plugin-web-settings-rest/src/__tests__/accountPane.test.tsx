/**
 * AC1..AC8 — accountPane tests (test.md §3 P1)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { accountPane } from "../panes/accountPane.js";
import * as eventBus from "@repo/xai-web-event-bus";

describe("accountPane", () => {
  it("AC1: render renders without error", () => {
    const { container } = render(accountPane.render({ lang: "en" }));
    expect(container.querySelector(".account-pane")).toBeTruthy();
  });

  it("AC2: bilingual — lang=zh shows Chinese name", () => {
    render(accountPane.render({ lang: "zh" }));
    expect(screen.getByText("百事可爱")).toBeInTheDocument();
  });

  it("AC3: bilingual — lang=en shows English name", () => {
    render(accountPane.render({ lang: "en" }));
    expect(screen.getByText("Aki Chen")).toBeInTheDocument();
  });

  it("AC4: Delete Account button is present", () => {
    render(accountPane.render({ lang: "en" }));
    const btn = screen.getByTestId("delete-account-btn");
    expect(btn).toBeInTheDocument();
  });

  it("AC5: clicking Delete Account opens the dialog", () => {
    // jsdom supports showModal via HTMLDialogElement (partial) — stub it.
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();

    render(accountPane.render({ lang: "en" }));
    const btn = screen.getByTestId("delete-account-btn");
    fireEvent.click(btn);

    // Modal title should be visible after open.
    expect(screen.getByText("Delete account?")).toBeInTheDocument();
  });

  it("AC6: canceling modal does NOT emit event", () => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
    const emitSpy = vi.spyOn(eventBus, "emitWebEvent");

    render(accountPane.render({ lang: "en" }));
    fireEvent.click(screen.getByTestId("delete-account-btn"));
    // Click Cancel
    fireEvent.click(screen.getByText("Cancel"));

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it("AC7: confirming modal emits web:settings:rest:account-delete-confirmed exactly once", () => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
    const emitSpy = vi.spyOn(eventBus, "emitWebEvent");

    render(accountPane.render({ lang: "en" }));
    fireEvent.click(screen.getByTestId("delete-account-btn"));
    fireEvent.click(screen.getByText("Delete account"));

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(
      "web:settings:rest:account-delete-confirmed",
      expect.objectContaining({ confirmedAt: expect.any(String) }),
    );
  });

  it("AC8: pane id + icon + i18nKey match registry expectations", () => {
    expect(accountPane.id).toBe("account");
    expect(accountPane.icon).toBe("sliders");
    expect(accountPane.i18nKey).toBe("settings.account");
  });
});
