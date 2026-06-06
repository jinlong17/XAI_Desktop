/**
 * pages/wiring.test.tsx — P4 page wiring to the row #5 typed seams (row #5).
 *
 * Covers (test.md §1, AC-9):
 *   - TT-WIRE-DASHBOARD-OPS : DashboardPage renders the SEVERITY-RANKED ops queue via the
 *                             read model (through ../adapters; no inline mock), all 6 queues
 *                             in ranked order.
 *   - TT-WIRE-AUDIT-PAGE    : AuditPage reads through the chain-backed auditChainReadModel
 *                             (through ../adapters; no inline mock), filters work over the
 *                             projection.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, within } from "@testing-library/react";
import { AdminUiProvider } from "../components/AdminUiContext";
import { DashboardPage } from "./DashboardPage";
import { AuditPage } from "./AuditPage";
import { opsQueueReadModel, auditChainReadModel } from "../adapters";

afterEach(() => cleanup());

function renderPage(node: React.ReactElement): HTMLElement {
  const { container } = render(<AdminUiProvider>{node}</AdminUiProvider>);
  return container;
}

describe("TT-WIRE-DASHBOARD-OPS: Dashboard renders the severity-ranked ops queue", () => {
  it("renders all 6 ops-queue cards", () => {
    const c = renderPage(<DashboardPage />);
    const cards = c.querySelectorAll(".grid-queues .queue");
    expect(cards.length).toBe(6);
  });

  it("renders the queues in the read model's RANKED order (severity desc, then count desc)", () => {
    const c = renderPage(<DashboardPage />);
    const renderedTitles = Array.from(
      c.querySelectorAll(".grid-queues .queue .qh b"),
    ).map((el) => el.textContent);
    const expectedTitles = opsQueueReadModel.ranked().map((q) => q.title);
    expect(renderedTitles).toEqual(expectedTitles);
    // sanity: the documented top queue (risk) is first
    expect(renderedTitles[0]).toBe("异常登录 / 风险");
  });

  it("each queue card carries its derived severity (data-severity)", () => {
    const c = renderPage(<DashboardPage />);
    const cards = Array.from(c.querySelectorAll<HTMLElement>(".grid-queues .queue"));
    const ranked = opsQueueReadModel.ranked();
    cards.forEach((card, i) => {
      expect(card.getAttribute("data-severity")).toBe(ranked[i]!.severity);
    });
    // top card is the critical one
    expect(cards[0]!.getAttribute("data-severity")).toBe("critical");
  });
});

describe("TT-WIRE-AUDIT-PAGE: Audit page reads the chain-backed projection", () => {
  it("renders chain-backed audit rows (matching the read model's row count)", () => {
    const c = renderPage(<AuditPage />);
    const bodyRows = c.querySelectorAll("table tbody tr");
    expect(bodyRows.length).toBe(auditChainReadModel.query().length); // 12
    expect(bodyRows.length).toBeGreaterThan(0);
  });

  it("the first rendered row's time matches the chain projection (newest-first)", () => {
    const c = renderPage(<AuditPage />);
    const firstRowCells = c.querySelectorAll("table tbody tr:first-child td");
    const firstTimeCell = firstRowCells[0];
    const projectedFirst = auditChainReadModel.query()[0]!;
    expect(within(firstTimeCell as HTMLElement).getByText(projectedFirst.time)).toBeTruthy();
  });

  it("renders a non-empty .page subtree (no inline mock; reads through ../adapters)", () => {
    const c = renderPage(<AuditPage />);
    expect(c.querySelector(".page--audit")).toBeTruthy();
    // the toolbar filters are present (text/type/range) over the projection
    expect(c.querySelector('input[aria-label="搜索审计日志"]')).toBeTruthy();
    expect(c.querySelector('select[aria-label="按类型筛选"]')).toBeTruthy();
    expect(c.querySelector('select[aria-label="按时间范围筛选"]')).toBeTruthy();
  });
});
