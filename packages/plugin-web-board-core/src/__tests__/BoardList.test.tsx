import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BoardList } from "../BoardList.js";
import type { BoardList as BoardListData } from "../types.js";

function makeList(extra: Partial<BoardListData> = {}): BoardListData {
  return {
    id: "l1",
    key: null,
    customName: { en: "My", zh: "我的" },
    color: null,
    cards: [
      { id: "c1", title: { en: "card-en-1", zh: "card-zh-1" } },
      { id: "c2", title: { en: "card-en-2", zh: "card-zh-2" } },
    ],
    ...extra,
  };
}

function baseProps(overrides = {}) {
  return {
    list: makeList(),
    lang: "en" as const,
    isComposer: false,
    openComposer: vi.fn(),
    closeComposer: vi.fn(),
    composerText: "",
    setComposerText: vi.fn(),
    addCard: vi.fn(),
    listMenuOpen: false,
    openListMenu: vi.fn(),
    closeListMenu: vi.fn(),
    setListColor: vi.fn(),
    canManageList: true,
    canMoveListLeft: true,
    canMoveListRight: true,
    renameList: vi.fn(),
    moveListByOffset: vi.fn(),
    archiveList: vi.fn(),
    deleteList: vi.fn(),
    cardMenu: null,
    setCardMenu: vi.fn(),
    canMoveCardWithinListByOffset: vi.fn(() => true),
    renameCard: vi.fn(),
    moveCardWithinListByOffset: vi.fn(),
    archiveCard: vi.fn(),
    isDropTarget: false,
    onListDragOver: vi.fn(),
    onListDragLeave: vi.fn(),
    onListDrop: vi.fn(),
    onCardDragStart: vi.fn(),
    onCardDragEnd: vi.fn(),
    draggingCardId: null as string | null,
    ...overrides,
  };
}

describe("BoardList", () => {
  test("BL1 renders list name (key → label catalog or customName[lang])", () => {
    const { rerender } = render(<BoardList {...baseProps()} />);
    expect(screen.getByText("My")).toBeInTheDocument();
    rerender(
      <BoardList
        {...baseProps({
          list: makeList({ key: "today", customName: undefined }),
        })}
      />,
    );
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  test("BL2 renders all list.cards", () => {
    render(<BoardList {...baseProps()} />);
    expect(screen.getAllByTestId("board-card").length).toBe(2);
  });

  test("BL3 click add-card → openComposer fires", () => {
    const openComposer = vi.fn();
    render(<BoardList {...baseProps({ openComposer })} />);
    fireEvent.click(screen.getByTestId("add-card-btn"));
    expect(openComposer).toHaveBeenCalledTimes(1);
  });

  test("BL4 Enter in composer → addCard fires", () => {
    const addCard = vi.fn();
    render(
      <BoardList {...baseProps({ isComposer: true, addCard })} />,
    );
    const ta = screen.getByTestId("card-composer-input");
    fireEvent.keyDown(ta, { key: "Enter" });
    expect(addCard).toHaveBeenCalledTimes(1);
  });

  test("BL5 Shift+Enter in composer does NOT call addCard", () => {
    const addCard = vi.fn();
    render(
      <BoardList {...baseProps({ isComposer: true, addCard })} />,
    );
    const ta = screen.getByTestId("card-composer-input");
    fireEvent.keyDown(ta, { key: "Enter", shiftKey: true });
    expect(addCard).not.toHaveBeenCalled();
  });

  test("BL6 Escape in composer → closeComposer fires", () => {
    const closeComposer = vi.fn();
    render(
      <BoardList {...baseProps({ isComposer: true, closeComposer })} />,
    );
    fireEvent.keyDown(screen.getByTestId("card-composer-input"), {
      key: "Escape",
    });
    expect(closeComposer).toHaveBeenCalledTimes(1);
  });

  test("BL7 explicit Add click fires addCard", () => {
    const addCard = vi.fn();
    render(
      <BoardList {...baseProps({ isComposer: true, addCard })} />,
    );
    fireEvent.click(screen.getByTestId("card-composer-add"));
    expect(addCard).toHaveBeenCalledTimes(1);
  });

  test("BL8 click dots opens menu with 10 color swatches + remove + composer item", () => {
    render(<BoardList {...baseProps({ listMenuOpen: true })} />);
    const swatches = screen
      .getAllByRole("button")
      .filter((btn) => btn.getAttribute("data-color-id"));
    expect(swatches.length).toBe(10);
    expect(screen.getByTestId("list-rename-open")).toBeInTheDocument();
    expect(screen.getByTestId("list-move-left")).toBeInTheDocument();
  });

  test("BL9 click a swatch → setListColor(id) fires + closeListMenu fires", () => {
    const setListColor = vi.fn();
    const closeListMenu = vi.fn();
    render(
      <BoardList
        {...baseProps({
          listMenuOpen: true,
          setListColor,
          closeListMenu,
        })}
      />,
    );
    const red = screen
      .getAllByRole("button")
      .find((b) => b.getAttribute("data-color-id") === "red")!;
    fireEvent.click(red);
    expect(setListColor).toHaveBeenCalledWith("red");
    expect(closeListMenu).toHaveBeenCalledTimes(1);
  });

  test("BL10 click remove-color → setListColor(null)", () => {
    const setListColor = vi.fn();
    render(
      <BoardList
        {...baseProps({ listMenuOpen: true, setListColor })}
      />,
    );
    fireEvent.click(screen.getByText("Remove color"));
    expect(setListColor).toHaveBeenCalledWith(null);
  });

  test("BL11 when list.color set, list has .has-color class + --list-color style var", () => {
    render(
      <BoardList {...baseProps({ list: makeList({ color: "blue" }) })} />,
    );
    const section = screen.getByTestId("board-list");
    expect(section.className).toContain("has-color");
    expect(section.getAttribute("style")).toContain("--list-color");
  });

  test("BL12 zh microcopy renders when lang=zh", () => {
    render(<BoardList {...baseProps({ lang: "zh" as const })} />);
    expect(screen.getByText("+ 添加卡片")).toBeInTheDocument();
  });

  test("BL13 drop-target class applied when isDropTarget=true", () => {
    render(<BoardList {...baseProps({ isDropTarget: true })} />);
    expect(screen.getByTestId("board-list").className).toContain("drop-target");
  });

  test("BL14 rename form calls renameList and closes menu", () => {
    const renameList = vi.fn();
    const closeListMenu = vi.fn();
    render(
      <BoardList
        {...baseProps({ listMenuOpen: true, renameList, closeListMenu })}
      />,
    );

    fireEvent.click(screen.getByTestId("list-rename-open"));
    fireEvent.change(screen.getByTestId("list-rename-input"), {
      target: { value: "Renamed" },
    });
    fireEvent.click(screen.getByTestId("list-rename-save"));

    expect(renameList).toHaveBeenCalledWith("Renamed");
    expect(closeListMenu).toHaveBeenCalledTimes(1);
  });

  test("BL15 move buttons call moveListByOffset with signed offsets", () => {
    const moveListByOffset = vi.fn();
    render(
      <BoardList
        {...baseProps({ listMenuOpen: true, moveListByOffset })}
      />,
    );

    fireEvent.click(screen.getByTestId("list-move-left"));
    expect(moveListByOffset).toHaveBeenCalledWith(-1);
  });

  test("BL16 non-empty destructive action archives; empty destructive action deletes", () => {
    const archiveList = vi.fn();
    const deleteList = vi.fn();
    const { rerender } = render(
      <BoardList
        {...baseProps({ listMenuOpen: true, archiveList, deleteList })}
      />,
    );

    fireEvent.click(screen.getByTestId("list-archive"));
    expect(archiveList).toHaveBeenCalledTimes(1);
    expect(deleteList).not.toHaveBeenCalled();

    rerender(
      <BoardList
        {...baseProps({
          list: makeList({ cards: [] }),
          listMenuOpen: true,
          archiveList,
          deleteList,
        })}
      />,
    );
    fireEvent.click(screen.getByTestId("list-delete"));
    expect(deleteList).toHaveBeenCalledTimes(1);
  });

  test("BL17 keyed list displays customName override before key catalog label", () => {
    render(
      <BoardList
        {...baseProps({
          list: makeList({
            key: "today",
            customName: { en: "Focus", zh: "专注" },
          }),
        })}
      />,
    );
    expect(screen.getByText("Focus")).toBeInTheDocument();
    expect(screen.queryByText("Today")).not.toBeInTheDocument();
  });

  test("BL18 card actions route stable card ids to callbacks", () => {
    const renameCard = vi.fn();
    const moveCardWithinListByOffset = vi.fn();
    const archiveCard = vi.fn();
    render(
      <BoardList
        {...baseProps({
          cardMenu: "l1:c1",
          renameCard,
          moveCardWithinListByOffset,
          archiveCard,
        })}
      />,
    );

    fireEvent.click(screen.getByTestId("card-rename-open"));
    fireEvent.change(screen.getByTestId("card-rename-input"), {
      target: { value: "Renamed via list" },
    });
    fireEvent.click(screen.getByTestId("card-rename-save"));
    expect(renameCard).toHaveBeenCalledWith("c1", "Renamed via list");

    fireEvent.click(screen.getByTestId("card-move-down"));
    expect(moveCardWithinListByOffset).toHaveBeenCalledWith("c1", 1);

    fireEvent.click(screen.getByTestId("card-archive"));
    expect(archiveCard).toHaveBeenCalledWith("c1");
  });
});
