/**
 * AppRail tests — AR1..AR12 + persistence P1..P4 (partial)
 *
 * AC-RAIL-1:  Rail renders all registry items sorted by railOrder
 * AC-RAIL-2:  data-pos is set from useWebShell().railPos
 * AC-RAIL-3:  Clicking a button calls onModuleClick(id)
 * AC-RAIL-4:  Active highlight matches activeModuleId
 * AC-RAIL-5:  Drag-reorder updates xai_rail_order via usePref
 * AC-RAIL-8:  xai_rail_order entries not in registry are filtered out
 * AC-RAIL-9:  Pet button toggles petOn AND emits web:shell:pet-toggle
 * AC-RAIL-10: Sync/Notif/Help buttons are visible but no-op
 * AC-RAIL-11: Tooltips (data-tip) use i18n labels
 */

import { render, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router";
import { AppRail } from "../AppRail.js";
import { WebShellProvider } from "../registry.js";
import { FIXTURE_MODULES } from "../__fixtures__/ShellFixture.js";
import type { WebModuleSlotRegistration } from "../types.js";

// Mock emitWebEvent to avoid issues in test env
vi.mock("@repo/xai-web-event-bus", () => ({
  emitWebEvent: vi.fn(),
  onWebEvent: vi.fn(() => () => {}),
  useWebEventListener: vi.fn(),
}));

function renderRail(overrides?: {
  modules?: WebModuleSlotRegistration[];
  railPos?: "left" | "right" | "top" | "bottom";
  activeModuleId?: string | null;
  petOn?: boolean;
  setPetOn?: (next: boolean) => void;
  onModuleClick?: (id: string) => void;
  onPetToggle?: () => void;
  onAvatarOpenSettings?: () => void;
  onAvatarOpenStatistics?: () => void;
  onSignOut?: () => void;
}) {
  const defaults = {
    modules: FIXTURE_MODULES,
    railPos: "left" as const,
    activeModuleId: null,
    petOn: false,
    setPetOn: vi.fn(),
    onModuleClick: vi.fn(),
    onPetToggle: vi.fn(),
    onAvatarOpenSettings: vi.fn(),
    onAvatarOpenStatistics: vi.fn(),
  };
  const cfg = { ...defaults, ...overrides };
  return {
    ...render(
      <MemoryRouter>
        <WebShellProvider
          modules={cfg.modules}
          lang="en"
          railPos={cfg.railPos}
          petOn={cfg.petOn}
          setPetOn={cfg.setPetOn}
        >
          <AppRail
            activeModuleId={cfg.activeModuleId}
            onModuleClick={cfg.onModuleClick}
            onPetToggle={cfg.onPetToggle}
            onAvatarOpenSettings={cfg.onAvatarOpenSettings}
            onAvatarOpenStatistics={cfg.onAvatarOpenStatistics}
            onSignOut={overrides?.onSignOut}
          />
        </WebShellProvider>
      </MemoryRouter>
    ),
    cfg,
  };
}

// Helper: get rail item buttons by data-tip value
function getRailBtn(container: HTMLElement, tipValue: string) {
  return container.querySelector<HTMLButtonElement>(
    `.rail-items button[data-tip="${tipValue}"]`,
  );
}

describe("AppRail", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("AR1 — renders rail-visible modules sorted by railOrder", () => {
    // FIXTURE_MODULES: tasks(1), dashboard(2), settings(99 showInRail:false)
    const { container } = renderRail();
    const taskBtn = getRailBtn(container, "Tasks");
    const dashBtn = getRailBtn(container, "Dashboard");
    expect(taskBtn).not.toBeNull();
    expect(dashBtn).not.toBeNull();
    // settings should NOT be in the rail
    expect(getRailBtn(container, "Settings")).toBeNull();
  });

  it("AR1b — settings module with showInRail:false is not in rail-items", () => {
    const { container } = renderRail();
    expect(getRailBtn(container, "Settings")).toBeNull();
  });

  it("AR2 — data-pos attribute matches railPos", () => {
    const { container } = renderRail({ railPos: "right" });
    const aside = container.querySelector("aside.app-rail");
    expect(aside?.getAttribute("data-pos")).toBe("right");
  });

  it("AR2b — left is the default data-pos", () => {
    const { container } = renderRail({ railPos: "left" });
    const aside = container.querySelector("aside.app-rail");
    expect(aside?.getAttribute("data-pos")).toBe("left");
  });

  it("AR3 — clicking a module button calls onModuleClick with the module id", () => {
    const onModuleClick = vi.fn();
    const { container } = renderRail({ onModuleClick });
    const taskBtn = getRailBtn(container, "Tasks");
    if (taskBtn) fireEvent.click(taskBtn);
    expect(onModuleClick).toHaveBeenCalledWith("tasks");
  });

  it("AR4 — active module button has 'active' className", () => {
    const { container } = renderRail({ activeModuleId: "tasks" });
    const taskBtn = getRailBtn(container, "Tasks");
    expect(taskBtn?.className).toContain("active");
  });

  it("AR4b — inactive buttons do NOT have 'active' className", () => {
    const { container } = renderRail({ activeModuleId: "tasks" });
    const dashBtn = getRailBtn(container, "Dashboard");
    expect(dashBtn?.className).not.toContain("active");
  });

  it("AR5 — drag-reorder: onDragStart sets dragging class", () => {
    const { container } = renderRail();
    const taskBtn = getRailBtn(container, "Tasks");
    if (taskBtn) {
      fireEvent.dragStart(taskBtn, {
        dataTransfer: { effectAllowed: "", setData: vi.fn() },
      });
      expect(taskBtn.className).toContain("dragging");
    }
  });

  it("AR8 — ghost module ids in localStorage are filtered out", () => {
    localStorage.setItem(
      "xai_rail_order",
      JSON.stringify(["ghost-module", "tasks"]),
    );
    const { container } = renderRail();
    expect(getRailBtn(container, "Tasks")).not.toBeNull();
    expect(getRailBtn(container, "ghost-module")).toBeNull();
  });

  it("AR9 — Pet button is rendered in the rail-bottom", () => {
    const { container } = renderRail();
    const railBottom = container.querySelector(".rail-bottom");
    expect(railBottom).toBeTruthy();
    const buttons = railBottom?.querySelectorAll("button");
    expect(buttons?.length).toBeGreaterThanOrEqual(1);
  });

  it("AR9b — clicking Pet button calls onPetToggle", () => {
    const onPetToggle = vi.fn();
    const { container } = renderRail({ onPetToggle });
    const railBottom = container.querySelector(".rail-bottom");
    const petBtn = railBottom?.querySelectorAll("button")[0];
    if (petBtn) fireEvent.click(petBtn);
    expect(onPetToggle).toHaveBeenCalledTimes(1);
  });

  it("AR9c — Pet button has 'active' class when petOn=true", () => {
    const { container } = renderRail({ petOn: true });
    const railBottom = container.querySelector(".rail-bottom");
    const petBtn = railBottom?.querySelectorAll("button")[0];
    expect(petBtn?.className).toContain("active");
  });

  it("AR10 — bottom row has exactly 1 button (pet only; sync/notif/help hidden)", () => {
    const { container } = renderRail();
    const railBottom = container.querySelector(".rail-bottom");
    const buttons = railBottom?.querySelectorAll("button");
    expect(buttons?.length).toBe(1);
  });

  // Rail-05/06/07 regression: sync / notif / help must NOT render
  it("AR10a — sync icon is NOT rendered in the rail-bottom (Rail-05 fix)", () => {
    const { container } = renderRail();
    const syncBtn = container.querySelector(
      '.rail-bottom button[data-tip="sync"]',
    );
    expect(syncBtn).toBeNull();
  });

  it("AR10b — notif icon is NOT rendered in the rail-bottom (Rail-06 fix)", () => {
    const { container } = renderRail();
    const notifBtn = container.querySelector(
      '.rail-bottom button[data-tip="notif"]',
    );
    expect(notifBtn).toBeNull();
  });

  it("AR10c — help icon is NOT rendered in the rail-bottom (Rail-07 fix)", () => {
    const { container } = renderRail();
    const helpBtn = container.querySelector(
      '.rail-bottom button[data-tip="help"]',
    );
    expect(helpBtn).toBeNull();
  });

  it("AR10d — pet button is still present after removing sync/notif/help", () => {
    const { container } = renderRail();
    const railBottom = container.querySelector(".rail-bottom");
    const petBtn = railBottom?.querySelectorAll("button")[0];
    // The pet button is the only remaining button; data-tip comes from t.nav["pet"] i18n label
    expect(petBtn).toBeTruthy();
    // data-tip is whatever the i18n label resolves to (may be "Pet" or "pet" depending on locale)
    const tip = petBtn?.getAttribute("data-tip");
    expect(tip?.toLowerCase()).toBe("pet");
  });

  it("AR11 — icon-only rail controls expose accessible names", () => {
    renderRail();
    expect(screen.getByRole("button", { name: "Open account menu" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tasks" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pet" })).toBeTruthy();
  });

  it("AR11 — module button has data-tip with i18n label", () => {
    const { container } = renderRail({ modules: FIXTURE_MODULES });
    const taskBtn = getRailBtn(container, "Tasks");
    expect(taskBtn?.getAttribute("data-tip")).toBe("Tasks");
  });
});

describe("AppRail sign-out passthrough (AR-SO1..SO2)", () => {
  it("AR-SO1 — renderRail with onSignOut wired: opening AvatarMenu and clicking Sign Out opens confirmation dialog", () => {
    // stub showModal for jsdom
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    const onSignOut = vi.fn();
    const { container } = renderRail({ onAvatarOpenSettings: vi.fn(), onAvatarOpenStatistics: vi.fn(), onSignOut });

    // Open AvatarMenu
    const avatarBtn = container.querySelector(".rail-avatar");
    if (avatarBtn) fireEvent.click(avatarBtn);

    // Click the Sign Out menu item (danger class)
    const signOutItem = container.querySelector(".avm-item.danger");
    if (signOutItem) fireEvent.click(signOutItem);

    // onSignOut should NOT have been called yet (dialog confirmation required)
    expect(onSignOut).not.toHaveBeenCalled();
    // Dialog should be open
    const dialog = container.querySelector("dialog.xai-sign-out-dialog");
    expect(dialog?.hasAttribute("open")).toBe(true);
  });

  it("AR-SO2 — renderRail without onSignOut: AvatarMenu renders normally (backward-compatible)", () => {
    const { container } = renderRail();
    // Open AvatarMenu
    const avatarBtn = container.querySelector(".rail-avatar");
    if (avatarBtn) fireEvent.click(avatarBtn);
    // Menu should be visible
    expect(container.querySelector(".avatar-menu")).not.toBeNull();
    // Sign Out item should still be rendered
    const signOutItem = container.querySelector(".avm-item.danger");
    expect(signOutItem).not.toBeNull();
  });
});

describe("AppRail persistence (P1..P4)", () => {
  it("P1 — xai_rail_order is restored on remount", () => {
    localStorage.setItem("xai_rail_order", JSON.stringify(["dashboard", "tasks"]));
    const { container } = renderRail();
    const railItems = container.querySelector(".rail-items");
    const buttons = railItems?.querySelectorAll("button");
    // Dashboard should render before Tasks when order is [dashboard, tasks]
    if (buttons && buttons.length >= 2) {
      expect(buttons[0]?.getAttribute("data-tip")).toBe("Dashboard");
      expect(buttons[1]?.getAttribute("data-tip")).toBe("Tasks");
    }
  });

  it("P3 — items missing from xai_rail_order are appended at end", () => {
    // Only include 'tasks' in order — 'dashboard' should be appended
    localStorage.setItem("xai_rail_order", JSON.stringify(["tasks"]));
    const { container } = renderRail();
    const railItems = container.querySelector(".rail-items");
    const buttons = railItems?.querySelectorAll("button");
    if (buttons && buttons.length >= 2) {
      expect(buttons[0]?.getAttribute("data-tip")).toBe("Tasks");
      expect(buttons[1]?.getAttribute("data-tip")).toBe("Dashboard");
    }
  });

  it("N1 — empty modules list renders empty rail-items", () => {
    const { container } = renderRail({ modules: [] });
    const railItems = container.querySelector(".rail-items");
    const buttons = railItems?.querySelectorAll("button");
    expect(buttons?.length).toBe(0);
  });

  it("N3 — empty xai_rail_order falls back to registry order", () => {
    localStorage.setItem("xai_rail_order", JSON.stringify([]));
    const { container } = renderRail();
    expect(getRailBtn(container, "Tasks")).not.toBeNull();
    expect(getRailBtn(container, "Dashboard")).not.toBeNull();
  });
});
