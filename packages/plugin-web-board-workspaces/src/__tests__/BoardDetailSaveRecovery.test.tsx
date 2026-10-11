import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createBoardStorageEnvelope,
  makeDefaultBoards,
  readBoardStorage,
  type Board,
} from "@repo/plugin-web-board-core";
import { accountScope } from "@repo/plugin-web-storage";
import { BoardWorkspacesModule } from "../BoardWorkspacesModule.js";
import {
  useBoardDetailSaveRecovery,
  type BoardDetailAppendDraft,
} from "../internal/useBoardDetailSaveRecovery.js";

vi.mock("@repo/xai-web-event-bus", () => ({
  emitWebEvent: vi.fn(),
  onWebEvent: vi.fn(() => () => {}),
  useWebEventListener: vi.fn(),
}));

const target = { boardId: "b-default", listId: "b-backlog", cardId: "bc1" };

function key(): string {
  return accountScope.physicalKey("xai_boards_v2");
}

function seedEnvelope(): string {
  const envelope = createBoardStorageEnvelope(makeDefaultBoards(), {
    migratedAt: "2026-09-09T00:00:00.000Z",
  });
  const raw = JSON.stringify(envelope);
  localStorage.setItem(key(), raw);
  return raw;
}

function storedCard() {
  const raw = localStorage.getItem(key());
  if (!raw) throw new Error("missing board storage");
  const read = readBoardStorage(JSON.parse(raw));
  if (read.status !== "valid") throw new Error("invalid board storage");
  return read.boards
    .find((board) => board.id === target.boardId)!
    .lists.find((list) => list.id === target.listId)!
    .cards.find((card) => card.id === target.cardId)!;
}

function latestDraft(draft: BoardDetailAppendDraft): BoardDetailAppendDraft {
  if (draft.kind === "checklist") return { ...draft, text: "Latest checklist text" };
  if (draft.kind === "attachment") {
    return {
      ...draft,
      providerId: "linear",
      url: "https://linear.app/acme/issue/LATEST-1",
      title: "Latest issue title",
    };
  }
  return { ...draft, body: "Latest activity text" };
}

describe("Board detail append recovery", () => {
  beforeEach(() => {
    localStorage.clear();
    accountScope.activate(accountScope.lock("consumer-test"), "fixture");
  });

  it.each<BoardDetailAppendDraft>([
    { kind: "checklist", text: "First checklist text" },
    {
      kind: "attachment",
      providerId: "github",
      url: "https://github.com/acme/first/issues/1",
      title: "First issue title",
    },
    { kind: "activity", body: "First activity text", authorName: "You" },
  ])("fails twice, retains one stable $kind proposal, then commits the latest draft once", (initial) => {
    seedEnvelope();
    let reject = true;
    const save = vi.fn((next: unknown) => {
      if (reject) return false;
      localStorage.setItem(key(), JSON.stringify(next));
      return true;
    });
    const { result } = renderHook(() => useBoardDetailSaveRecovery(save));

    act(() => expect(result.current.submit(target, initial)).toBe(false));
    const proposalId = result.current.pending!.proposalId;
    const createdAt = result.current.pending!.createdAt;
    const latest = latestDraft(initial);
    act(() => result.current.updateDraft(target, latest));
    act(() => expect(result.current.retry()).toBe(false));
    expect(result.current.pending).toMatchObject({ proposalId, createdAt, draft: latest });

    reject = false;
    act(() => expect(result.current.retry()).toBe(true));
    expect(result.current.pending).toBeNull();
    expect(result.current.error).toBeNull();
    expect(save).toHaveBeenCalledTimes(3);

    const raw = JSON.parse(localStorage.getItem(key())!);
    expect(raw).toMatchObject({
      kind: "xai.web.board.storage",
      schemaVersion: 1,
      migratedAt: "2026-09-09T00:00:00.000Z",
    });
    const card = storedCard();
    if (latest.kind === "checklist") {
      expect(card.checklistItems?.filter((entry) => entry.id === proposalId)).toEqual([
        { id: proposalId, text: latest.text, done: false },
      ]);
    } else if (latest.kind === "attachment") {
      expect(card.attachments?.filter((entry) => entry.id === proposalId)).toEqual([
        expect.objectContaining({
          id: proposalId,
          url: "https://linear.app/acme/issue/LATEST-1",
          title: latest.title,
          source: expect.objectContaining({ providerId: "linear", providerName: "Linear" }),
        }),
      ]);
    } else {
      expect(card.activity?.filter((entry) => entry.id === proposalId)).toEqual([
        expect.objectContaining({
          id: proposalId,
          body: latest.body,
          createdAt,
          authorName: "You",
        }),
      ]);
    }
  });

  it("refuses changed bytes and an account switch without overwriting or exporting the new owner", () => {
    seedEnvelope();
    const save = vi.fn(() => false);
    const { result } = renderHook(() => useBoardDetailSaveRecovery(save));
    act(() => {
      expect(
        result.current.submit(target, { kind: "checklist", text: "Protected draft" }),
      ).toBe(false);
    });

    const replacement = makeDefaultBoards() as Board[];
    replacement[0] = { ...replacement[0]!, description: "external replacement" };
    const replacementRaw = JSON.stringify(replacement);
    localStorage.setItem(key(), replacementRaw);
    act(() => expect(result.current.retry()).toBe(false));
    expect(localStorage.getItem(key())).toBe(replacementRaw);
    expect(result.current.pending?.draft).toMatchObject({ text: "Protected draft" });

    accountScope.activate(accountScope.lock("other-account"), "other-generation");
    const otherKey = key();
    localStorage.setItem(otherKey, '"other account sentinel"');
    expect(() => result.current.snapshot()).toThrow(/account/i);
    act(() => expect(result.current.retry()).toBe(false));
    expect(result.current.pending).not.toBeNull();
    expect(localStorage.getItem(otherKey)).toBe('"other account sentinel"');
  });

  it.each([
    ["missing storage", (): string | null => null],
    ["malformed storage", (): string | null => "{"],
    ["deleted card", (boards: Board[]): string | null => {
      boards[0]!.lists[0]!.cards = boards[0]!.lists[0]!.cards.filter((card) => card.id !== "bc1");
      return JSON.stringify(boards);
    }],
    ["archived card", (boards: Board[]): string | null => {
      boards[0]!.lists[0]!.cards[0] = { ...boards[0]!.lists[0]!.cards[0]!, archived: true };
      return JSON.stringify(boards);
    }],
    ["archived list", (boards: Board[]): string | null => {
      boards[0]!.lists[0] = { ...boards[0]!.lists[0]!, archived: true };
      return JSON.stringify(boards);
    }],
    ["moved card", (boards: Board[]): string | null => {
      const moved = boards[0]!.lists[0]!.cards[0]!;
      boards[0]!.lists[0]!.cards = boards[0]!.lists[0]!.cards.slice(1);
      boards[0]!.lists[1]!.cards = [...boards[0]!.lists[1]!.cards, moved];
      return JSON.stringify(boards);
    }],
  ] as const)("retains the proposal and refuses %s on retry", (_label, replace) => {
    seedEnvelope();
    const save = vi.fn(() => false);
    const { result } = renderHook(() => useBoardDetailSaveRecovery(save));
    act(() => {
      expect(
        result.current.submit(target, { kind: "activity", body: "Protected", authorName: "You" }),
      ).toBe(false);
    });
    const proposalId = result.current.pending!.proposalId;
    const replacementRaw = replace(makeDefaultBoards() as Board[]);
    if (replacementRaw === null) localStorage.removeItem(key());
    else localStorage.setItem(key(), replacementRaw);

    act(() => expect(result.current.retry()).toBe(false));
    expect(result.current.pending?.proposalId).toBe(proposalId);
    expect(localStorage.getItem(key())).toBe(replacementRaw);
    expect(save).toHaveBeenCalledOnce();
  });

  it("keeps a failed draft visible when its target disappears and blocks close before that", async () => {
    const boards = makeDefaultBoards() as Board[];
    localStorage.setItem(key(), JSON.stringify(boards));
    localStorage.setItem(accountScope.physicalKey("xai_active_board"), "b-default");
    render(<BoardWorkspacesModule lang="en" />);
    fireEvent.click(screen.getAllByTestId("board-card")[0]!);

    const nativeSet = Storage.prototype.setItem;
    const reject = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      storageKey,
      value,
    ) {
      if (storageKey === key()) throw new DOMException("quota", "QuotaExceededError");
      nativeSet.call(this, storageKey, value);
    });
    fireEvent.change(screen.getByTestId("card-detail-checklist-input"), {
      target: { value: "Recover me after deletion" },
    });
    fireEvent.click(screen.getByTestId("card-detail-checklist-add"));
    fireEvent.click(screen.getByTestId("card-detail-close"));
    expect(screen.getByTestId("card-detail-modal")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.mouseDown(screen.getByTestId("card-detail-modal"));
    fireEvent.click(screen.getAllByTestId("board-card")[1]!);
    expect(screen.getByTestId("card-detail-title-input")).toHaveValue(
      "Onboarding flow concepts",
    );
    reject.mockRestore();

    const oldRaw = localStorage.getItem(key())!;
    const removed = makeDefaultBoards() as Board[];
    removed[0]!.lists[0]!.cards = removed[0]!.lists[0]!.cards.filter(
      (card) => card.id !== "bc1",
    );
    const nextRaw = JSON.stringify(removed);
    await act(async () => {
      localStorage.setItem(key(), nextRaw);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: key(),
          oldValue: oldRaw,
          newValue: nextRaw,
          storageArea: localStorage,
        }),
      );
    });

    await waitFor(() => expect(screen.queryByTestId("card-detail-modal")).toBeNull());
    expect(screen.getByTestId("board-detail-recovery-surface")).toBeInTheDocument();
    expect(screen.getByTestId("board-detail-recovery-draft")).toHaveTextContent(
      "Recover me after deletion",
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry save" }));
    expect(localStorage.getItem(key())).toBe(nextRaw);
    expect(screen.getByTestId("board-detail-recovery-surface")).toBeInTheDocument();
  });

  it("retries the latest inline draft once and clears the editor only after commit", () => {
    const boards = makeDefaultBoards() as Board[];
    localStorage.setItem(key(), JSON.stringify(boards));
    localStorage.setItem(accountScope.physicalKey("xai_active_board"), "b-default");
    render(<BoardWorkspacesModule lang="en" />);
    fireEvent.click(screen.getAllByTestId("board-card")[0]!);

    const nativeSet = Storage.prototype.setItem;
    const reject = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      storageKey,
      value,
    ) {
      if (storageKey === key()) throw new DOMException("quota", "QuotaExceededError");
      nativeSet.call(this, storageKey, value);
    });
    fireEvent.change(screen.getByTestId("card-detail-activity-input"), {
      target: { value: "First unsaved comment" },
    });
    fireEvent.click(screen.getByTestId("card-detail-activity-add"));
    reject.mockRestore();
    fireEvent.change(screen.getByTestId("card-detail-activity-input"), {
      target: { value: "Latest recovered comment" },
    });
    fireEvent.click(screen.getByTestId("card-detail-retry-save"));

    expect(screen.getByTestId("card-detail-activity-input")).toHaveValue("");
    expect(screen.queryByTestId("card-detail-save-recovery")).toBeNull();
    expect(
      storedCard().activity?.filter((entry) => entry.body === "Latest recovered comment"),
    ).toHaveLength(1);
    expect(
      storedCard().activity?.some((entry) => entry.body === "First unsaved comment"),
    ).toBe(false);
  });

  it("revalidates the latest attachment fields and keeps an invalid retry editable", () => {
    const boards = makeDefaultBoards() as Board[];
    localStorage.setItem(key(), JSON.stringify(boards));
    localStorage.setItem(accountScope.physicalKey("xai_active_board"), "b-default");
    render(<BoardWorkspacesModule lang="en" />);
    fireEvent.click(screen.getAllByTestId("board-card")[0]!);

    const nativeSet = Storage.prototype.setItem;
    const reject = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      storageKey,
      value,
    ) {
      if (storageKey === key()) throw new DOMException("quota", "QuotaExceededError");
      nativeSet.call(this, storageKey, value);
    });
    fireEvent.change(screen.getByTestId("card-detail-attachment-url"), {
      target: { value: "https://github.com/acme/first" },
    });
    fireEvent.change(screen.getByTestId("card-detail-attachment-title"), {
      target: { value: "First title" },
    });
    fireEvent.click(screen.getByTestId("card-detail-attachment-add"));
    reject.mockRestore();

    fireEvent.change(screen.getByTestId("card-detail-integration-provider"), {
      target: { value: "linear" },
    });
    fireEvent.change(screen.getByTestId("card-detail-attachment-url"), {
      target: { value: "not a valid URL" },
    });
    fireEvent.change(screen.getByTestId("card-detail-attachment-title"), {
      target: { value: "Latest unsaved title" },
    });
    const beforeRetry = localStorage.getItem(key());
    fireEvent.click(screen.getByTestId("card-detail-retry-save"));

    expect(localStorage.getItem(key())).toBe(beforeRetry);
    expect(screen.getByTestId("card-detail-attachment-url")).toHaveValue("not a valid URL");
    expect(screen.getByTestId("card-detail-attachment-title")).toHaveValue(
      "Latest unsaved title",
    );
    expect(screen.getByTestId("card-detail-integration-provider")).toHaveValue("linear");
    expect(screen.getByRole("alert")).toHaveTextContent(/invalid/i);
  });

  it.each([
    ["checklist", "card-detail-checklist-input", "Export latest checklist"],
    ["attachment", "card-detail-attachment-url", "https://example.com/export-latest"],
    ["activity", "card-detail-activity-input", "Export latest activity"],
  ] as const)("downloads the latest %s recovery with original target context", async (kind, inputId, value) => {
    const boards = makeDefaultBoards() as Board[];
    localStorage.setItem(key(), JSON.stringify(boards));
    localStorage.setItem(accountScope.physicalKey("xai_active_board"), "b-default");
    let capturedBlob: Blob | null = null;
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn((blob: Blob) => {
        capturedBlob = blob;
        return "blob:board-detail-recovery";
      }),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<BoardWorkspacesModule lang="en" />);
    fireEvent.click(screen.getAllByTestId("board-card")[0]!);

    const nativeSet = Storage.prototype.setItem;
    const reject = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      storageKey,
      next,
    ) {
      if (storageKey === key()) throw new DOMException("quota", "QuotaExceededError");
      nativeSet.call(this, storageKey, next);
    });
    fireEvent.change(screen.getByTestId(inputId), { target: { value } });
    if (kind === "attachment") {
      fireEvent.change(screen.getByTestId("card-detail-integration-provider"), {
        target: { value: "drive" },
      });
      fireEvent.change(screen.getByTestId("card-detail-attachment-title"), {
        target: { value: "Export latest title" },
      });
    }
    fireEvent.click(screen.getByTestId(`card-detail-${kind}-add`));
    reject.mockRestore();
    fireEvent.click(screen.getByTestId("card-detail-export-draft"));

    expect(click).toHaveBeenCalledOnce();
    const anchor = click.mock.instances[0] as unknown as HTMLAnchorElement;
    expect(anchor.download).toBe(`board-detail-${kind}-draft.json`);
    expect(capturedBlob).not.toBeNull();
    const content = await new Promise<string>((resolve, rejectRead) => {
      const reader = new FileReader();
      reader.onerror = () => rejectRead(reader.error);
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(capturedBlob!);
    });
    const snapshot = JSON.parse(content);
    expect(snapshot).toMatchObject({
      kind: "board-detail-append-recovery",
      operation: kind,
      target,
      owner: { accountId: "consumer-test", generation: "fixture" },
      proposal: { id: expect.stringContaining(`${kind === "activity" ? "act" : kind === "attachment" ? "att" : "chk"}-`) },
    });
    expect(JSON.stringify(snapshot.draft)).toContain(value);
    if (kind === "attachment") {
      expect(snapshot.draft).toMatchObject({ providerId: "drive", title: "Export latest title" });
    }
  });
});
