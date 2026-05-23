/**
 * BS1..BS15 — BoardSwitcher component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Board, BoardWorkspace } from "@repo/plugin-web-board-core";
import { BoardSwitcher } from "../BoardSwitcher.js";

const WS: BoardWorkspace[] = [
  { id: "ws-personal", name: { en: "Personal", zh: "个人" }, color: "oklch(60% 0.10 165)" },
  { id: "ws-team", name: { en: "Team", zh: "团队" }, color: "oklch(60% 0.14 295)" },
];

const mkBoard = (over: Partial<Board>): Board => ({
  id: "b1",
  workspaceId: "ws-personal",
  name: { en: "Default", zh: "默认" },
  cover: "linear-gradient(135deg, oklch(70% 0.10 165), oklch(60% 0.10 165))",
  template: "kanban",
  lists: [],
  ...over,
});

const BOARDS: Board[] = [
  mkBoard({ id: "b1", workspaceId: "ws-personal", name: { en: "Personal Stuff", zh: "个人事项" } }),
  mkBoard({ id: "b2", workspaceId: "ws-team", name: { en: "Team Roadmap", zh: "团队路线图" }, template: "pm" }),
  mkBoard({ id: "b3", workspaceId: "ws-team", name: { en: "Q3 Launch", zh: "Q3 上线" } }),
];

const baseProps = {
  workspaces: WS,
  boards: BOARDS,
  activeBoardId: "b1",
  onPick: vi.fn(),
  onCreate: vi.fn(),
  onDelete: vi.fn(),
  onClose: vi.fn(),
} as const;

describe("BoardSwitcher (BS1..BS15)", () => {
  it("BS1: renders with search input autoFocused", () => {
    render(<BoardSwitcher lang="en" {...baseProps} />);
    const search = screen.getByTestId("bs-search-input") as HTMLInputElement;
    expect(search).toBeInTheDocument();
    expect(document.activeElement).toBe(search);
  });

  it("BS2: search filters by board.name[lang] case-insensitive", () => {
    render(<BoardSwitcher lang="en" {...baseProps} />);
    const search = screen.getByTestId("bs-search-input");
    fireEvent.change(search, { target: { value: "team" } });
    // "Team Roadmap" matches; "Personal Stuff" + "Q3 Launch" don't
    expect(screen.getByTestId("bs-card-b2")).toBeInTheDocument();
    expect(screen.queryByTestId("bs-card-b1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("bs-card-b3")).not.toBeInTheDocument();
  });

  it("BS3: 'All' scope tab selected by default", () => {
    render(<BoardSwitcher lang="en" {...baseProps} />);
    const allTab = screen.getByText("All").closest("button")!;
    expect(allTab.getAttribute("aria-selected")).toBe("true");
  });

  it("BS4: clicking a workspace tab filters to that workspace", () => {
    render(<BoardSwitcher lang="en" {...baseProps} />);
    // The "Team" string appears both in scope-tab and (when "All" is selected) in
    // the group header. Scope to the scope-tabs container.
    const scopesRoot = document.querySelector(".bs-scopes")!;
    const teamTab = Array.from(scopesRoot.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "Team",
    )!;
    fireEvent.click(teamTab);
    expect(screen.getByTestId("bs-card-b2")).toBeInTheDocument();
    expect(screen.getByTestId("bs-card-b3")).toBeInTheDocument();
    expect(screen.queryByTestId("bs-card-b1")).not.toBeInTheDocument();
  });

  it("BS5: zh placeholder", () => {
    render(<BoardSwitcher lang="zh" {...baseProps} />);
    expect(screen.getByPlaceholderText("搜索看板…")).toBeInTheDocument();
  });

  it("BS6: empty state when no matches", () => {
    render(<BoardSwitcher lang="en" {...baseProps} />);
    fireEvent.change(screen.getByTestId("bs-search-input"), {
      target: { value: "zzzz-no-match" },
    });
    expect(screen.getByText("No matching boards.")).toBeInTheDocument();
  });

  it("BS7: clicking a bs-card calls onPick", () => {
    const onPick = vi.fn();
    render(<BoardSwitcher lang="en" {...baseProps} onPick={onPick} />);
    fireEvent.click(screen.getByTestId("bs-card-b2"));
    expect(onPick).toHaveBeenCalledWith("b2");
  });

  it("BS8: clicking 'New board' calls onCreate", () => {
    const onCreate = vi.fn();
    render(<BoardSwitcher lang="en" {...baseProps} onCreate={onCreate} />);
    fireEvent.click(screen.getByTestId("bs-new-board"));
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it("BS9: active board has '.active' class", () => {
    render(<BoardSwitcher lang="en" {...baseProps} activeBoardId="b2" />);
    const activeCard = screen.getByTestId("bs-card-b2");
    expect(activeCard.className).toContain("active");
  });

  it("BS10: delete affordance hidden on active board", () => {
    render(<BoardSwitcher lang="en" {...baseProps} activeBoardId="b1" />);
    expect(screen.queryByTestId("bs-delete-b1")).not.toBeInTheDocument();
  });

  it("BS11: delete affordance hidden when only 1 board in filtered scope", () => {
    const oneBoard = [mkBoard({ id: "b1", workspaceId: "ws-personal" })];
    render(
      <BoardSwitcher lang="en" {...baseProps} boards={oneBoard} activeBoardId="other" />,
    );
    expect(screen.queryByTestId("bs-delete-b1")).not.toBeInTheDocument();
  });

  it("BS12: delete affordance visible on non-active with 2+ boards", () => {
    render(<BoardSwitcher lang="en" {...baseProps} activeBoardId="b1" />);
    expect(screen.getByTestId("bs-delete-b2")).toBeInTheDocument();
    expect(screen.getByTestId("bs-delete-b3")).toBeInTheDocument();
  });

  it("BS13: confirm true triggers onDelete with id", () => {
    const onDelete = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<BoardSwitcher lang="en" {...baseProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByTestId("bs-delete-b2"));
    expect(onDelete).toHaveBeenCalledWith("b2");
  });

  it("BS14: confirm false suppresses onDelete", () => {
    const onDelete = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<BoardSwitcher lang="en" {...baseProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByTestId("bs-delete-b2"));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("BS15: clicking scrim closes (onClose)", () => {
    const onClose = vi.fn();
    render(<BoardSwitcher lang="en" {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("bs-scrim"));
    expect(onClose).toHaveBeenCalled();
  });
});
