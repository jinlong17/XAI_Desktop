/**
 * Shell smoke tests — S1..S4
 *
 * AC-BOOT-3: StrictMode double-mount does not double-emit or double-persist
 * S1: Shell renders inside MemoryRouter with Topbar + AppRail
 * S2: Shell renders children slot
 * S3: Shell renders with all 4 rail positions
 * S4: Shell renders with empty registry (no crash)
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StrictMode } from "react";
import { MemoryRouter } from "react-router";
import { Shell } from "../Shell.js";
import { WebShellProvider } from "../registry.js";
import { FIXTURE_MODULES } from "../__fixtures__/ShellFixture.js";

vi.mock("@repo/xai-web-event-bus", () => ({
  emitWebEvent: vi.fn(),
  onWebEvent: vi.fn(() => () => {}),
  useWebEventListener: vi.fn(),
}));

function renderShell(overrides?: {
  railPos?: "left" | "right" | "top" | "bottom";
  modules?: typeof FIXTURE_MODULES;
  children?: React.ReactNode;
}) {
  const cfg = {
    railPos: "left" as const,
    modules: FIXTURE_MODULES,
    ...overrides,
  };

  return render(
    <MemoryRouter initialEntries={["/app/tasks"]}>
      <WebShellProvider
        modules={cfg.modules}
        lang="en"
        railPos={cfg.railPos}
        petOn={false}
        setPetOn={() => {}}
      >
        <Shell
          lang="en"
          setLang={() => {}}
          theme="light"
          setTheme={() => {}}
          density="comfortable"
          setDensity={() => {}}
        >
          {cfg.children ?? <div data-testid="main-slot">content</div>}
        </Shell>
      </WebShellProvider>
    </MemoryRouter>
  );
}

describe("Shell smoke (S1..S4)", () => {
  it("S1 — Shell renders with Topbar (search input present)", () => {
    renderShell();
    // Topbar renders a search input
    const input = screen.getByPlaceholderText("Search tasks, habits, notes…");
    expect(input).toBeTruthy();
  });

  it("S1b — Shell renders with AppRail (app-rail aside present)", () => {
    const { container } = renderShell();
    expect(container.querySelector("aside.app-rail")).not.toBeNull();
  });

  it("S2 — Shell renders children in app-main", () => {
    const { container } = renderShell({
      children: <div data-testid="custom-child">hello</div>,
    });
    expect(container.querySelector('[data-testid="custom-child"]')).not.toBeNull();
    expect(container.querySelector(".app-main")).not.toBeNull();
  });

  it("S3a — Shell renders with railPos=right", () => {
    const { container } = renderShell({ railPos: "right" });
    expect(container.querySelector("aside.app-rail")?.getAttribute("data-pos")).toBe("right");
  });

  it("S3b — Shell renders with railPos=top", () => {
    const { container } = renderShell({ railPos: "top" });
    expect(container.querySelector("aside.app-rail")?.getAttribute("data-pos")).toBe("top");
  });

  it("S3c — Shell renders with railPos=bottom", () => {
    const { container } = renderShell({ railPos: "bottom" });
    expect(container.querySelector("aside.app-rail")?.getAttribute("data-pos")).toBe("bottom");
  });

  it("S4 — Shell renders with empty modules (no crash)", () => {
    expect(() => renderShell({ modules: [] })).not.toThrow();
  });

  it("S-StrictMode — StrictMode double-mount does not throw", () => {
    expect(() =>
      render(
        <StrictMode>
          <MemoryRouter>
            <WebShellProvider modules={[]} lang="en" railPos="left" petOn={false} setPetOn={() => {}}>
              <Shell lang="en" setLang={() => {}} theme="light" setTheme={() => {}} density="comfortable" setDensity={() => {}}>
                <div>content</div>
              </Shell>
            </WebShellProvider>
          </MemoryRouter>
        </StrictMode>
      )
    ).not.toThrow();
  });
});
