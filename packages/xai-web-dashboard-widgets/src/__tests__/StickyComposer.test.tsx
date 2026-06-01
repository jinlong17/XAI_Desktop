/**
 * StickyComposer tests — AC-COMPOSER-1..9
 *
 * Tests the native <dialog> flow: open/close/save/validation/a11y + bilingual STR parity.
 * jsdom does not implement showModal()/close() natively; we rely on the element
 * having the "open" attribute after mocking.
 */
import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StickyComposer } from "../StickyComposer.js";
import { STR_STICKY_COMPOSER } from "../internal/strings.js";

// jsdom stubs for HTMLDialogElement
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
    };
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

const noop = () => undefined;

describe("AC-COMPOSER-1: dialog renders when open=true", () => {
  it("dialog element has open attribute when open=true", () => {
    const { container } = render(
      <StickyComposer open={true} lang="en" onSave={noop} onClose={noop} />,
    );
    const dialog = container.querySelector("dialog");
    expect(dialog).not.toBeNull();
    expect(dialog!.hasAttribute("open")).toBe(true);
  });
});

describe("AC-COMPOSER-2: dialog closes when open=false", () => {
  it("dialog does not have open attribute when open=false", () => {
    const { container } = render(
      <StickyComposer open={false} lang="en" onSave={noop} onClose={noop} />,
    );
    const dialog = container.querySelector("dialog");
    expect(dialog!.hasAttribute("open")).toBe(false);
  });
});

describe("AC-COMPOSER-3: Cancel button calls onClose", () => {
  it("clicking Cancel fires onClose", () => {
    const onClose = vi.fn();
    render(<StickyComposer open={true} lang="en" onSave={noop} onClose={onClose} />);
    fireEvent.click(screen.getByText(STR_STICKY_COMPOSER.btn_cancel.en));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("AC-COMPOSER-4: Save with empty text shows error, does not call onSave", () => {
  it("empty textarea → error shown, onSave not called", () => {
    const onSave = vi.fn();
    const { container } = render(
      <StickyComposer open={true} lang="en" onSave={onSave} onClose={noop} />,
    );
    fireEvent.click(screen.getByText(STR_STICKY_COMPOSER.btn_save.en));
    expect(onSave).not.toHaveBeenCalled();
    expect(container.querySelector("#sticky-composer-err")).not.toBeNull();
  });
});

describe("AC-COMPOSER-5: Save with valid text calls onSave with trimmed draft", () => {
  it("filled textarea → onSave called with trimmed text and selected color", () => {
    const onSave = vi.fn();
    render(<StickyComposer open={true} lang="en" onSave={onSave} onClose={noop} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "  hello  " } });
    fireEvent.click(screen.getByText(STR_STICKY_COMPOSER.btn_save.en));
    expect(onSave).toHaveBeenCalledWith({ text: "hello", color: "sun" });
  });
});

describe("AC-COMPOSER-6: color radiogroup defaults to sun, switches on click", () => {
  it("sun chip is aria-checked=true initially; clicking mint switches selection", () => {
    render(<StickyComposer open={true} lang="en" onSave={noop} onClose={noop} />);
    const chips = screen.getAllByRole("radio");
    expect(chips).toHaveLength(5);
    // sun is first, aria-checked=true
    expect(chips[0]!.getAttribute("aria-checked")).toBe("true");
    // click mint (second)
    fireEvent.click(chips[1]!);
    expect(chips[1]!.getAttribute("aria-checked")).toBe("true");
    expect(chips[0]!.getAttribute("aria-checked")).toBe("false");
  });
});

describe("AC-COMPOSER-7: a11y — aria-modal + aria-labelledby", () => {
  it("dialog has aria-modal=true and correct labelledby", () => {
    const { container } = render(
      <StickyComposer open={true} lang="en" onSave={noop} onClose={noop} />,
    );
    const dialog = container.querySelector("dialog");
    expect(dialog!.getAttribute("aria-modal")).toBe("true");
    expect(dialog!.getAttribute("aria-labelledby")).toBe("sticky-composer-title");
    expect(container.querySelector("#sticky-composer-title")).not.toBeNull();
  });
});

describe("AC-COMPOSER-8: form resets when open changes to true again", () => {
  it("closing and reopening clears the text field", () => {
    const { rerender } = render(
      <StickyComposer open={true} lang="en" onSave={noop} onClose={noop} />,
    );
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "dirty" } });
    expect(textarea.value).toBe("dirty");

    // Close then reopen
    rerender(<StickyComposer open={false} lang="en" onSave={noop} onClose={noop} />);
    rerender(<StickyComposer open={true} lang="en" onSave={noop} onClose={noop} />);
    const textarea2 = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea2.value).toBe("");
  });
});

describe("AC-COMPOSER-9: bilingual STR parity — all keys present in both en and zh", () => {
  it("every key in STR_STICKY_COMPOSER has en and zh strings", () => {
    const entries = Object.entries(STR_STICKY_COMPOSER) as [
      string,
      { en: string; zh: string },
    ][];
    for (const [key, val] of entries) {
      expect(typeof val.en, `${key}.en`).toBe("string");
      expect(val.en.length, `${key}.en non-empty`).toBeGreaterThan(0);
      expect(typeof val.zh, `${key}.zh`).toBe("string");
      expect(val.zh.length, `${key}.zh non-empty`).toBeGreaterThan(0);
    }
  });

  it("zh labels render correctly", () => {
    render(<StickyComposer open={true} lang="zh" onSave={noop} onClose={noop} />);
    expect(screen.getByText(STR_STICKY_COMPOSER.title.zh)).toBeTruthy();
    expect(screen.getByText(STR_STICKY_COMPOSER.btn_cancel.zh)).toBeTruthy();
    expect(screen.getByText(STR_STICKY_COMPOSER.btn_save.zh)).toBeTruthy();
  });
});
