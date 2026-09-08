/**
 * CardDetailDialog tests — CDD-1..CDD-8
 * Audit Top-10 #5 fix — B-23/B-29/B-32/B-34/B-36 + Map view.
 *
 * Coverage:
 *   CDD-1  open=true renders dialog in DOM
 *   CDD-2  open=false dialog not shown
 *   CDD-3  ESC (cancel event) calls onClose
 *   CDD-4  backdrop click (target === dialog) calls onClose
 *   CDD-5  Close button calls onClose
 *   CDD-6  title bilingual (EN/ZH)
 *   CDD-7  due: dueEn used when lang==="en", due when lang==="zh"
 *   CDD-8  missing optional fields omit rows (empty-state: no checklist,
 *          no labels, no members, no attach, no due) — only title + list
 *   i18n-EN and i18n-ZH string coverage included in CDD-6 + CDD-7
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CardDetailDialog } from "../CardDetailDialog.js";
import type { BoardCardData } from "@repo/plugin-web-board-core";

// ---- Stubs ------------------------------------------------------------------
// jsdom doesn't support showModal / close natively.
HTMLDialogElement.prototype.showModal = vi.fn();
HTMLDialogElement.prototype.close = vi.fn();

// ---- Fixtures ---------------------------------------------------------------

/** Full card with all optional fields populated. */
const FULL_CARD: BoardCardData = {
  id: "c-1",
  title: { en: "Design new landing page", zh: "设计新的落地页" },
  due: "5/30",
  dueEn: "May 30",
  start: "5/20",
  dueLate: false,
  labels: ["pm-forms", "pm-feedback"],
  members: ["u1", "u2"],
  checklist: { done: 3, total: 5 },
  attach: 2,
};

/** Minimal card — only required fields. */
const MINIMAL_CARD: BoardCardData = {
  id: "c-2",
  title: { en: "Quick task", zh: "快速任务" },
};

const LIST_NAME_EN = "Backlog";
const LIST_NAME_ZH = "待办";

// ---- Helpers ----------------------------------------------------------------

function renderOpen(card: BoardCardData = FULL_CARD, lang: "en" | "zh" = "en") {
  const onClose = vi.fn();
  const result = render(
    <CardDetailDialog
      open={true}
      card={card}
      listName={lang === "en" ? LIST_NAME_EN : LIST_NAME_ZH}
      lang={lang}
      onClose={onClose}
    />,
  );
  return { ...result, onClose };
}

// ---- Tests ------------------------------------------------------------------

describe("CardDetailDialog (CDD-1..CDD-8)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("CDD-1: open=true renders dialog element in DOM and calls showModal", () => {
    renderOpen();
    expect(screen.getByTestId("card-detail-dialog")).toBeInTheDocument();
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it("CDD-2: open=false — dialog is in DOM but close() is called (not showModal)", () => {
    render(
      <CardDetailDialog
        open={false}
        card={FULL_CARD}
        listName={LIST_NAME_EN}
        lang="en"
        onClose={vi.fn()}
      />,
    );
    // open=false triggers dialog.close() path
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  it("CDD-3: ESC (cancel event) calls onClose", () => {
    const { onClose } = renderOpen();
    const dialog = screen.getByTestId("card-detail-dialog");
    fireEvent(dialog, new Event("cancel", { bubbles: true, cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("CDD-4: backdrop click (target === dialog element) calls onClose", () => {
    const { onClose } = renderOpen();
    const dialog = screen.getByTestId("card-detail-dialog");
    // Simulate the click where the target is the dialog itself (backdrop)
    fireEvent.click(dialog, { target: dialog });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("CDD-5: Close button (footer) calls onClose", () => {
    const { onClose } = renderOpen();
    fireEvent.click(screen.getByTestId("cdd-close-action"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("CDD-5b: X button (header) also calls onClose", () => {
    const { onClose } = renderOpen();
    fireEvent.click(screen.getByTestId("cdd-close-btn"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("CDD-6: title is bilingual — EN renders english, ZH renders chinese", () => {
    // EN
    const { unmount } = renderOpen(FULL_CARD, "en");
    expect(screen.getByTestId("cdd-title").textContent).toBe(
      "Design new landing page",
    );
    unmount();

    // ZH
    renderOpen(FULL_CARD, "zh");
    expect(screen.getByTestId("cdd-title").textContent).toBe("设计新的落地页");
  });

  it("CDD-7: due date — dueEn shown when lang=en, due shown when lang=zh", () => {
    // lang=en → dueEn
    const { unmount } = renderOpen(FULL_CARD, "en");
    expect(screen.getByTestId("cdd-due-value").textContent).toContain("May 30");
    unmount();

    // lang=zh → due (the Chinese date string)
    renderOpen(FULL_CARD, "zh");
    expect(screen.getByTestId("cdd-due-value").textContent).toContain("5/30");
  });

  it("CDD-8: missing optional fields → those rows absent from DOM", () => {
    renderOpen(MINIMAL_CARD);
    // Minimal card: no due, no start, no labels, no members, no checklist, no attach
    expect(screen.queryByTestId("cdd-due-row")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cdd-start-row")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cdd-labels-row")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cdd-members-row")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cdd-checklist-row")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cdd-attach-row")).not.toBeInTheDocument();
    // But title and list row ARE present
    expect(screen.getByTestId("cdd-title")).toBeInTheDocument();
    expect(screen.getByTestId("cdd-list-row")).toBeInTheDocument();
  });

  it("CDD-labels: labels resolved via PM_LABELS and rendered as chips", () => {
    renderOpen(FULL_CARD, "en");
    expect(screen.getByTestId("cdd-labels-row")).toBeInTheDocument();
    // pm-forms and pm-feedback are in PM_LABELS
    expect(screen.getByTestId("cdd-label-pm-forms")).toBeInTheDocument();
    expect(screen.getByTestId("cdd-label-pm-feedback")).toBeInTheDocument();
    expect(screen.getByTestId("cdd-label-pm-forms").textContent).toBe("Forms");
    expect(screen.getByTestId("cdd-label-pm-feedback").textContent).toBe("Feedback");
  });

  it("CDD-labels-zh: label names are bilingual — zh shows chinese label names", () => {
    renderOpen(FULL_CARD, "zh");
    expect(screen.getByTestId("cdd-label-pm-forms").textContent).toBe("表单");
    expect(screen.getByTestId("cdd-label-pm-feedback").textContent).toBe("反馈");
  });

  it("CDD-members: members resolved via MOCK_MEMBERS and rendered", () => {
    renderOpen(FULL_CARD, "en");
    expect(screen.getByTestId("cdd-members-row")).toBeInTheDocument();
    expect(screen.getByTestId("cdd-member-u1")).toBeInTheDocument();
    expect(screen.getByTestId("cdd-member-u2")).toBeInTheDocument();
    expect(screen.getByTestId("cdd-member-u1").textContent).toBe("Alice");
    expect(screen.getByTestId("cdd-member-u2").textContent).toBe("Bob");
  });

  it("CDD-checklist: renders done/total (pct%) from checklist field", () => {
    renderOpen(FULL_CARD);
    const row = screen.getByTestId("cdd-checklist-value");
    expect(row.textContent).toContain("3/5");
    expect(row.textContent).toContain("60%");
  });

  it("CDD-attach: renders attach count from attach field", () => {
    renderOpen(FULL_CARD);
    expect(screen.getByTestId("cdd-attach-value").textContent).toBe("2");
  });

  it("CDD-dueLate: dueLate badge shown when card.dueLate is true", () => {
    const lateCard: BoardCardData = {
      ...FULL_CARD,
      dueLate: true,
    };
    renderOpen(lateCard);
    expect(screen.getByTestId("cdd-late-badge")).toBeInTheDocument();
  });

  it("CDD-null-card: null card renders empty dialog body (no crash)", () => {
    render(
      <CardDetailDialog
        open={true}
        card={null}
        listName=""
        lang="en"
        onClose={vi.fn()}
      />,
    );
    // Dialog exists but no content rows
    expect(screen.getByTestId("card-detail-dialog")).toBeInTheDocument();
    expect(screen.queryByTestId("cdd-title")).not.toBeInTheDocument();
  });
});
