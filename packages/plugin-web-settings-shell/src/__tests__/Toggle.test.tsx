import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toggle } from "../index.js";

/**
 * TG1..TG4 — Toggle atom.
 */
describe("<Toggle>", () => {
  it("TG1: on=false renders aria-checked=false and no `on` class", () => {
    render(<Toggle on={false} onChange={() => {}} />);
    const btn = screen.getByRole("switch");
    expect(btn).toHaveAttribute("aria-checked", "false");
    expect(btn.className).not.toMatch(/\bon\b/);
  });

  it("TG2: on=true renders aria-checked=true and `on` class", () => {
    render(<Toggle on={true} onChange={() => {}} />);
    const btn = screen.getByRole("switch");
    expect(btn).toHaveAttribute("aria-checked", "true");
    expect(btn.className).toMatch(/\bon\b/);
  });

  it("TG3: click invokes onChange once with no args", () => {
    const onChange = vi.fn();
    render(<Toggle on={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith();
  });

  it("TG4: role=switch is present (a11y)", () => {
    render(<Toggle on={false} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });
});
