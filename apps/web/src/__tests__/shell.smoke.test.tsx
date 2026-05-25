/**
 * Cross-package shell smoke tests — A1..A4
 *
 * A1: /app route mounts App (which mounts Shell) and renders TopBar
 * A2: StrictMode double-mount does not throw
 * A3: usePref keys are read and apply* effects fire
 * A4: Shell renders with module content via Outlet
 *
 * These tests exercise the real App.tsx + @repo/xai-web-shell in a MemoryRouter.
 */

import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { StrictMode } from "react";
import { MemoryRouter, Routes, Route } from "react-router";
import { App } from "../App";

afterEach(() => cleanup());

// Mock external packages that have side effects
vi.mock("@repo/xai-web-event-bus", () => ({
  emitWebEvent: vi.fn(),
  onWebEvent: vi.fn(() => () => {}),
  useWebEventListener: vi.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.removeAttribute("data-rail-pos");
  document.documentElement.removeAttribute("data-bg-tone");
  document.documentElement.style.cssText = "";
  vi.clearAllMocks();
});

describe("Shell cross-package smoke (A1..A4)", () => {
  it("A1 — App renders Shell with Topbar (search button present, xai-web-cmdk P4)", () => {
    render(
      <MemoryRouter initialEntries={["/app/dashboard"]}>
        <Routes>
          <Route path="/app/*" element={<App />}>
            <Route path=":moduleId/*" element={<div data-testid="module-content">module</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    // xai-web-cmdk P4: App passes onOpenSearch, so Topbar renders a <button> (not readOnly input).
    const btn = screen.getByRole("button", { name: "Search tasks, habits, notes…" });
    expect(btn).toBeTruthy();
  });

  it("A1b — App renders AppRail (aside.app-rail present)", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/app/dashboard"]}>
        <Routes>
          <Route path="/app/*" element={<App />}>
            <Route path=":moduleId/*" element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(container.querySelector("aside.app-rail")).not.toBeNull();
  });

  it("A2 — StrictMode double-mount does not throw", () => {
    expect(() =>
      render(
        <StrictMode>
          <MemoryRouter initialEntries={["/app/dashboard"]}>
            <Routes>
              <Route path="/app/*" element={<App />}>
                <Route path=":moduleId/*" element={<div />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </StrictMode>
      )
    ).not.toThrow();
  });

  it("A3 — App applies default theme on mount (data-theme is set)", () => {
    render(
      <MemoryRouter initialEntries={["/app/dashboard"]}>
        <Routes>
          <Route path="/app/*" element={<App />}>
            <Route path=":moduleId/*" element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    // applyTheme("light") should have set data-theme="light"
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("A4 — App renders without crash when no child route matches", () => {
    expect(() =>
      render(
        <MemoryRouter initialEntries={["/app"]}>
          <Routes>
            <Route path="/app/*" element={<App />} />
          </Routes>
        </MemoryRouter>
      )
    ).not.toThrow();
  });
});
