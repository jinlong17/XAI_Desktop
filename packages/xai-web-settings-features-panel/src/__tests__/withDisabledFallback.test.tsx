/**
 * AC-WRAP-1..AC-WRAP-4 (test.md §A5).
 */
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { setPref } from "@repo/plugin-web-storage";
import type {
  WebModuleSlotRegistration,
} from "@repo/xai-web-shell";
import { WebShellProvider } from "@repo/xai-web-shell";
import type { WebModuleRouteProps } from "@repo/core/types";
import { withDisabledFallback } from "../withDisabledFallback.js";

// Minimal WebModuleRouteProps stub — child render only uses props passively
// (we override its behavior via the disabled guard).
const ROUTE_PROPS = {
  moduleId: "board",
  childPath: "",
  capabilities: {} as never,
} as unknown as WebModuleRouteProps;

function RealBoard(): React.ReactElement {
  return <div data-testid="real-board">REAL BOARD</div>;
}
function RealBoard2(): React.ReactElement {
  return <div data-testid="real-board-2">REAL BOARD 2</div>;
}

function makeReg(): WebModuleSlotRegistration {
  return {
    moduleId: "board",
    label: "Boards",
    defaultChildPath: "",
    children: [
      { path: "", render: RealBoard },
      { path: "*", render: RealBoard2 },
    ],
    icon: "kanban",
    railOrder: 3,
    i18nKey: "nav.board",
    showInRail: true,
  };
}

function renderInShell(node: React.ReactElement) {
  return render(
    <WebShellProvider
      modules={[]}
      lang="en"
      railPos="left"
      petOn={false}
      setPetOn={() => {}}
    >
      {node}
    </WebShellProvider>,
  );
}

describe("withDisabledFallback", () => {
  it("AC-WRAP-1: when pref is true (default), original render is invoked", () => {
    const wrapped = withDisabledFallback(makeReg(), "board");
    const FirstChild = wrapped.children[0]!.render;
    const { getByTestId } = renderInShell(<FirstChild {...ROUTE_PROPS} />);
    expect(getByTestId("real-board")).toHaveTextContent("REAL BOARD");
  });

  it("AC-WRAP-2: when pref is false, every child path renders DisabledFeatureFallback", () => {
    setPref("xai_pref_features_board", false);
    const wrapped = withDisabledFallback(makeReg(), "board");
    const FirstChild = wrapped.children[0]!.render;
    const SecondChild = wrapped.children[1]!.render;
    const a = renderInShell(<FirstChild {...ROUTE_PROPS} />);
    expect(a.queryByTestId("real-board")).toBeNull();
    expect(a.container.querySelector(".disabled-feature-fallback")).not.toBeNull();
    a.unmount();
    const b = renderInShell(<SecondChild {...ROUTE_PROPS} />);
    expect(b.queryByTestId("real-board-2")).toBeNull();
    expect(b.container.querySelector(".disabled-feature-fallback")).not.toBeNull();
  });

  it("AC-WRAP-3: top-level metadata is preserved 1:1", () => {
    const base = makeReg();
    const wrapped = withDisabledFallback(base, "board");
    expect(wrapped.moduleId).toBe(base.moduleId);
    expect(wrapped.label).toBe(base.label);
    expect(wrapped.icon).toBe(base.icon);
    expect(wrapped.railOrder).toBe(base.railOrder);
    expect(wrapped.i18nKey).toBe(base.i18nKey);
    expect(wrapped.showInRail).toBe(base.showInRail);
    expect(wrapped.children.length).toBe(base.children.length);
    expect(wrapped.children.map((c) => c.path)).toEqual(
      base.children.map((c) => c.path),
    );
  });

  it("AC-WRAP-4: wrapping twice is idempotent in behavior", () => {
    setPref("xai_pref_features_board", false);
    const once = withDisabledFallback(makeReg(), "board");
    const twice = withDisabledFallback(once, "board");
    const Child = twice.children[0]!.render;
    const { container, queryByTestId } = renderInShell(<Child {...ROUTE_PROPS} />);
    expect(queryByTestId("real-board")).toBeNull();
    expect(container.querySelector(".disabled-feature-fallback")).not.toBeNull();
  });
});
