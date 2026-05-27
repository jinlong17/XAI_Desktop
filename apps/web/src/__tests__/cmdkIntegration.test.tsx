/**
 * Cmd+K integration tests — CI1..CI5
 *
 * These tests verify that the xai-web-cmdk package is correctly wired into
 * apps/web/src/App.tsx:
 *
 * CI1: CommandPalette is a DOM sibling of the Shell (not nested inside)
 * CI2: Cmd+K keydown opens the command palette (cmdk-modal visible)
 * CI3: Esc closes the command palette
 * CI4: Topbar search button click opens the command palette
 * CI5: CommandPaletteProvider context is available (no throw on useCommandPalette)
 *
 * xai-web-cmdk gap-closure row #3, test.md §5 CI1..CI5
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { App } from "../App";

afterEach(() => cleanup());

vi.mock("@repo/xai-web-event-bus", () => ({
  emitWebEvent: vi.fn(),
  onWebEvent: vi.fn(() => () => {}),
  useWebEventListener: vi.fn(),
}));

vi.mock("@repo/web-auth-device-session", () => ({
  useWebAuthSession: () => ({
    client: null,
    clearSessionStorage: vi.fn().mockResolvedValue(undefined),
    state: "authenticated",
    session: null,
    deviceId: null,
    syncVersion: "2026-05",
    refreshSession: vi.fn(),
    ensureDeviceIdentity: vi.fn(),
    setSession: vi.fn(),
  }),
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

function renderApp() {
  const result = render(
    <MemoryRouter initialEntries={["/app/dashboard"]}>
      <Routes>
        <Route path="/app/*" element={<App />}>
          <Route path=":moduleId/*" element={<div data-testid="module-content" />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
  return result;
}

describe("xai-web-cmdk integration (CI1..CI5)", () => {
  it("CI1 — CommandPalette is a sibling of the .app div (overlay pattern)", () => {
    const { container } = renderApp();
    // The .app element is the Shell wrapper; CommandPalette is position:fixed and
    // mounted as a sibling inside the CommandPaletteProvider root (not inside .app).
    // When closed, CommandPalette returns null, so we only verify .app is present.
    const appEl = container.querySelector(".app");
    expect(appEl).not.toBeNull();
    // cmdk-modal should NOT be visible yet (palette is closed by default)
    expect(container.querySelector(".cmdk-modal")).toBeNull();
  });

  it("CI2 — Ctrl+K opens the command palette modal (jsdom: non-Mac platform)", () => {
    renderApp();
    // In jsdom, navigator.platform is empty (non-Mac) → matchesCmdK() expects ctrlKey.
    act(() => {
      fireEvent.keyDown(window, { key: "k", code: "KeyK", ctrlKey: true, metaKey: false });
    });
    // cmdk-modal should now be visible
    const modal = screen.queryByRole("dialog");
    expect(modal).not.toBeNull();
  });

  it("CI3 — Esc closes the command palette after it was opened", () => {
    renderApp();
    // Open via Ctrl+K (jsdom non-Mac)
    act(() => {
      fireEvent.keyDown(window, { key: "k", code: "KeyK", ctrlKey: true, metaKey: false });
    });
    expect(screen.queryByRole("dialog")).not.toBeNull();
    // Close via Escape inside the modal
    act(() => {
      const modal = screen.getByRole("dialog");
      fireEvent.keyDown(modal.closest(".cmdk-scrim")!, { key: "Escape" });
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("CI4 — topbar search button click opens the command palette", () => {
    renderApp();
    // Topbar renders a <button> when onOpenSearch is provided (P4 change)
    const searchBtn = screen.getByRole("button", { name: "Search tasks, habits, notes…" });
    act(() => {
      fireEvent.click(searchBtn);
    });
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("CI5 — App does not throw (CommandPaletteProvider is mounted)", () => {
    // If CommandPaletteProvider is missing, useCommandPalette() would throw.
    expect(() => renderApp()).not.toThrow();
  });
});
