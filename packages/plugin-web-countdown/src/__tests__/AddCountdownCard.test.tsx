/**
 * AddCountdownCard.test.tsx — Tests A1..A3
 *
 * A1: renders "Add Countdown" (en) / "新建倒计时" (zh)
 * A2: click fires onClick
 * A3: receives focus on Tab (focusable)
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AddCountdownCard } from "../AddCountdownCard.js";

describe("AddCountdownCard", () => {
  it("A1a: renders 'Add Countdown' in English", () => {
    render(<AddCountdownCard lang="en" />);
    expect(screen.getByText("Add Countdown")).toBeInTheDocument();
  });

  it("A1b: renders '新建倒计时' in Chinese", () => {
    render(<AddCountdownCard lang="zh" />);
    expect(screen.getByText("新建倒计时")).toBeInTheDocument();
  });

  it("A2: click fires onClick handler", () => {
    const onClick = vi.fn();
    render(<AddCountdownCard lang="en" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("A3: button is focusable (type=button)", () => {
    render(<AddCountdownCard lang="en" />);
    const btn = screen.getByRole("button");
    expect(btn.tagName).toBe("BUTTON");
    // Buttons are natively focusable — check tabIndex is not -1
    expect(btn).not.toHaveAttribute("tabindex", "-1");
  });
});
