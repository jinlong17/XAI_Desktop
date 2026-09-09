import { accountScope, generationKey } from "@repo/plugin-web-storage";
/**
 * AC1..AC8 — accountPane tests (test.md §3 P1)
 * DEL-EVENT-DEP-1 — row #9 gap-closure: Step 1 Continue emits deprecated event
 *
 * AC5/AC6/AC7 adjusted for 2-step modal semantics (row #9):
 * - AC5: modal opens → Step 1 title visible (new: "Delete your account?")
 * - AC6: Cancel on Step 1 does NOT emit event
 * - AC7: Step 1 → Continue emits deprecated event exactly once (new emit-site)
 *
 * Mock strategy: useAccountDeleteOrchestrator mocked to avoid WebAuthSessionProvider
 * context requirement (DeleteAccountConfirmModal uses the orchestrator internally).
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { accountPane } from "../panes/accountPane.js";
import * as eventBus from "@repo/xai-web-event-bus";

// Mock the orchestrator to avoid WebAuthSessionProvider context requirement
vi.mock("../internal/useAccountDeleteOrchestrator.js", () => ({
  useAccountDeleteOrchestrator: vi.fn(() => ({
    state: "idle",
    error: null,
    isMockAuth: false,
    submit: vi.fn(async () => {}),
    reset: vi.fn(),
  })),
  ACCOUNT_LOCAL_WIPE_IDB_NAMES: Object.freeze([
    "web-encrypted-cache",
    "xai-web-ai-secrets",
    "xai-web-auth",
  ]),
}));

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

  it("AC5: clicking Delete Account opens the dialog — shows Step 1 title", () => {
    // jsdom supports showModal via HTMLDialogElement (partial) — stub it.
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();

    render(accountPane.render({ lang: "en" }));
    const btn = screen.getByTestId("delete-account-btn");
    fireEvent.click(btn);

    // Step 1 title should be visible.
    expect(screen.getByText("Delete your account?")).toBeInTheDocument();
  });

  it("AC6: Cancel on Step 1 does NOT emit event", () => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
    const emitSpy = vi.spyOn(eventBus, "emitWebEvent");

    render(accountPane.render({ lang: "en" }));
    fireEvent.click(screen.getByTestId("delete-account-btn"));
    // Click Cancel on Step 1
    fireEvent.click(screen.getByText("Cancel"));

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it("AC7: Step 1 → Continue emits web:settings:rest:account-delete-confirmed exactly once", () => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
    const emitSpy = vi.spyOn(eventBus, "emitWebEvent");

    render(accountPane.render({ lang: "en" }));
    fireEvent.click(screen.getByTestId("delete-account-btn"));
    // New emit-site: Step 1 Continue (not the final confirm)
    fireEvent.click(screen.getByTestId("dam-continue-btn"));

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

  // DEL-EVENT-DEP-1: Step 1 Continue (new emit-site, row #9)
  it("DEL-EVENT-DEP-1: Step 1 Continue emits deprecated event with confirmedAt ISO timestamp", () => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
    const emitSpy = vi.spyOn(eventBus, "emitWebEvent");

    render(accountPane.render({ lang: "en" }));
    fireEvent.click(screen.getByTestId("delete-account-btn"));
    fireEvent.click(screen.getByTestId("dam-continue-btn"));

    expect(emitSpy).toHaveBeenCalledWith(
      "web:settings:rest:account-delete-confirmed",
      expect.objectContaining({ confirmedAt: expect.any(String) }),
    );
    const payload = emitSpy.mock.calls[0]![1] as { confirmedAt: string };
    expect(() => new Date(payload.confirmedAt).toISOString()).not.toThrow();
  });
});


describe("account-local data management", () => {
  it("exports only the captured current account generation and gives download-request feedback", async () => {
    const scope = accountScope.capture();
    localStorage.setItem(accountScope.physicalKey("xai_task_cols"), '[{"id":"A-task"}]');
    localStorage.setItem(generationKey("B", "g-b", "xai_task_cols"), 'B-secret-content');
    localStorage.setItem("xai_task_cols", "unowned-content");
    localStorage.setItem("xai_lang", "zh");
    let blob!: Blob;
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn((value: Blob) => { blob = value; return "blob:export"; }) });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    render(accountPane.render({ lang: "en" }));
    fireEvent.click(screen.getByRole("button", { name: "Export this account's local data" }));
    const text = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsText(blob); });
    expect(JSON.parse(text)).toEqual({ version: 1, accountId: scope.accountId, generation: scope.generation, records: { xai_task_cols: '[{"id":"A-task"}]' } });
    expect(text).not.toContain("B-secret-content"); expect(text).not.toContain("unowned-content"); expect(text).not.toContain("xai_lang");
    expect(screen.getByRole("status")).toHaveTextContent("Download requested");
    expect(screen.getByRole("status")).toHaveTextContent("not a cloud backup");
  });
  it("shows a visible error instead of exporting after the account changes", () => {
    render(accountPane.render({ lang: "en" }));
    accountScope.activate(accountScope.lock("B"), "g-b");
    fireEvent.click(screen.getByRole("button", { name: "Export this account's local data" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Could not export this account");
  });
  it("opens the account data gate from settings", () => {
    const received = vi.fn(); window.addEventListener("xai:account-data:manage", received);
    render(accountPane.render({ lang: "en" }));
    fireEvent.click(screen.getByRole("button", { name: "Manage local data import and rollback" }));
    expect(received).toHaveBeenCalledOnce();
    window.removeEventListener("xai:account-data:manage", received);
  });
});
