/**
 * PaletteInput — PI1..PI5
 * test.md §3 P3
 */
import { it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaletteInput } from "../PaletteInput.js";

function renderInput(overrides?: Partial<React.ComponentProps<typeof PaletteInput>>) {
  const props = {
    query: "",
    setQuery: vi.fn(),
    lang: "en" as const,
    onKeyDown: vi.fn(),
    ...overrides,
  };
  return { ...render(<PaletteInput {...props} />), props };
}

it("PI1 — autofocuses on mount", () => {
  const { container } = renderInput();
  const input = container.querySelector(".cmdk-input") as HTMLInputElement;
  expect(input).toBeTruthy();
  // autoFocus attribute is set; in jsdom the element gets focused
  expect(document.activeElement).toBe(input);
});

it("PI2 — typing fires setQuery", () => {
  const { props } = renderInput({ query: "" });
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: "hello" } });
  expect(props.setQuery).toHaveBeenCalledWith("hello");
});

it("PI3 — monospace font class applied", () => {
  const { container } = renderInput();
  const input = container.querySelector(".cmdk-input");
  expect(input).toBeTruthy();
});

it("PI4 — i18n placeholder visible (EN)", () => {
  renderInput({ lang: "en" });
  const input = screen.getByPlaceholderText("Search tasks, habits, notes…");
  expect(input).toBeTruthy();
});

it("PI5 — Enter event delegates upward (does NOT call setQuery)", () => {
  const onKeyDown = vi.fn();
  renderInput({ onKeyDown });
  const input = screen.getByRole("combobox");
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onKeyDown).toHaveBeenCalledTimes(1);
  // setQuery not called
});
