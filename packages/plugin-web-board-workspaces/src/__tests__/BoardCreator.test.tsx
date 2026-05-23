/**
 * BC1..BC10 — BoardCreator component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { BoardWorkspace } from "@repo/plugin-web-board-core";
import { BOARD_TEMPLATES } from "@repo/plugin-web-board-core";
import { BoardCreator } from "../BoardCreator.js";

const WS: BoardWorkspace[] = [
  { id: "ws-personal", name: { en: "Personal", zh: "个人" }, color: "oklch(60% 0.10 165)" },
  { id: "ws-team", name: { en: "Team", zh: "团队" }, color: "oklch(60% 0.14 295)" },
];

const baseProps = {
  workspaces: WS,
  onCancel: vi.fn(),
  onCreate: vi.fn(),
} as const;

describe("BoardCreator (BC1..BC10)", () => {
  it("BC1: renders 3 template cards", () => {
    render(<BoardCreator lang="en" {...baseProps} />);
    for (const t of BOARD_TEMPLATES) {
      expect(screen.getByTestId(`bc-tpl-${t.id}`)).toBeInTheDocument();
    }
  });

  it("BC2: default selected template is 'pm'", () => {
    render(<BoardCreator lang="en" {...baseProps} />);
    expect(screen.getByTestId("bc-tpl-pm").className).toContain("active");
    expect(screen.getByTestId("bc-tpl-kanban").className).not.toContain("active");
    expect(screen.getByTestId("bc-tpl-blank").className).not.toContain("active");
  });

  it("BC3: clicking another template switches selection", () => {
    render(<BoardCreator lang="en" {...baseProps} />);
    fireEvent.click(screen.getByTestId("bc-tpl-kanban"));
    expect(screen.getByTestId("bc-tpl-kanban").className).toContain("active");
    expect(screen.getByTestId("bc-tpl-pm").className).not.toContain("active");
  });

  it("BC4: name input autoFocused with default 'New board' (en) / '新看板' (zh)", () => {
    const { unmount } = render(<BoardCreator lang="en" {...baseProps} />);
    const input = screen.getByTestId("bc-name-input") as HTMLInputElement;
    expect(input.value).toBe("New board");
    expect(document.activeElement).toBe(input);
    unmount();
    render(<BoardCreator lang="zh" {...baseProps} />);
    expect((screen.getByTestId("bc-name-input") as HTMLInputElement).value).toBe("新看板");
  });

  it("BC5: workspace select lists all workspaces", () => {
    render(<BoardCreator lang="en" {...baseProps} />);
    const select = screen.getByTestId("bc-ws-select") as HTMLSelectElement;
    expect(select.options).toHaveLength(2);
    expect(select.options[0]!.value).toBe("ws-personal");
    expect(select.options[1]!.value).toBe("ws-team");
  });

  it("BC6: default workspace is workspaces[0].id", () => {
    render(<BoardCreator lang="en" {...baseProps} />);
    const select = screen.getByTestId("bc-ws-select") as HTMLSelectElement;
    expect(select.value).toBe("ws-personal");
  });

  it("BC7: Create with empty name uses default name", () => {
    const onCreate = vi.fn();
    render(<BoardCreator lang="en" {...baseProps} onCreate={onCreate} />);
    fireEvent.change(screen.getByTestId("bc-name-input"), { target: { value: "   " } });
    fireEvent.click(screen.getByTestId("bc-submit"));
    expect(onCreate).toHaveBeenCalledWith("pm", "New board", "ws-personal");
  });

  it("BC8: Create passes trimmed name + selected tpl + ws", () => {
    const onCreate = vi.fn();
    render(<BoardCreator lang="en" {...baseProps} onCreate={onCreate} />);
    fireEvent.click(screen.getByTestId("bc-tpl-kanban"));
    fireEvent.change(screen.getByTestId("bc-name-input"), { target: { value: "  Sprint 42  " } });
    fireEvent.change(screen.getByTestId("bc-ws-select"), { target: { value: "ws-team" } });
    fireEvent.click(screen.getByTestId("bc-submit"));
    expect(onCreate).toHaveBeenCalledWith("kanban", "Sprint 42", "ws-team");
  });

  it("BC9: Cancel button calls onCancel", () => {
    const onCancel = vi.fn();
    render(<BoardCreator lang="en" {...baseProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("BC10: scrim click calls onCancel", () => {
    const onCancel = vi.fn();
    render(<BoardCreator lang="en" {...baseProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId("bc-scrim"));
    expect(onCancel).toHaveBeenCalled();
  });
});
