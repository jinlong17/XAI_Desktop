import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BoardView } from "../BoardView.js";
import { BOARD_CARD_DND_MIME } from "../BoardCard.js";
import { makeDataTransferMock } from "./_helpers/dataTransfer.js";
import type { BoardList } from "../types.js";

function makeLists(): BoardList[] {
  return [
    {
      id: "A",
      key: null,
      customName: { en: "A", zh: "A" },
      cards: [
        { id: "c1", title: { en: "one", zh: "一" } },
        { id: "c2", title: { en: "two", zh: "二" } },
      ],
    },
    {
      id: "B",
      key: null,
      customName: { en: "B", zh: "B" },
      cards: [{ id: "c3", title: { en: "three", zh: "三" } }],
    },
  ];
}

function baseProps(overrides = {}) {
  return {
    lists: makeLists(),
    lang: "en" as const,
    draftListIdx: null,
    setDraftListIdx: vi.fn(),
    composerText: "",
    setComposerText: vi.fn(),
    showListComposer: false,
    setShowListComposer: vi.fn(),
    newListName: "",
    setNewListName: vi.fn(),
    addCard: vi.fn(),
    addList: vi.fn(),
    setListColor: vi.fn(),
    moveCardToList: vi.fn(),
    listMenu: null,
    setListMenu: vi.fn(),
    ...overrides,
  };
}

describe("BoardView", () => {
  test("BV1 renders one section.board-list per list", () => {
    render(<BoardView {...baseProps()} />);
    expect(screen.getAllByTestId("board-list").length).toBe(2);
  });

  test("BV2 click Add-list button → setShowListComposer(true)", () => {
    const setShowListComposer = vi.fn();
    render(<BoardView {...baseProps({ setShowListComposer })} />);
    fireEvent.click(screen.getByTestId("add-list-btn"));
    expect(setShowListComposer).toHaveBeenCalledWith(true);
  });

  test("BV3 Enter in list-name input → addList fires", () => {
    const addList = vi.fn();
    render(
      <BoardView
        {...baseProps({ showListComposer: true, addList })}
      />,
    );
    fireEvent.keyDown(screen.getByTestId("list-name-input"), { key: "Enter" });
    expect(addList).toHaveBeenCalledTimes(1);
  });

  test("BV4 Escape closes list composer without addList", () => {
    const addList = vi.fn();
    const setShowListComposer = vi.fn();
    render(
      <BoardView
        {...baseProps({
          showListComposer: true,
          addList,
          setShowListComposer,
        })}
      />,
    );
    fireEvent.keyDown(screen.getByTestId("list-name-input"), { key: "Escape" });
    expect(addList).not.toHaveBeenCalled();
    expect(setShowListComposer).toHaveBeenCalledWith(false);
  });

  test("BV5 DnD drop across two lists fires moveCardToList(cardId, A, B)", () => {
    const moveCardToList = vi.fn();
    render(<BoardView {...baseProps({ moveCardToList })} />);

    const dt = makeDataTransferMock();
    const cards = screen.getAllByTestId("board-card");
    fireEvent.dragStart(cards[0]!, { dataTransfer: dt });

    const lists = screen.getAllByTestId("board-list");
    fireEvent.dragOver(lists[1]!, { dataTransfer: dt });
    fireEvent.drop(lists[1]!, { dataTransfer: dt });

    expect(moveCardToList).toHaveBeenCalledTimes(1);
    expect(moveCardToList).toHaveBeenCalledWith("c1", "A", "B");
  });

  test("BV6 drop on same list does NOT call moveCardToList", () => {
    const moveCardToList = vi.fn();
    render(<BoardView {...baseProps({ moveCardToList })} />);

    const dt = makeDataTransferMock();
    const cards = screen.getAllByTestId("board-card");
    fireEvent.dragStart(cards[0]!, { dataTransfer: dt });

    const lists = screen.getAllByTestId("board-list");
    fireEvent.drop(lists[0]!, { dataTransfer: dt });

    expect(moveCardToList).not.toHaveBeenCalled();
  });

  test("BV7 drop with empty dataTransfer is silently ignored", () => {
    const moveCardToList = vi.fn();
    render(<BoardView {...baseProps({ moveCardToList })} />);

    const lists = screen.getAllByTestId("board-list");
    const dt = makeDataTransferMock();
    fireEvent.drop(lists[1]!, { dataTransfer: dt });

    expect(moveCardToList).not.toHaveBeenCalled();
  });

  test("BV8 drop with malformed JSON payload is silently ignored", () => {
    const moveCardToList = vi.fn();
    render(<BoardView {...baseProps({ moveCardToList })} />);

    const dt = makeDataTransferMock();
    dt.setData(BOARD_CARD_DND_MIME, "not json");
    const lists = screen.getAllByTestId("board-list");
    fireEvent.drop(lists[1]!, { dataTransfer: dt });

    expect(moveCardToList).not.toHaveBeenCalled();
  });

  test("BV8b drop with JSON payload missing required fields is silently ignored", () => {
    const moveCardToList = vi.fn();
    render(<BoardView {...baseProps({ moveCardToList })} />);

    const dt = makeDataTransferMock();
    dt.setData(BOARD_CARD_DND_MIME, JSON.stringify({ cardId: 42 }));
    const lists = screen.getAllByTestId("board-list");
    fireEvent.drop(lists[1]!, { dataTransfer: dt });

    expect(moveCardToList).not.toHaveBeenCalled();
  });

  test("BV9 list shows .drop-target while a foreign card drags over", () => {
    render(<BoardView {...baseProps()} />);
    const dt = makeDataTransferMock();
    const cards = screen.getAllByTestId("board-card");
    fireEvent.dragStart(cards[0]!, { dataTransfer: dt });

    const lists = screen.getAllByTestId("board-list");
    fireEvent.dragOver(lists[1]!, { dataTransfer: dt });
    expect(lists[1]!.className).toContain("drop-target");

    // Source list does not get .drop-target
    expect(lists[0]!.className).not.toContain("drop-target");
  });
});
