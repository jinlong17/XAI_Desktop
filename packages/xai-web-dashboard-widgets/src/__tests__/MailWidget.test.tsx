import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { MailWidget } from "../widgets/MailWidget.js";
import { MAILS } from "../internal/fixtures.js";

describe("MailWidget", () => {
  it("AC-MAIL-1: renders 4 mail rows", () => {
    const { container } = render(<MailWidget lang="en" />);
    expect(container.querySelectorAll(".mail-row")).toHaveLength(4);
  });

  it("AC-MAIL-2: unread rows carry .unread + .mail-dot, badge shows count", () => {
    const { container } = render(<MailWidget lang="en" />);
    const unread = container.querySelectorAll(".mail-row.unread");
    const expectedUnread = MAILS.filter((m) => m.unread).length;
    expect(unread).toHaveLength(expectedUnread);
    expect(container.querySelectorAll(".mail-dot")).toHaveLength(expectedUnread);
    expect(container.querySelector("[data-mail-badge]")?.textContent).toBe(
      expectedUnread.toString(),
    );
  });

  it("AC-MAIL-3: zh renders zh subj", () => {
    const { container } = render(<MailWidget lang="zh" />);
    const subjs = Array.from(container.querySelectorAll(".mail-subj")).map((s) => s.textContent);
    expect(subjs).toEqual(MAILS.map((m) => m.subj.zh));
  });

  it("AC-MAIL-3: en renders en subj", () => {
    const { container } = render(<MailWidget lang="en" />);
    const subjs = Array.from(container.querySelectorAll(".mail-subj")).map((s) => s.textContent);
    expect(subjs).toEqual(MAILS.map((m) => m.subj.en));
  });
});
