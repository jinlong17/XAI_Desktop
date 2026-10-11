/**
 * AiComposer component tests.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 — CO
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AiComposer } from "../AiComposer.js";
import type { AiAttachment } from "../types.js";

const noop = () => undefined;

interface RenderOpts {
  input?: string;
  attachments?: AiAttachment[];
  voiceOn?: boolean;
  lang?: "en" | "zh";
  onInputChange?: (s: string) => void;
  onAttachFiles?: (files: File[]) => void;
  onRemoveAttachment?: (i: number) => void;
  onVoiceToggle?: () => void;
  onSend?: () => void;
}

function renderComposer(opts: RenderOpts = {}) {
  return render(
    <AiComposer
      input={opts.input ?? ""}
      onInputChange={opts.onInputChange ?? noop}
      attachments={opts.attachments ?? []}
      onAttachFiles={opts.onAttachFiles ?? noop}
      onRemoveAttachment={opts.onRemoveAttachment ?? noop}
      voiceOn={opts.voiceOn ?? true}
      onVoiceToggle={opts.onVoiceToggle ?? noop}
      onSend={opts.onSend ?? noop}
      lang={opts.lang ?? "en"}
    />,
  );
}

describe("AiComposer (CO)", () => {
  it("CO1: typing then Enter calls onSend", () => {
    const onSend = vi.fn();
    const { container } = renderComposer({ input: "hello", onSend });
    const inp = container.querySelector<HTMLInputElement>(".ai-input")!;
    fireEvent.keyDown(inp, { key: "Enter", shiftKey: false });
    expect(onSend).toHaveBeenCalledOnce();
  });

  it("CO2: Shift+Enter does NOT call onSend", () => {
    const onSend = vi.fn();
    const { container } = renderComposer({ input: "hello", onSend });
    const inp = container.querySelector<HTMLInputElement>(".ai-input")!;
    fireEvent.keyDown(inp, { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("CO3: Enter with whitespace-only input does not call onSend", () => {
    const onSend = vi.fn();
    const { container } = renderComposer({ input: "   \t  ", onSend });
    const inp = container.querySelector<HTMLInputElement>(".ai-input")!;
    fireEvent.keyDown(inp, { key: "Enter", shiftKey: false });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("CO4: send button click calls onSend", () => {
    const onSend = vi.fn();
    renderComposer({ input: "hi", onSend });
    const btn = screen.getByRole("button", { name: /Send/i });
    fireEvent.click(btn);
    expect(onSend).toHaveBeenCalledOnce();
  });

  it("CO5: model picker is not exposed in the chat composer", () => {
    const { container } = renderComposer();
    expect(container.querySelector(".ai-model-btn")).toBeNull();
    expect(container.textContent).not.toMatch(/Haiku|Sonnet|Opus|4\./i);
  });

  it("CO6: voice mic toggle calls onVoiceToggle and swaps icons", () => {
    const onVoiceToggle = vi.fn();
    const { container, rerender } = renderComposer({
      voiceOn: true,
      onVoiceToggle,
    });
    const micBtn = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Voice on"]',
    )!;
    fireEvent.click(micBtn);
    expect(onVoiceToggle).toHaveBeenCalledOnce();
    rerender(
      <AiComposer
        input=""
        onInputChange={noop}
        attachments={[]}
        onAttachFiles={noop}
        onRemoveAttachment={noop}
        voiceOn={false}
        onVoiceToggle={onVoiceToggle}
        onSend={noop}
        lang="en"
      />,
    );
    expect(
      container.querySelector('button[aria-label="Voice off"]'),
    ).not.toBeNull();
  });

  it("CO7: hidden file input exists with multiple attribute", () => {
    const { container } = renderComposer();
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    expect(fileInput?.hasAttribute("multiple")).toBe(true);
  });

  it("CO8: attachments render chips with working remove buttons", () => {
    const onRemoveAttachment = vi.fn();
    const { container } = renderComposer({
      attachments: [
        { name: "a.png", size: 10 },
        { name: "b.png", size: 20 },
      ],
      onRemoveAttachment,
    });
    const chips = container.querySelectorAll(".ai-attach-chip");
    expect(chips.length).toBe(2);
    const removeBtn = chips[0]?.querySelector("button");
    fireEvent.click(removeBtn!);
    expect(onRemoveAttachment).toHaveBeenCalledWith(0);
  });
});
