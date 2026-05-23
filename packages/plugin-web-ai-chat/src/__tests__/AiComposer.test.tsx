/**
 * AiComposer component tests.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 — CO
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AiComposer } from "../AiComposer.js";
import type { AiAttachment, AiModelId } from "../types.js";

const noop = () => undefined;

interface RenderOpts {
  input?: string;
  attachments?: AiAttachment[];
  model?: AiModelId;
  voiceOn?: boolean;
  lang?: "en" | "zh";
  onInputChange?: (s: string) => void;
  onAttachFiles?: (files: File[]) => void;
  onRemoveAttachment?: (i: number) => void;
  onModelChange?: (m: AiModelId) => void;
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
      model={opts.model ?? "haiku"}
      onModelChange={opts.onModelChange ?? noop}
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

  it("CO5: opening popover + selecting Sonnet invokes onModelChange", () => {
    const onModelChange = vi.fn();
    const { container } = renderComposer({ onModelChange });
    fireEvent.click(container.querySelector(".ai-model-btn")!);
    const items = container.querySelectorAll(".popover-item");
    expect(items.length).toBe(3);
    fireEvent.click(items[1]!); // sonnet
    expect(onModelChange).toHaveBeenCalledWith("sonnet");
  });

  it("CO6: clicking .popover-scrim closes the popover", () => {
    const { container } = renderComposer();
    fireEvent.click(container.querySelector(".ai-model-btn")!);
    expect(container.querySelector(".ai-model-popover")).not.toBeNull();
    fireEvent.click(container.querySelector(".popover-scrim")!);
    expect(container.querySelector(".ai-model-popover")).toBeNull();
  });

  it("CO7: voice mic toggle calls onVoiceToggle and swaps icons", () => {
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
        model="haiku"
        onModelChange={noop}
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

  it("CO8: hidden file input exists with multiple attribute", () => {
    const { container } = renderComposer();
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    expect(fileInput?.hasAttribute("multiple")).toBe(true);
  });

  it("CO9: attachments render chips with working remove buttons", () => {
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
