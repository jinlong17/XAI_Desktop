/**
 * ConfirmationCard.test.tsx — CC-1..CC-3
 *
 * Tests ConfirmationCard rendering and handler invocation.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 CC tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmationCard } from "../ConfirmationCard.js";

const SPEC = {
  label: "Create task",
  description: '"Buy groceries" in Next 7 Days',
};

describe("CC-1: renders label and description", () => {
  it("shows the label and description text", () => {
    render(
      <ConfirmationCard
        spec={SPEC}
        lang="en"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("Create task")).toBeDefined();
    expect(screen.getByText('"Buy groceries" in Next 7 Days')).toBeDefined();
  });
});

describe("CC-2: Confirm button calls onConfirm", () => {
  it("clicking Confirm invokes onConfirm once", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmationCard
        spec={SPEC}
        lang="en"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    const confirmBtn = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe("CC-3: Cancel button calls onCancel", () => {
  it("clicking Cancel invokes onCancel once", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmationCard
        spec={SPEC}
        lang="en"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
