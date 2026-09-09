import { accountScope } from "@repo/plugin-web-storage";
import { describe, expect, test } from "vitest";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { BoardModule } from "../BoardModule.js";
import { makeDefaultBoards } from "../internal/seed/board-data.js";
import {
  createBoardStorageEnvelope,
  isBoardStorageEnvelopeV1,
} from "../internal/storageContract.js";

describe("BoardModule", () => {
  test("BM1 first mount with empty localStorage renders boards[0].name.en", () => {
    render(<BoardModule lang="en" />);
    const seed = makeDefaultBoards();
    expect(screen.getByTestId("board-title").textContent).toBe(seed[0]!.name.en);
  });

  test("BM2 mount with persisted xai_boards_v2 + xai_active_board renders matching board", () => {
    const seed = makeDefaultBoards();
    localStorage.setItem(accountScope.physicalKey("xai_boards_v2"), JSON.stringify(seed));
    localStorage.setItem(accountScope.physicalKey("xai_active_board"), "b-pm");
    render(<BoardModule lang="en" />);
    expect(screen.getByTestId("board-title").textContent).toBe("Project Management");
  });

  test("BM3 add-card via composer persists to xai_boards_v2; unmount/remount renders new card", () => {
    const { unmount } = render(<BoardModule lang="en" />);
    // Open composer on the first list
    const addBtns = screen.getAllByTestId("add-card-btn");
    fireEvent.click(addBtns[0]!);
    const ta = screen.getByTestId("card-composer-input");
    fireEvent.change(ta, { target: { value: "Newly added" } });
    fireEvent.keyDown(ta, { key: "Enter" });

    // Verify in DOM
    expect(screen.getByText("Newly added")).toBeInTheDocument();

    // Unmount + remount — read from localStorage
    unmount();
    render(<BoardModule lang="en" />);
    expect(screen.getByText("Newly added")).toBeInTheDocument();
  });

  test("BM4 lang flip re-renders bilingual title", () => {
    const { rerender } = render(<BoardModule lang="en" />);
    expect(screen.getByTestId("board-title").textContent).toBe("My Project Board");
    rerender(<BoardModule lang="zh" />);
    expect(screen.getByTestId("board-title").textContent).toBe("我的项目板");
  });

  test("BM5 mount with malformed xai_boards_v2 falls back to seed (no crash)", () => {
    localStorage.setItem(accountScope.physicalKey("xai_boards_v2"), '"garbage"');
    render(<BoardModule lang="en" />);
    expect(screen.getByTestId("board-title").textContent).toBe("My Project Board");
  });

  test("BM6 mount with stale xai_active_board id resolves to boards[0]", () => {
    const seed = makeDefaultBoards();
    localStorage.setItem(accountScope.physicalKey("xai_boards_v2"), JSON.stringify(seed));
    localStorage.setItem(accountScope.physicalKey("xai_active_board"), "no-such-board");
    render(<BoardModule lang="en" />);
    expect(screen.getByTestId("board-title").textContent).toBe(seed[0]!.name.en);
  });

  test("BM7 add-list via composer appends a new list", () => {
    render(<BoardModule lang="en" />);
    const beforeCount = screen.getAllByTestId("board-list").length;

    fireEvent.click(screen.getByTestId("add-list-btn"));
    const input = screen.getByTestId("list-name-input");
    fireEvent.change(input, { target: { value: "Custom Column" } });
    fireEvent.keyDown(input, { key: "Enter" });

    const afterCount = screen.getAllByTestId("board-list").length;
    expect(afterCount).toBe(beforeCount + 1);
    expect(screen.getByText("Custom Column")).toBeInTheDocument();
  });

  test("BM8 first-mount with null storage queues a persist of the seed", async () => {
    render(<BoardModule lang="en" />);
    // Allow queueMicrotask to flush
    await act(async () => {
      await Promise.resolve();
    });
    const raw = localStorage.getItem(accountScope.physicalKey("xai_boards_v2"));
    expect(raw).not.toBe(null);
    // Parsed value should be an array.
    expect(Array.isArray(JSON.parse(raw!))).toBe(true);
  });

  test("BM9 mount from v1 envelope and add-card preserves envelope storage", () => {
    const seed = makeDefaultBoards();
    localStorage.setItem(
      accountScope.physicalKey("xai_boards_v2"),
      JSON.stringify(createBoardStorageEnvelope(seed)),
    );

    render(<BoardModule lang="en" />);
    fireEvent.click(screen.getAllByTestId("add-card-btn")[0]!);
    const ta = screen.getByTestId("card-composer-input");
    fireEvent.change(ta, { target: { value: "Envelope card" } });
    fireEvent.keyDown(ta, { key: "Enter" });

    const raw = localStorage.getItem(accountScope.physicalKey("xai_boards_v2"));
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(isBoardStorageEnvelopeV1(parsed)).toBe(true);
    expect(JSON.stringify(parsed)).toContain("Envelope card");
  });
});
