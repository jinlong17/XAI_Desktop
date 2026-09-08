/**
 * PaletteResultRow — PR1..PR4 (includes XSS rendered-DOM assertion)
 * test.md §3 P3
 */
import { it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaletteResultRow } from "../PaletteResultRow.js";
import type { SearchHit } from "../types.js";

const makeHit = (overrides?: Partial<SearchHit>): SearchHit => ({
  id: "tasks:card-1",
  moduleId: "tasks",
  kind: "entity",
  entityId: "card-1",
  label: { en: "Buy groceries", zh: "买食物" },
  score: 80,
  ...overrides,
});

beforeEach(() => {
  // No cleanup needed beyond vitest.setup.ts
});

it("PR1 — renders label per current lang (EN)", () => {
  render(
    <PaletteResultRow
      hit={makeHit()}
      isActive={false}
      query=""
      lang="en"
      index={0}
      onSelect={vi.fn()}
    />,
  );
  expect(screen.getByText("Buy groceries")).toBeTruthy();
});

it("PR1b — renders label per current lang (ZH)", () => {
  render(
    <PaletteResultRow
      hit={makeHit()}
      isActive={false}
      query=""
      lang="zh"
      index={0}
      onSelect={vi.fn()}
    />,
  );
  expect(screen.getByText("买食物")).toBeTruthy();
});

it("PR2 — sub-label rendered when present", () => {
  const hit = makeHit({ sub: { en: "Due: Friday", zh: "周五到期" } });
  render(
    <PaletteResultRow
      hit={hit}
      isActive={false}
      query=""
      lang="en"
      index={0}
      onSelect={vi.fn()}
    />,
  );
  expect(screen.getByText("Due: Friday")).toBeTruthy();
});

it("PR3 — XSS payload in label renders as text (no executable script in DOM)", () => {
  const hit = makeHit({
    label: { en: "<script>alert(1)</script>", zh: "<script>alert(1)</script>" },
  });
  const { container } = render(
    <PaletteResultRow
      hit={hit}
      isActive={false}
      query=""
      lang="en"
      index={0}
      onSelect={vi.fn()}
    />,
  );
  // No <script> element should be in the DOM
  expect(container.querySelector("script")).toBeNull();
  // The text should be escaped (not rendered as live HTML)
  const labelEl = container.querySelector(".cmdk-row-label");
  expect(labelEl?.innerHTML).toContain("&lt;script&gt;");
});

it("PR4 — XSS payload via query (search highlight wrap) renders as text", () => {
  const hit = makeHit({ label: { en: "Normal title", zh: "正常标题" } });
  const xssQuery = "<script>alert(1)</script>";
  const { container } = render(
    <PaletteResultRow
      hit={hit}
      isActive={false}
      query={xssQuery}
      lang="en"
      index={0}
      onSelect={vi.fn()}
    />,
  );
  // No <script> element should be in the DOM
  expect(container.querySelector("script")).toBeNull();
  // highlightMatch escapes the query before using it in regex
  const labelEl = container.querySelector(".cmdk-row-label");
  expect(labelEl?.innerHTML).not.toContain("<script>");
});
