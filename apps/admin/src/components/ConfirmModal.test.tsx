/**
 * TT-CONFIRM-RENDERS — type-to-confirm destructive modal tests (Phase 4).
 *
 * Asserts the destructive UI affordance is present and behaves (AC-4):
 *   - renders title + body
 *   - with `requireType`, the confirm button is DISABLED until the exact word is
 *     typed, then ENABLED
 *   - confirming invokes `onConfirm` (callers wire this to the NO-OP command
 *     adapter, asserted here against `mockAdminCommandAdapter`)
 *
 * Design authority: apps/admin/docs/test.md §2/§3 (TT-CONFIRM-RENDERS).
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ConfirmModal } from "./ConfirmModal";
import { mockAdminCommandAdapter } from "../adapters/commands";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("TT-CONFIRM-RENDERS: type-to-confirm destructive modal", () => {
  it("renders the title and body", () => {
    render(
      <ConfirmModal
        request={{ title: "封禁该用户？", body: "将立即失去访问权限", onConfirm: () => {} }}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("封禁该用户？")).toBeTruthy();
    expect(screen.getByText("将立即失去访问权限")).toBeTruthy();
  });

  it("confirm button is DISABLED until the exact requireType word is typed", () => {
    render(
      <ConfirmModal
        request={{ title: "批量封禁？", requireType: "BAN", confirmLabel: "全部封禁", onConfirm: () => {} }}
        onClose={() => {}}
      />,
    );
    const confirmBtn = screen.getByText("全部封禁") as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(true);

    const input = screen.getByLabelText("type BAN to confirm");
    fireEvent.change(input, { target: { value: "ban" } }); // case-insensitive
    expect(confirmBtn.disabled).toBe(false);
  });

  it("does NOT unlock on a wrong word", () => {
    render(
      <ConfirmModal
        request={{ title: "转移所有权？", requireType: "TRANSFER", confirmLabel: "转移", onConfirm: () => {} }}
        onClose={() => {}}
      />,
    );
    const confirmBtn = screen.getByText("转移") as HTMLButtonElement;
    fireEvent.change(screen.getByLabelText("type TRANSFER to confirm"), { target: { value: "TRANSFR" } });
    expect(confirmBtn.disabled).toBe(true);
  });

  it("confirming invokes onConfirm wired to the NO-OP command adapter (no write)", async () => {
    const banSpy = vi.spyOn(mockAdminCommandAdapter, "bulkBan");
    const fetchSpy = vi.spyOn(globalThis, "fetch" as never).mockImplementation(() => {
      throw new Error("must not call fetch");
    });
    const onClose = vi.fn();

    render(
      <ConfirmModal
        request={{
          title: "批量封禁 2 个用户？",
          requireType: "BAN",
          confirmLabel: "全部封禁",
          onConfirm: async () => {
            await mockAdminCommandAdapter.bulkBan({ emails: ["a", "b"] });
          },
        }}
        onClose={onClose}
      />,
    );

    fireEvent.change(screen.getByLabelText("type BAN to confirm"), { target: { value: "BAN" } });
    fireEvent.click(screen.getByText("全部封禁"));

    // allow the awaited no-op promise to resolve
    await Promise.resolve();
    await Promise.resolve();

    expect(banSpy).toHaveBeenCalledWith({ emails: ["a", "b"] });
    await expect(banSpy.mock.results[0]!.value).resolves.toEqual({
      ok: true,
      noop: true,
      reason: "slice-1-mock-no-write",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("renders nothing when there is no request", () => {
    const { container } = render(<ConfirmModal request={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
