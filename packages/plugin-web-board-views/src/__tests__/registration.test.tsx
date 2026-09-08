/**
 * Registration tests (RG1..RG4)
 *
 * Verifies the boardViewsWebModuleRegistration shape.
 *
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 * Test plan: packages/xai-web-board-views/docs/test.md §2.11
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { boardViewsWebModuleRegistration } from "../registration.js";

// Mock useWebShell so the render route function doesn't require a WebShellProvider
vi.mock("@repo/xai-web-shell", async () => {
  const actual = await vi.importActual<typeof import("@repo/xai-web-shell")>(
    "@repo/xai-web-shell",
  );
  return {
    ...actual,
    useWebShell: () => ({ lang: "en" }),
  };
});

describe("boardViewsWebModuleRegistration", () => {
  it("RG1: has all required WebModuleSlotRegistration fields", () => {
    const reg = boardViewsWebModuleRegistration;
    expect(reg.moduleId).toBeDefined();
    expect(reg.label).toBeDefined();
    expect(reg.defaultChildPath).toBeDefined();
    expect(reg.children).toBeDefined();
    expect(reg.icon).toBeDefined();
    expect(reg.railOrder).toBeDefined();
    expect(reg.i18nKey).toBeDefined();
    expect(typeof reg.showInRail).toBe("boolean");
  });

  it("RG2: children includes path='' and path='*' entries", () => {
    const { children } = boardViewsWebModuleRegistration;
    expect(children.length).toBe(2);
    const paths = children.map((c) => c.path);
    expect(paths).toContain("");
    expect(paths).toContain("*");
    // Each child has a render function
    children.forEach((c) => {
      expect(typeof c.render).toBe("function");
    });
  });

  it("RG3: render returns JSX that includes BoardModule (reads lang from useWebShell)", () => {
    const child = boardViewsWebModuleRegistration.children[0];
    // The render function should produce React element containing BoardModule
    const RenderFn = child!.render as React.FC;
    const { container } = render(<RenderFn />);
    // BoardModule renders the board-views-module wrapper
    const boardMod = container.querySelector('[data-testid="board-views-module"]');
    expect(boardMod).not.toBeNull();
  });

  it("RG4: showInRail=true, i18nKey='nav.board', moduleId='board', railOrder=3, icon='kanban'", () => {
    const reg = boardViewsWebModuleRegistration;
    expect(reg.showInRail).toBe(true);
    expect(reg.i18nKey).toBe("nav.board");
    expect(reg.moduleId).toBe("board");
    expect(reg.railOrder).toBe(3);
    expect(reg.icon).toBe("kanban");
  });
});
