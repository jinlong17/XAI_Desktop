/**
 * AiSidebar component tests.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 — SB
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AiSidebar } from "../AiSidebar.js";
import type { AiConvoRecord } from "../types.js";

const sample: AiConvoRecord[] = [
  { id: "c1", title: "Weekly review", time: "Today" },
  { id: "c2", title: "Focus rhythm", time: "Yesterday" },
];

const baseHandlers = {
  onSelectConvo: () => undefined,
  onNewChat: () => undefined,
  onCollapse: () => undefined,
};

describe("AiSidebar (SB)", () => {
  it("SB1: renders empty .ai-convos when convos=[]", () => {
    const { container } = render(
      <AiSidebar
        convos={[]}
        activeConvo={null}
        open={true}
        lang="en"
        {...baseHandlers}
      />,
    );
    const list = container.querySelector(".ai-convos");
    expect(list).not.toBeNull();
    expect(list?.children.length).toBe(0);
  });

  it("SB2: renders one .ai-convo-row per convo", () => {
    const { container } = render(
      <AiSidebar
        convos={sample}
        activeConvo={null}
        open={true}
        lang="en"
        {...baseHandlers}
      />,
    );
    expect(container.querySelectorAll(".ai-convo-row").length).toBe(2);
  });

  it("SB3: clicking a row invokes onSelectConvo with that id", () => {
    const onSelectConvo = vi.fn();
    const { container } = render(
      <AiSidebar
        convos={sample}
        activeConvo={null}
        open={true}
        lang="en"
        {...baseHandlers}
        onSelectConvo={onSelectConvo}
      />,
    );
    const rows = container.querySelectorAll(".ai-convo-row");
    fireEvent.click(rows[1]!);
    expect(onSelectConvo).toHaveBeenCalledWith("c2");
  });

  it("SB4: clicking new-chat button invokes onNewChat", () => {
    const onNewChat = vi.fn();
    render(
      <AiSidebar
        convos={[]}
        activeConvo={null}
        open={true}
        lang="en"
        {...baseHandlers}
        onNewChat={onNewChat}
      />,
    );
    const btn = screen.getByText(/New chat/i);
    fireEvent.click(btn);
    expect(onNewChat).toHaveBeenCalledOnce();
  });

  it("SB5: clicking the collapse icon invokes onCollapse", () => {
    const onCollapse = vi.fn();
    render(
      <AiSidebar
        convos={[]}
        activeConvo={null}
        open={true}
        lang="en"
        {...baseHandlers}
        onCollapse={onCollapse}
      />,
    );
    const btn = screen.getByRole("button", { name: /Collapse/i });
    fireEvent.click(btn);
    expect(onCollapse).toHaveBeenCalledOnce();
  });

  it("SB6: marks the active convo row with .active", () => {
    const { container } = render(
      <AiSidebar
        convos={sample}
        activeConvo="c1"
        open={true}
        lang="en"
        {...baseHandlers}
      />,
    );
    const rows = container.querySelectorAll(".ai-convo-row");
    expect(rows[0]?.className).toContain("active");
    expect(rows[1]?.className).not.toContain("active");
  });

  it("SB7: ZH lang renders 搜索对话 placeholder", () => {
    const { container } = render(
      <AiSidebar
        convos={[]}
        activeConvo={null}
        open={true}
        lang="zh"
        {...baseHandlers}
      />,
    );
    const input = container.querySelector(".ai-search input");
    expect(input?.getAttribute("placeholder")).toBe("搜索对话");
  });
});
