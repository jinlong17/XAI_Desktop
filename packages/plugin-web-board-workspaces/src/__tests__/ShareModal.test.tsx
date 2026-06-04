/**
 * ShareModal tests — SM-1..SM-9
 * Gap-closure row #6 — board-workspaces slice
 */
import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
} from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { ShareModal } from "../ShareModal.js";
import type { Board } from "@repo/plugin-web-board-core";

// ---- Mocks ------------------------------------------------------------------

vi.mock("@repo/xai-web-event-bus", () => ({
  emitWebEvent: vi.fn(),
}));

import { emitWebEvent } from "@repo/xai-web-event-bus";

// Mock clipboard
const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: clipboardWriteText },
  configurable: true,
});

// Mock showModal / close on HTMLDialogElement
HTMLDialogElement.prototype.showModal = vi.fn();
HTMLDialogElement.prototype.close = vi.fn();

// ---- Fixtures ---------------------------------------------------------------

const MOCK_BOARD: Board = {
  id: "b-test",
  workspaceId: "ws-1",
  name: { en: "Test Board", zh: "测试看板" },
  cover: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  template: "kanban",
  lists: [],
};

// ---- Tests ------------------------------------------------------------------

describe("ShareModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clipboardWriteText.mockResolvedValue(undefined);
  });

  test("SM-1 opens with <dialog> mounted + URL visible after async generation", async () => {
    render(<ShareModal board={MOCK_BOARD} lang="en" onClose={vi.fn()} />);
    // showModal called on mount
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    // dialog is in the DOM
    expect(screen.getByTestId("share-dialog")).toBeInTheDocument();
    // URL generates asynchronously — wait for it
    await waitFor(() => {
      const input = screen.getByTestId("sm-url-input") as HTMLInputElement;
      expect(input.value).toMatch(/^https:\/\/xai-web\.example\/share\/[0-9a-f]{8}$/);
    });
    expect(screen.getByTestId("sm-stub-badge").textContent).toBe("Mock link");
    expect(screen.getByTestId("sm-stub-banner").textContent).toContain(
      "does not grant access",
    );
    expect(screen.getByTestId("sm-share-contract").textContent).toBe(
      "mock/unimplemented/view",
    );
  });

  test("SM-2 Copy button calls navigator.clipboard.writeText(url)", async () => {
    render(<ShareModal board={MOCK_BOARD} lang="en" onClose={vi.fn()} />);
    await waitFor(() => {
      const input = screen.getByTestId("sm-url-input") as HTMLInputElement;
      expect(input.value).toMatch(/xai-web\.example\/share\//);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("sm-copy-btn"));
    });
    expect(clipboardWriteText).toHaveBeenCalledOnce();
    expect(clipboardWriteText.mock.calls[0]![0]).toMatch(/xai-web\.example\/share\//);
  });

  test("SM-3 'Copied!' affordance flips on success", async () => {
    render(<ShareModal board={MOCK_BOARD} lang="en" onClose={vi.fn()} />);
    await waitFor(() => {
      expect((screen.getByTestId("sm-url-input") as HTMLInputElement).value).toMatch(/share\//);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("sm-copy-btn"));
    });
    expect(screen.getByTestId("sm-copy-btn").textContent).toBe("Copied!");
  });

  test("SM-4 'Copied!' reverts after 2 seconds", async () => {
    vi.useFakeTimers();
    render(<ShareModal board={MOCK_BOARD} lang="en" onClose={vi.fn()} />);
    // Advance timers to allow URL generation (which uses real SubtleCrypto)
    await act(async () => { await Promise.resolve(); });

    await act(async () => {
      fireEvent.click(screen.getByTestId("sm-copy-btn"));
    });

    // Advance 2 seconds
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByTestId("sm-copy-btn").textContent).toBe("Copy");
    vi.useRealTimers();
  });

  test("SM-5 emit-before-close: emitWebEvent fires before dialog.close() on Close click", async () => {
    const closeOrder: string[] = [];
    (HTMLDialogElement.prototype.close as ReturnType<typeof vi.fn>).mockImplementation(() => {
      closeOrder.push("dialog.close");
    });
    (emitWebEvent as ReturnType<typeof vi.fn>).mockImplementation(() => {
      closeOrder.push("emitWebEvent");
    });

    const onClose = vi.fn(() => { closeOrder.push("onClose"); });
    render(<ShareModal board={MOCK_BOARD} lang="en" onClose={onClose} />);
    await act(async () => { await Promise.resolve(); });

    fireEvent.click(screen.getByTestId("sm-close-btn"));

    expect(closeOrder[0]).toBe("emitWebEvent");
    expect(closeOrder[1]).toBe("dialog.close");
    expect(closeOrder[2]).toBe("onClose");
    expect(emitWebEvent).toHaveBeenCalledWith(
      "web:board:share-requested",
      expect.objectContaining({
        boardId: "b-test",
        source: "header",
        mode: "mock",
        permission: "view",
        expiresAt: null,
        backend: "unimplemented",
      }),
    );
  });

  test("SM-6 backdrop click (event.target === dialogRef) closes modal", async () => {
    const onClose = vi.fn();
    render(<ShareModal board={MOCK_BOARD} lang="en" onClose={onClose} />);
    await act(async () => { await Promise.resolve(); });

    // Simulate clicking on the dialog backdrop (target === dialog element)
    const dialog = screen.getByTestId("share-dialog");
    fireEvent.click(dialog, { target: dialog });
    // onClose should be called
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("SM-7 ESC triggers cancel event → handleClose called", async () => {
    const onClose = vi.fn();
    render(<ShareModal board={MOCK_BOARD} lang="en" onClose={onClose} />);
    await act(async () => { await Promise.resolve(); });

    const dialog = screen.getByTestId("share-dialog");
    // Dispatch a cancel event (native ESC behavior)
    fireEvent(dialog, new Event("cancel", { bubbles: true, cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("SM-8 bilingual zh — heading shows '分享看板' + Copied text '已复制'", async () => {
    render(<ShareModal board={MOCK_BOARD} lang="zh" onClose={vi.fn()} />);
    expect(screen.getByTestId("sm-heading").textContent).toBe("分享看板");
    expect(screen.getByTestId("sm-stub-badge").textContent).toBe("模拟链接");
    expect(screen.getByTestId("sm-stub-banner").textContent).toContain(
      "不会授予访问权限",
    );
    await waitFor(() => {
      expect((screen.getByTestId("sm-url-input") as HTMLInputElement).value).toMatch(/share\//);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("sm-copy-btn"));
    });
    expect(screen.getByTestId("sm-copy-btn").textContent).toBe("已复制");
  });

  test("SM-9 permission note makes view-only scope explicit", () => {
    render(<ShareModal board={MOCK_BOARD} lang="en" onClose={vi.fn()} />);
    expect(screen.getByTestId("sm-permission-note").textContent).toBe(
      "Permission: view-only",
    );
  });
});
