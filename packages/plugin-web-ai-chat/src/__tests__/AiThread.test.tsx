/**
 * AiThread component tests.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 — TH
 */

import React, { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AiThread } from "../AiThread.js";
import type { AiMessage } from "../types.js";

const noop = () => undefined;

describe("AiThread (TH)", () => {
  it("TH1: empty messages renders .ai-welcome with bilingual heading", () => {
    const ref = createRef<HTMLDivElement>();
    const { container, rerender } = render(
      <AiThread
        messages={[]}
        thinking={false}
        showInsights={true}
        lang="en"
        onStarter={noop}
        endRef={ref}
      />,
    );
    expect(container.querySelector(".ai-welcome")).not.toBeNull();
    expect(container.querySelector("h1")?.textContent).toMatch(
      /Where should we start/i,
    );
    rerender(
      <AiThread
        messages={[]}
        thinking={false}
        showInsights={true}
        lang="zh"
        onStarter={noop}
        endRef={ref}
      />,
    );
    expect(container.querySelector("h1")?.textContent).toMatch(/今天想从哪里开始/);
  });

  it("TH2: showInsights=true with empty messages renders 4 .ai-starter buttons", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <AiThread
        messages={[]}
        thinking={false}
        showInsights={true}
        lang="en"
        onStarter={noop}
        endRef={ref}
      />,
    );
    expect(container.querySelectorAll(".ai-starter").length).toBe(4);
  });

  it("TH3: showInsights=false → no .ai-starter", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <AiThread
        messages={[]}
        thinking={false}
        showInsights={false}
        lang="en"
        onStarter={noop}
        endRef={ref}
      />,
    );
    expect(container.querySelectorAll(".ai-starter").length).toBe(0);
  });

  it("TH4: clicking a starter invokes onStarter(prompt)", () => {
    const onStarter = vi.fn();
    const ref = createRef<HTMLDivElement>();
    render(
      <AiThread
        messages={[]}
        thinking={false}
        showInsights={true}
        lang="en"
        onStarter={onStarter}
        endRef={ref}
      />,
    );
    const btn = screen.getByText(/Summarize my overdue tasks/);
    fireEvent.click(btn);
    expect(onStarter).toHaveBeenCalledWith(
      "Summarize my overdue tasks and suggest a plan",
    );
  });

  it("TH5: messages render one .ai-msg per entry with role class", () => {
    const ref = createRef<HTMLDivElement>();
    const msgs: AiMessage[] = [
      { role: "user", text: "hi", attachments: null },
      { role: "assistant", text: "hello", attachments: null },
    ];
    const { container } = render(
      <AiThread
        messages={msgs}
        thinking={false}
        showInsights={false}
        lang="en"
        onStarter={noop}
        endRef={ref}
      />,
    );
    expect(container.querySelectorAll(".ai-msg-user").length).toBe(1);
    expect(container.querySelectorAll(".ai-msg-assistant").length).toBe(1);
  });

  it("TH6: thinking=true appends .ai-typing bubble", () => {
    const ref = createRef<HTMLDivElement>();
    const msgs: AiMessage[] = [{ role: "user", text: "hi", attachments: null }];
    const { container } = render(
      <AiThread
        messages={msgs}
        thinking={true}
        showInsights={false}
        lang="en"
        onStarter={noop}
        endRef={ref}
      />,
    );
    expect(container.querySelector(".ai-typing")).not.toBeNull();
  });

  it("TH7: assistant messages render the .ai-avatar icon", () => {
    const ref = createRef<HTMLDivElement>();
    const msgs: AiMessage[] = [
      { role: "assistant", text: "hello", attachments: null },
    ];
    const { container } = render(
      <AiThread
        messages={msgs}
        thinking={false}
        showInsights={false}
        lang="en"
        onStarter={noop}
        endRef={ref}
      />,
    );
    expect(container.querySelector(".ai-avatar")).not.toBeNull();
  });

  it("TH8: user message with attachments renders .ai-msg-attach pills", () => {
    const ref = createRef<HTMLDivElement>();
    const msgs: AiMessage[] = [
      { role: "user", text: "hi", attachments: ["a.png", "b.png"] },
    ];
    const { container } = render(
      <AiThread
        messages={msgs}
        thinking={false}
        showInsights={false}
        lang="en"
        onStarter={noop}
        endRef={ref}
      />,
    );
    const pills = container.querySelectorAll(".ai-pill");
    expect(pills.length).toBe(2);
  });
});
