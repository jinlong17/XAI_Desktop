/**
 * IP1..IP10 — InboxPanel component.
 */

import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import type { InboxCardShape } from "../internal/types.js";
import { InboxPanel } from "../InboxPanel.js";

function Harness({
  initial,
  lang,
}: {
  initial: InboxCardShape[];
  lang: "en" | "zh";
}) {
  const [cards, setCards] = useState<InboxCardShape[]>(initial);
  return (
    <InboxPanel
      cards={cards}
      setCards={(updater) => setCards((prev) => updater(prev))}
      lang={lang}
    />
  );
}

describe("InboxPanel (IP1..IP10)", () => {
  it("IP1: renders header + count + composer + body", () => {
    render(<Harness initial={[]} lang="en" />);
    expect(screen.getByTestId("inbox-panel")).toBeInTheDocument();
    expect(screen.getByTestId("inbox-composer-input")).toBeInTheDocument();
  });

  it("IP2: bilingual 'Inbox' / '收件箱'", () => {
    const { unmount } = render(<Harness initial={[]} lang="en" />);
    expect(screen.getByText("Inbox")).toBeInTheDocument();
    unmount();
    render(<Harness initial={[]} lang="zh" />);
    expect(screen.getByText("收件箱")).toBeInTheDocument();
  });

  it("IP3: Enter prepends new card; clears input", () => {
    render(<Harness initial={[]} lang="en" />);
    const input = screen.getByTestId("inbox-composer-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(input.value).toBe("");
  });

  it("IP4: empty Enter does nothing", () => {
    render(<Harness initial={[]} lang="en" />);
    const input = screen.getByTestId("inbox-composer-input");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("Inbox is empty")).toBeInTheDocument();
  });

  it("IP5: renders card text[lang]", () => {
    render(
      <Harness
        initial={[{ id: "x", text: { en: "EnText", zh: "中文" } }]}
        lang="zh"
      />,
    );
    expect(screen.getByText("中文")).toBeInTheDocument();
  });

  it("IP6: remove button filters out", () => {
    render(
      <Harness
        initial={[
          { id: "x1", text: { en: "first", zh: "一" } },
          { id: "x2", text: { en: "second", zh: "二" } },
        ]}
        lang="en"
      />,
    );
    fireEvent.click(screen.getByTestId("inbox-remove-x1"));
    expect(screen.queryByText("first")).not.toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });

  it("IP7: empty state when cards.length === 0", () => {
    render(<Harness initial={[]} lang="en" />);
    expect(screen.getByText("Inbox is empty")).toBeInTheDocument();
  });

  it("IP8: bilingual empty state", () => {
    const { unmount } = render(<Harness initial={[]} lang="en" />);
    expect(screen.getByText("Inbox is empty")).toBeInTheDocument();
    unmount();
    render(<Harness initial={[]} lang="zh" />);
    expect(screen.getByText("收件箱为空")).toBeInTheDocument();
  });

  it("IP9: multiple adds prepend in newest-first order", () => {
    render(<Harness initial={[]} lang="en" />);
    const input = screen.getByTestId("inbox-composer-input");
    fireEvent.change(input, { target: { value: "first" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.change(input, { target: { value: "second" } });
    fireEvent.keyDown(input, { key: "Enter" });
    const texts = Array.from(document.querySelectorAll(".ix-text")).map(
      (el) => el.textContent,
    );
    expect(texts).toEqual(["second", "first"]);
  });

  it("IP10: card text falls back to text.en when text[lang] is empty string", () => {
    render(
      <Harness initial={[{ id: "x", text: { en: "fallback", zh: "" } }]} lang="zh" />,
    );
    expect(screen.getByText("fallback")).toBeInTheDocument();
  });

  it("count badge updates on add", () => {
    render(<Harness initial={[]} lang="en" />);
    const input = screen.getByTestId("inbox-composer-input");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.keyDown(input, { key: "Enter" });
    // The count is the 1 next to Inbox + count badge
    const panel = screen.getByTestId("inbox-panel");
    expect(panel.querySelector(".col-count")?.textContent).toBe("1");
  });

  it("mock test to flush vi import", () => {
    expect(vi).toBeDefined();
  });
});
