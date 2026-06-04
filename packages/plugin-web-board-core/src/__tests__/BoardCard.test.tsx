import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BOARD_CARD_DND_MIME, BoardCard } from "../BoardCard.js";
import { makeDataTransferMock } from "./_helpers/dataTransfer.js";
import type { BoardCard as BoardCardData } from "../types.js";

function makeCard(extra: Partial<BoardCardData> = {}): BoardCardData {
  return {
    id: "c1",
    title: { en: "Hello", zh: "你好" },
    ...extra,
  };
}

describe("BoardCard", () => {
  test("BC1 renders bilingual title (en when lang=en, zh when lang=zh)", () => {
    const { rerender } = render(<BoardCard card={makeCard()} lang="en" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    rerender(<BoardCard card={makeCard()} lang="zh" />);
    expect(screen.getByText("你好")).toBeInTheDocument();
  });

  test("BC2 renders label chips only when card.labels set", () => {
    const { rerender, container } = render(
      <BoardCard card={makeCard({ labels: ["l1", "l2"] })} lang="en" />,
    );
    expect(container.querySelectorAll(".bc-label").length).toBe(2);
    rerender(<BoardCard card={makeCard({ labels: [] })} lang="en" />);
    expect(container.querySelectorAll(".bc-label").length).toBe(0);
    rerender(<BoardCard card={makeCard()} lang="en" />);
    expect(container.querySelectorAll(".bc-label").length).toBe(0);
  });

  test("BC3 renders checklist count when card.checklist set", () => {
    render(
      <BoardCard
        card={makeCard({ checklist: { done: 2, total: 5 } })}
        lang="en"
      />,
    );
    expect(screen.getByTestId("bc-checklist").textContent).toBe("2/5");
  });

  test("BC3b checklist shows `done` class when done === total", () => {
    render(
      <BoardCard
        card={makeCard({ checklist: { done: 3, total: 3 } })}
        lang="en"
      />,
    );
    const chip = screen.getByTestId("bc-checklist");
    expect(chip.className).toContain("done");
  });

  test("BC4 renders due chip from board-core date meta and derives late state from typed dueDate", () => {
    const { rerender } = render(
      <BoardCard card={makeCard({ due: "5/26" })} lang="en" />,
    );
    expect(screen.getByTestId("bc-due").textContent).toBe("5/26");

    rerender(
      <BoardCard
        card={makeCard({ dueDate: "2000-01-01", dueLate: false })}
        lang="en"
      />,
    );
    expect(screen.getByTestId("bc-due").textContent).toBe("1/1");
    expect(screen.getByTestId("bc-due").className).toContain("late");

    rerender(
      <BoardCard
        card={makeCard({ due: "Overdue", dueLate: true })}
        lang="en"
      />,
    );
    expect(screen.getByTestId("bc-due").textContent).toBe("Overdue");
    expect(screen.getByTestId("bc-due").className).not.toContain("late");
  });

  test("BC4b dueEn is used when lang=en + dueEn provided", () => {
    render(
      <BoardCard
        card={makeCard({ due: "今天", dueEn: "Today" })}
        lang="en"
      />,
    );
    expect(screen.getByTestId("bc-due").textContent).toBe("Today");
    expect(screen.getByTestId("bc-due").className).toContain("today");
  });

  test("BC5 draggable=true + onDragStart fires with payload matching MIME contract", () => {
    const onDragStart = vi.fn();
    render(
      <BoardCard
        card={makeCard()}
        lang="en"
        draggable
        onDragStart={onDragStart}
      />,
    );
    const article = screen.getByTestId("board-card");
    expect(article.getAttribute("draggable")).toBe("true");

    const dt = makeDataTransferMock();
    fireEvent.dragStart(article, { dataTransfer: dt });
    expect(onDragStart).toHaveBeenCalledTimes(1);
    // payload writing is the caller's responsibility — test in BoardView.test
    // We just confirm the MIME constant is exported and well-formed.
    expect(BOARD_CARD_DND_MIME).toBe("application/x-xai-board-card");
  });

  test("BC6 card action menu stops detail click and calls rename/move/archive callbacks", () => {
    const onClick = vi.fn();
    const openCardMenu = vi.fn();
    const closeCardMenu = vi.fn();
    const renameCard = vi.fn();
    const moveCardByOffset = vi.fn();
    const archiveCard = vi.fn();
    const { rerender } = render(
      <BoardCard
        card={makeCard()}
        lang="en"
        onClick={onClick}
        openCardMenu={openCardMenu}
        closeCardMenu={closeCardMenu}
        renameCard={renameCard}
        moveCardByOffset={moveCardByOffset}
        archiveCard={archiveCard}
      />,
    );

    fireEvent.click(screen.getByTestId("card-menu-open"));
    expect(openCardMenu).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();

    rerender(
      <BoardCard
        card={makeCard()}
        lang="en"
        cardMenuOpen
        canMoveCardUp
        canMoveCardDown
        onClick={onClick}
        openCardMenu={openCardMenu}
        closeCardMenu={closeCardMenu}
        renameCard={renameCard}
        moveCardByOffset={moveCardByOffset}
        archiveCard={archiveCard}
      />,
    );

    fireEvent.click(screen.getByTestId("card-rename-open"));
    fireEvent.change(screen.getByTestId("card-rename-input"), {
      target: { value: "Renamed card" },
    });
    fireEvent.click(screen.getByTestId("card-rename-save"));
    expect(renameCard).toHaveBeenCalledWith("Renamed card");

    rerender(
      <BoardCard
        card={makeCard()}
        lang="en"
        cardMenuOpen
        canMoveCardUp
        canMoveCardDown
        openCardMenu={openCardMenu}
        closeCardMenu={closeCardMenu}
        renameCard={renameCard}
        moveCardByOffset={moveCardByOffset}
        archiveCard={archiveCard}
      />,
    );
    fireEvent.click(screen.getByTestId("card-move-up"));
    expect(moveCardByOffset).toHaveBeenCalledWith(-1);

    rerender(
      <BoardCard
        card={makeCard()}
        lang="en"
        cardMenuOpen
        canMoveCardUp
        canMoveCardDown
        openCardMenu={openCardMenu}
        closeCardMenu={closeCardMenu}
        renameCard={renameCard}
        moveCardByOffset={moveCardByOffset}
        archiveCard={archiveCard}
      />,
    );
    fireEvent.click(screen.getByTestId("card-archive"));
    expect(archiveCard).toHaveBeenCalledTimes(1);
  });
});
