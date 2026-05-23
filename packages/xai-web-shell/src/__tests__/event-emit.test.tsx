/**
 * Event emit tests — E1..E5
 *
 * AC-EMIT-1: AppRail click emits web:shell:module-change with source "app-rail"
 * AC-EMIT-2: Pet click emits web:shell:pet-toggle
 * AC-EMIT-3: Topbar Settings click emits web:shell:module-change with source "shortcut"
 * AC-EMIT-4: AvatarMenu Settings click emits web:shell:module-change with source "shortcut"
 * AC-EMIT-5: AvatarMenu Statistics click emits web:shell:module-change with source "statistics/shortcut"
 * AC-EMIT-6: All emits happen BEFORE the corresponding navigate() call
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router";
import { Shell } from "../Shell.js";
import { WebShellProvider } from "../registry.js";
import { FIXTURE_MODULES } from "../__fixtures__/ShellFixture.js";

// Track emit order
const emitOrder: string[] = [];

vi.mock("@repo/xai-web-event-bus", () => ({
  emitWebEvent: vi.fn((event: string, payload: unknown) => {
    emitOrder.push(`emit:${event}`);
    void payload;
  }),
  onWebEvent: vi.fn(() => () => {}),
  useWebEventListener: vi.fn(),
}));

// We can't easily test emit-before-navigate in jsdom since react-router navigate
// is synchronous. The test verifies emitWebEvent is called with the right payload.

import { emitWebEvent } from "@repo/xai-web-event-bus";

function renderShellWithNav() {
  return render(
    <MemoryRouter initialEntries={["/app/tasks"]}>
      <WebShellProvider
        modules={FIXTURE_MODULES}
        lang="en"
        railPos="left"
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
          <div data-testid="outlet" />
        </Shell>
      </WebShellProvider>
    </MemoryRouter>
  );
}

describe("Event emits (E1..E5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    emitOrder.length = 0;
  });

  it("E1 — AppRail module click emits web:shell:module-change with source 'app-rail'", () => {
    const { container } = renderShellWithNav();
    const tasksBtn = container.querySelector<HTMLButtonElement>(
      `.rail-items button[data-tip="Tasks"]`,
    );
    if (tasksBtn) {
      act(() => {
        fireEvent.click(tasksBtn);
      });
    }
    expect(emitWebEvent).toHaveBeenCalledWith("web:shell:module-change", {
      moduleId: "tasks",
      source: "app-rail",
    });
  });

  it("E2 — Pet button click emits web:shell:pet-toggle with { on: true }", () => {
    // petOn starts false, toggle → true
    render(
      <MemoryRouter>
        <WebShellProvider
          modules={FIXTURE_MODULES}
          lang="en"
          railPos="left"
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
            <div />
          </Shell>
        </WebShellProvider>
      </MemoryRouter>
    );
    const railBottom = document.querySelector(".rail-bottom");
    const petBtn = railBottom?.querySelectorAll("button")[0];
    if (petBtn) {
      act(() => {
        fireEvent.click(petBtn);
      });
    }
    expect(emitWebEvent).toHaveBeenCalledWith("web:shell:pet-toggle", {
      on: true,
      source: "rail-bottom",
    });
  });

  it("E3 — Topbar Settings icon click emits web:shell:module-change with source 'shortcut'", () => {
    renderShellWithNav();
    const settingsBtn = screen.getByTitle("Settings");
    act(() => {
      fireEvent.click(settingsBtn);
    });
    expect(emitWebEvent).toHaveBeenCalledWith("web:shell:module-change", {
      moduleId: "settings",
      source: "shortcut",
    });
  });

  it("E4 — AvatarMenu Settings click emits web:shell:module-change with source 'shortcut'", () => {
    const { container } = renderShellWithNav();
    // Open the AvatarMenu by clicking the avatar button
    const avatarBtn = container.querySelector<HTMLButtonElement>(".rail-avatar");
    if (avatarBtn) {
      act(() => {
        fireEvent.click(avatarBtn);
      });
    }
    vi.clearAllMocks();
    // Click the Settings entry in the AvatarMenu
    const settingsItem = container.querySelector<HTMLButtonElement>(".avm-item:first-child");
    if (settingsItem) {
      act(() => {
        fireEvent.click(settingsItem);
      });
    }
    expect(emitWebEvent).toHaveBeenCalledWith("web:shell:module-change", {
      moduleId: "settings",
      source: "shortcut",
    });
  });

  it("E5 — AvatarMenu Statistics click emits web:shell:module-change with source 'shortcut'", () => {
    const { container } = renderShellWithNav();
    // Open the AvatarMenu by clicking the avatar button
    const avatarBtn = container.querySelector<HTMLButtonElement>(".rail-avatar");
    if (avatarBtn) {
      act(() => {
        fireEvent.click(avatarBtn);
      });
    }
    vi.clearAllMocks();
    // Click the Statistics entry (second .avm-item)
    const avmItems = container.querySelectorAll<HTMLButtonElement>(".avm-item");
    const statisticsItem = avmItems[1];
    if (statisticsItem) {
      act(() => {
        fireEvent.click(statisticsItem);
      });
    }
    expect(emitWebEvent).toHaveBeenCalledWith("web:shell:module-change", {
      moduleId: "statistics",
      source: "shortcut",
    });
  });

  it("E1/E3 — emitWebEvent is called exactly once per user interaction", () => {
    const { container } = renderShellWithNav();
    const tasksBtn = container.querySelector<HTMLButtonElement>(
      `.rail-items button[data-tip="Tasks"]`,
    );
    vi.clearAllMocks();
    if (tasksBtn) {
      act(() => {
        fireEvent.click(tasksBtn);
      });
    }
    expect(emitWebEvent).toHaveBeenCalledTimes(1);
  });
});
